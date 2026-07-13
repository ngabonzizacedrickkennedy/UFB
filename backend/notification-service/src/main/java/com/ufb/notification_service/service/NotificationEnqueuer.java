package com.ufb.notification_service.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ufb.notification_service.config.RabbitConfig;
import com.ufb.notification_service.dto.SendJobMessage;
import com.ufb.notification_service.model.JobStatus;
import com.ufb.notification_service.model.NotificationLog;
import com.ufb.notification_service.model.NotificationTemplate;
import com.ufb.notification_service.repository.NotificationLogRepository;
import com.ufb.notification_service.repository.NotificationTemplateRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class NotificationEnqueuer {

    private static final Logger log = LoggerFactory.getLogger(NotificationEnqueuer.class);

    private final NotificationLogRepository logs;
    private final NotificationTemplateRepository templates;
    private final RabbitTemplate rabbitTemplate;
    private final ObjectMapper objectMapper;
    private final TemplateRenderer templateRenderer;

    @Transactional
    public boolean enqueue(String dedupeKey, String recipientEmail, String templateCode, Long ruleId, Map<String, String> variables) {
        if (logs.existsByDedupeKey(dedupeKey)) {
            return false;
        }

        NotificationTemplate template = templates.findByCode(templateCode).orElse(null);
        if (template == null) {
            log.warn("Skipping enqueue: template '{}' not found for {}", templateCode, recipientEmail);
            return false;
        }

        String subject = templateRenderer.applyVariables(template.getSubject(), variables);

        NotificationLog entry = NotificationLog.builder()
                .dedupeKey(dedupeKey)
                .recipientEmail(recipientEmail)
                .templateCode(templateCode)
                .ruleId(ruleId)
                .subject(subject)
                .status(JobStatus.QUEUED)
                .attempts(0)
                .createdAt(Instant.now())
                .build();

        try {
            logs.saveAndFlush(entry);
        } catch (DataIntegrityViolationException ex) {
            return false;
        }

        try {
            SendJobMessage message = new SendJobMessage(dedupeKey, recipientEmail, templateCode, ruleId, variables);
            rabbitTemplate.convertAndSend(RabbitConfig.WORK_QUEUE, objectMapper.writeValueAsString(message));
            return true;
        } catch (Exception ex) {
            log.error("Failed to publish work job {}: {}", dedupeKey, ex.getMessage());
            throw new RuntimeException(ex);
        }
    }
}
