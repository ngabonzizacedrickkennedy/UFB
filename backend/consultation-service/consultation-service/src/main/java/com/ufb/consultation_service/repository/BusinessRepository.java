package com.ufb.consultation_service.repository;

import com.ufb.consultation_service.model.Business;
import com.ufb.consultation_service.model.Sector;
import com.ufb.consultation_service.model.Stage;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BusinessRepository extends JpaRepository<Business, Long> {

    List<Business> findByOwnerEmail(String ownerEmail);

    Optional<Business> findByIdAndOwnerEmail(Long id, String ownerEmail);

    @Query("""
            SELECT b FROM Business b
            WHERE (:sector IS NULL OR b.sector = :sector)
              AND (:stage IS NULL OR b.stage = :stage)
            """)
    Page<Business> findForAdmin(@Param("sector") Sector sector, @Param("stage") Stage stage, Pageable pageable);
}
