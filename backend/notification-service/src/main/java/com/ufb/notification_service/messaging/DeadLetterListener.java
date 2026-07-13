package com.ufb.notification_service.messaging;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ufb.notification_service.config.RabbitConfig;
import com.ufb.notification_service.dto.SendJobMessage;
import com.ufb.notification_service.model.JobStatus;
import com.ufb.notification_service.repository.NotificationLogRepository;
import com.ufb.notification_service.service.NotificationEventPublisher;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DeadLetterListener {

    private static final Logger log = LoggerFactory.getLogger(DeadLetterListener.class);

    private final ObjectMapper objectMapper;
    private final NotificationLogRepository logs;
    private final NotificationEventPublisher eventPublisher;

    @RabbitListener(queues = RabbitConfig.DEAD_QUEUE)
    public void handle(String payload) {
        SendJobMessage job;
        try {
            job = objectMapper.readValue(payload, SendJobMessage.class);
        } catch (Exception ex) {
            log.error("Unparseable dead-lettered job dropped: {}", ex.getMessage());
            return;
        }

        logs.findByDedupeKey(job.dedupeKey()).ifPresent(entry -> {
            entry.setStatus(JobStatus.DEAD);
            logs.save(entry);
        });

        log.error("Job dead-lettered after retries: {} -> {}", job.dedupeKey(), job.recipientEmail());
        eventPublisher.publishFailed(job.recipientEmail(), job.templateCode(), job.dedupeKey(), "dead-lettered");
    }
}
