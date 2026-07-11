package com.ufb.auth.user_management.event;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.ufb.auth.user_management.config.RabbitMQConfig;
import com.ufb.auth.user_management.model.User;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
@RequiredArgsConstructor
public class UserEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(UserEventPublisher.class);
    private static final ObjectMapper MAPPER = new ObjectMapper().registerModule(new JavaTimeModule());

    private final RabbitTemplate rabbitTemplate;

    public void publishRegistered(User user) {
        publish("user.registered", user);
    }

    public void publishUpdated(User user) {
        publish("user.updated", user);
    }

    public void publishDeleted(User user) {
        publish("user.deleted", user);
    }

    private void publish(String routingKey, User user) {
        UserEvent event = new UserEvent(
                routingKey,
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                user.isEnabled(),
                Instant.now()
        );
        try {
            String payload = MAPPER.writeValueAsString(event);
            rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE, routingKey, payload);
            log.info("Published {} for userId={}", routingKey, user.getId());
        } catch (JsonProcessingException ex) {
            log.error("Failed to serialize {} for userId={}: {}", routingKey, user.getId(), ex.getMessage());
        } catch (Exception ex) {
            log.error("Failed to publish {} for userId={}: {}", routingKey, user.getId(), ex.getMessage());
        }
    }
}
