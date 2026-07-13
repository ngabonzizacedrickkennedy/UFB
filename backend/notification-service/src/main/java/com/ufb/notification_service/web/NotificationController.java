package com.ufb.notification_service.web;

import com.ufb.notification_service.model.JobStatus;
import com.ufb.notification_service.model.NotificationLog;
import com.ufb.notification_service.repository.NotificationLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationLogRepository logs;

    public record NotificationView(Long id, String subject, String templateCode, Instant createdAt, boolean read) {}

    @GetMapping
    public Map<String, Object> feed(Authentication authentication) {
        String email = authentication.getName();
        List<NotificationView> items = logs
                .findTop30ByRecipientEmailAndStatusOrderByCreatedAtDesc(email, JobStatus.SENT)
                .stream()
                .map(this::toView)
                .toList();
        long unread = logs.countByRecipientEmailAndStatusAndReadAtIsNull(email, JobStatus.SENT);
        return Map.of("items", items, "unread", unread);
    }

    @PostMapping("/read")
    @Transactional
    public Map<String, Object> markAllRead(Authentication authentication) {
        String email = authentication.getName();
        List<NotificationLog> unread = logs.findByRecipientEmailAndStatusAndReadAtIsNull(email, JobStatus.SENT);
        Instant now = Instant.now();
        unread.forEach(n -> n.setReadAt(now));
        logs.saveAll(unread);
        return Map.of("marked", unread.size());
    }

    private NotificationView toView(NotificationLog n) {
        return new NotificationView(n.getId(), n.getSubject(), n.getTemplateCode(), n.getCreatedAt(), n.getReadAt() != null);
    }
}
