package com.ufb.consultation_service.service.impl;

import com.ufb.consultation_service.dto.ConsultationMessageCreateRequest;
import com.ufb.consultation_service.dto.ConsultationMessageResponse;
import com.ufb.consultation_service.dto.ConsultationStatusUpdateRequest;
import com.ufb.consultation_service.event.ConsultationEventPublisher;
import com.ufb.consultation_service.exception.BusinessNotFoundException;
import com.ufb.consultation_service.exception.ConsultationNotFoundException;
import com.ufb.consultation_service.exception.IllegalConsultationTransitionException;
import com.ufb.consultation_service.model.Business;
import com.ufb.consultation_service.model.Consultation;
import com.ufb.consultation_service.model.ConsultationMessage;
import com.ufb.consultation_service.model.ConsultationStatus;
import com.ufb.consultation_service.model.Role;
import com.ufb.consultation_service.repository.BusinessRepository;
import com.ufb.consultation_service.repository.ConsultationMessageRepository;
import com.ufb.consultation_service.repository.ConsultationRepository;
import com.ufb.consultation_service.service.ConsultationService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ConsultationServiceImpl implements ConsultationService {

    private final BusinessRepository businessRepository;
    private final ConsultationRepository consultationRepository;
    private final ConsultationMessageRepository messageRepository;
    private final ConsultationEventPublisher eventPublisher;

    @Override
    @Transactional
    public void requestConsultation(String ownerEmail, Long businessId) {
        Business business = businessRepository.findByIdAndOwnerEmail(businessId, ownerEmail)
                .orElseThrow(BusinessNotFoundException::new);
        Consultation consultation = consultationRepository.findByBusinessId(business.getId())
                .orElseThrow(ConsultationNotFoundException::new);

        if (consultation.getStatus() == ConsultationStatus.ADVISED) {
            consultation.setStatus(ConsultationStatus.PENDING);
            consultationRepository.save(consultation);
        }

        eventPublisher.publishConsultationRequested(consultation);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ConsultationMessageResponse> listMessages(String callerEmail, Role callerRole, Long businessId) {
        Consultation consultation = consultationForCaller(callerEmail, callerRole, businessId);
        return messageRepository.findByConsultationIdOrderByCreatedAtAsc(consultation.getId()).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public ConsultationMessageResponse postMessage(String callerEmail, Role callerRole, Long businessId,
                                                     ConsultationMessageCreateRequest request) {
        Consultation consultation = consultationForCaller(callerEmail, callerRole, businessId);

        ConsultationMessage message = ConsultationMessage.builder()
                .consultation(consultation)
                .authorEmail(callerEmail)
                .authorRole(callerRole)
                .body(request.body())
                .build();
        ConsultationMessage saved = messageRepository.save(message);
        return toResponse(saved);
    }

    @Override
    @Transactional
    public void updateStatus(Long consultationId, ConsultationStatusUpdateRequest request, String adminEmail) {
        Consultation consultation = consultationRepository.findById(consultationId)
                .orElseThrow(ConsultationNotFoundException::new);

        ConsultationStatus current = consultation.getStatus();
        ConsultationStatus next = request.status();

        if (next.ordinal() <= current.ordinal()) {
            throw new IllegalConsultationTransitionException(
                    "Cannot move consultation from " + current + " to " + next);
        }

        consultation.setStatus(next);
        consultationRepository.save(consultation);

        if (next == ConsultationStatus.ADVISED) {
            eventPublisher.publishConsultationCompleted(consultation, adminEmail);
        }
    }

    // USER callers must own the business behind the consultation; ADMIN is unrestricted.
    // Not-owned access reuses BusinessNotFoundException so a USER gets 404, not 403 (anti-enumeration).
    private Consultation consultationForCaller(String callerEmail, Role callerRole, Long businessId) {
        Business business = (callerRole == Role.ADMIN
                ? businessRepository.findById(businessId)
                : businessRepository.findByIdAndOwnerEmail(businessId, callerEmail))
                .orElseThrow(BusinessNotFoundException::new);
        return consultationRepository.findByBusinessId(business.getId())
                .orElseThrow(ConsultationNotFoundException::new);
    }

    private ConsultationMessageResponse toResponse(ConsultationMessage m) {
        return new ConsultationMessageResponse(m.getId(), m.getAuthorEmail(), m.getAuthorRole(), m.getBody(), m.getCreatedAt());
    }
}
