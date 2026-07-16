package com.ufb.consultation_service.repository;

import com.ufb.consultation_service.model.Consultation;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ConsultationRepository extends JpaRepository<Consultation, Long> {
    Optional<Consultation> findByBusinessId(Long businessId);

    List<Consultation> findByBusinessIdIn(Collection<Long> businessIds);
}
