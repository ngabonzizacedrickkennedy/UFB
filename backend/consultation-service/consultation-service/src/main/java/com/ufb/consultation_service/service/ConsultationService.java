package com.ufb.consultation_service.service;

import com.ufb.consultation_service.dto.ConsultationMessageCreateRequest;
import com.ufb.consultation_service.dto.ConsultationMessageResponse;
import com.ufb.consultation_service.dto.ConsultationStatusUpdateRequest;
import com.ufb.consultation_service.model.Role;
import java.util.List;

public interface ConsultationService {
    void requestConsultation(String ownerEmail, Long businessId);
    List<ConsultationMessageResponse> listMessages(String callerEmail, Role callerRole, Long businessId);
    ConsultationMessageResponse postMessage(String callerEmail, Role callerRole, Long businessId, ConsultationMessageCreateRequest request);
    void updateStatus(Long consultationId, ConsultationStatusUpdateRequest request, String adminEmail);
}
