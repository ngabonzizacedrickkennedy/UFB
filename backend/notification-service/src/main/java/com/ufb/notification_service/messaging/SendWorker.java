package com.ufb.notification_service.messaging;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ufb.notification_service.config.RabbitConfig;
import com.ufb.notification_service.dto.SendJobMessage;
import com.ufb.notification_service.model.JobStatus;
import com.ufb.notification_service.model.NotificationLog;
import com.ufb.notification_service.model.NotificationTemplate;
import com.ufb.notification_service.repository.NotificationLogRepository;
import com.ufb.notification_service.repository.NotificationTemplateRepository;
import com.ufb.notification_service.service.EmailSender;
import com.ufb.notification_service.service.NotificationEventPublisher;
import com.ufb.notification_service.service.TemplateRenderer;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
@RequiredArgsConstructor
public class SendWorker {

    private static final Logger log = LoggerFactory.getLogger(SendWorker.class);

    private final ObjectMapper objectMapper;
    private final NotificationLogRepository logs;
    private final NotificationTemplateRepository templates;
    private final TemplateRenderer renderer;
    private final EmailSender emailSender;
    private final NotificationEventPublisher eventPublisher;

    @RabbitListener(queues = RabbitConfig.WORK_QUEUE)
    public void handle(String payload) {
        final SendJobMessage job;
        try {
            job = objectMapper.readValue(payload, SendJobMessage.class);
        } catch (Exception ex) {
            log.error("Unparseable send job dropped: {}", ex.getMessage());
            return;
        }

        NotificationLog entry = logs.findByDedupeKey(job.dedupeKey()).orElse(null);
        if (entry != null && entry.getStatus() == JobStatus.SENT) {
            return;
        }

        NotificationTemplate template = templates.findByCode(job.templateCode()).orElse(null);
        if (template == null) {
            log.warn("Send job {} references missing template '{}', dropping", job.dedupeKey(), job.templateCode());
            return;
        }

        try {
            String subject = renderer.applyVariables(template.getSubject(), job.variables());
            String html = renderer.renderEmail(job.recipientEmail(), template.getHtmlBody(), job.variables());

            emailSender.send(job.recipientEmail(), subject, html);

            if (entry != null) {
                entry.setStatus(JobStatus.SENT);
                entry.setSentAt(Instant.now());
                entry.setAttempts(entry.getAttempts() + 1);
                logs.save(entry);
            }
            eventPublisher.publishSent(job.recipientEmail(), job.templateCode(), job.dedupeKey());
        } catch (Exception ex) {
            if (entry != null) {
                entry.setStatus(JobStatus.FAILED);
                entry.setAttempts(entry.getAttempts() + 1);
                entry.setError(ex.getMessage());
                logs.save(entry);
            }
            log.warn("Send failed for {} (will retry/dead-letter): {}", job.recipientEmail(), ex.getMessage());
            throw new RuntimeException("Send failed for " + job.dedupeKey(), ex);
        }
    }
}
