package com.ufb.notification_service.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ufb.notification_service.config.RabbitConfig;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class NotificationEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(NotificationEventPublisher.class);

    private final RabbitTemplate rabbitTemplate;
    private final ObjectMapper objectMapper;

    public void publishSent(String recipientEmail, String templateCode, String dedupeKey) {
        publish("notification.sent", recipientEmail, templateCode, dedupeKey, null);
    }

    public void publishFailed(String recipientEmail, String templateCode, String dedupeKey, String error) {
        publish("notification.failed", recipientEmail, templateCode, dedupeKey, error);
    }

    private void publish(String routingKey, String email, String templateCode, String dedupeKey, String error) {
        try {
            Map<String, Object> event = new java.util.HashMap<>();
            event.put("eventType", routingKey);
            event.put("recipientEmail", email);
            event.put("templateCode", templateCode);
            event.put("dedupeKey", dedupeKey);
            event.put("error", error);
            event.put("occurredAt", Instant.now().toString());
            rabbitTemplate.convertAndSend(RabbitConfig.EXCHANGE, routingKey, objectMapper.writeValueAsString(event));
        } catch (Exception ex) {
            log.error("Failed to publish {} for {}: {}", routingKey, email, ex.getMessage());
        }
    }
}
