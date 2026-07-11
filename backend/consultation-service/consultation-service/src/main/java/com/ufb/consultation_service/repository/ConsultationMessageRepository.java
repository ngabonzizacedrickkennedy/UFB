package com.ufb.consultation_service.repository;

import com.ufb.consultation_service.model.ConsultationMessage;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ConsultationMessageRepository extends JpaRepository<ConsultationMessage, Long> {
    List<ConsultationMessage> findByConsultationIdOrderByCreatedAtAsc(Long consultationId);
}
