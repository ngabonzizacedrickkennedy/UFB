package com.ufb.consultation_service.service.impl;

import com.ufb.consultation_service.dto.BusinessCreateRequest;
import com.ufb.consultation_service.dto.BusinessResponse;
import com.ufb.consultation_service.dto.ConsultationSummary;
import com.ufb.consultation_service.event.ConsultationEventPublisher;
import com.ufb.consultation_service.exception.BusinessNotFoundException;
import com.ufb.consultation_service.model.Business;
import com.ufb.consultation_service.model.Consultation;
import com.ufb.consultation_service.model.ConsultationStatus;
import com.ufb.consultation_service.model.Sector;
import com.ufb.consultation_service.model.Stage;
import com.ufb.consultation_service.repository.BusinessRepository;
import com.ufb.consultation_service.repository.ConsultationRepository;
import com.ufb.consultation_service.service.BusinessService;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BusinessServiceImpl implements BusinessService {

    private final BusinessRepository businessRepository;
    private final ConsultationRepository consultationRepository;
    private final ConsultationEventPublisher eventPublisher;

    @Override
    @Transactional
    public BusinessResponse create(String ownerEmail, BusinessCreateRequest request) {
        Business business = Business.builder()
                .ownerEmail(ownerEmail)
                .name(request.name())
                .sector(request.sector())
                .stage(request.stage())
                .description(request.description())
                .needs(request.needs())
                .build();
        Business saved = businessRepository.save(business);

        Consultation consultation = Consultation.builder()
                .business(saved)
                .status(ConsultationStatus.PENDING)
                .build();
        Consultation savedConsultation = consultationRepository.save(consultation);

        eventPublisher.publishBusinessDescribed(saved);

        return toResponse(saved, savedConsultation);
    }

    @Override
    @Transactional
    public BusinessResponse update(String ownerEmail, Long id, BusinessCreateRequest request) {
        Business business = businessRepository.findByIdAndOwnerEmail(id, ownerEmail)
                .orElseThrow(BusinessNotFoundException::new);

        Stage oldStage = business.getStage();

        business.setName(request.name());
        business.setSector(request.sector());
        business.setStage(request.stage());
        business.setDescription(request.description());
        business.setNeeds(request.needs());
        Business saved = businessRepository.save(business);

        if (oldStage != saved.getStage()) {
            eventPublisher.publishBusinessStageChanged(saved, oldStage, saved.getStage());
        }
        eventPublisher.publishBusinessDescribed(saved);

        Consultation consultation = consultationRepository.findByBusinessId(saved.getId())
                .orElseThrow(BusinessNotFoundException::new);
        return toResponse(saved, consultation);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BusinessResponse> listForOwner(String ownerEmail) {
        List<Business> businesses = businessRepository.findByOwnerEmail(ownerEmail);
        Map<Long, Consultation> byBusinessId = consultationsByBusinessId(businesses);
        return businesses.stream()
                .map(b -> toResponse(b, byBusinessId.get(b.getId())))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public BusinessResponse getForOwner(String ownerEmail, Long id) {
        Business business = businessRepository.findByIdAndOwnerEmail(id, ownerEmail)
                .orElseThrow(BusinessNotFoundException::new);
        return toResponse(business, consultationRepository.findByBusinessId(business.getId()).orElse(null));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BusinessResponse> listForAdmin(Sector sector, Stage stage, Pageable pageable) {
        Page<Business> page = businessRepository.findForAdmin(sector, stage, pageable);
        Map<Long, Consultation> byBusinessId = consultationsByBusinessId(page.getContent());
        return page.map(b -> toResponse(b, byBusinessId.get(b.getId())));
    }

    @Override
    @Transactional(readOnly = true)
    public BusinessResponse getForAdmin(Long id) {
        Business business = businessRepository.findById(id)
                .orElseThrow(BusinessNotFoundException::new);
        return toResponse(business, consultationRepository.findByBusinessId(business.getId()).orElse(null));
    }

    private Map<Long, Consultation> consultationsByBusinessId(List<Business> businesses) {
        if (businesses.isEmpty()) {
            return Map.of();
        }
        List<Long> ids = businesses.stream().map(Business::getId).toList();
        return consultationRepository.findByBusinessIdIn(ids).stream()
                .collect(Collectors.toMap(c -> c.getBusiness().getId(), Function.identity(), (a, b) -> a));
    }

    private BusinessResponse toResponse(Business b, Consultation c) {
        return new BusinessResponse(
                b.getId(),
                b.getOwnerEmail(),
                b.getName(),
                b.getSector(),
                b.getStage(),
                b.getDescription(),
                b.getNeeds(),
                c == null ? null : new ConsultationSummary(c.getId(), c.getStatus()),
                b.getCreatedAt(),
                b.getUpdatedAt()
        );
    }
}
