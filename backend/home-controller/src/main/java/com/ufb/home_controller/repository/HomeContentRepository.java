package com.ufb.home_controller.repository;

import com.ufb.home_controller.model.ContentStatus;
import com.ufb.home_controller.model.HomeContent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface HomeContentRepository extends JpaRepository<HomeContent, Long> {
    Optional<HomeContent> findFirstByStatusOrderByVersionDesc(ContentStatus status);
}
