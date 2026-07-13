package com.ufb.notification_service.repository;

import com.ufb.notification_service.model.JobStatus;
import com.ufb.notification_service.model.NotificationLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface NotificationLogRepository extends JpaRepository<NotificationLog, Long> {
    boolean existsByDedupeKey(String dedupeKey);
    Optional<NotificationLog> findByDedupeKey(String dedupeKey);
    List<NotificationLog> findTop30ByRecipientEmailAndStatusOrderByCreatedAtDesc(String recipientEmail, JobStatus status);
    long countByRecipientEmailAndStatusAndReadAtIsNull(String recipientEmail, JobStatus status);
    List<NotificationLog> findByRecipientEmailAndStatusAndReadAtIsNull(String recipientEmail, JobStatus status);
}
