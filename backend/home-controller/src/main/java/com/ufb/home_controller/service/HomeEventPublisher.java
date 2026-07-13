package com.ufb.home_controller.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ufb.home_controller.config.RabbitConfig;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.core.MessageDeliveryMode;
import org.springframework.amqp.rabbit.connection.CorrelationData;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Component
@RequiredArgsConstructor
public class HomeEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(HomeEventPublisher.class);
    private static final String ROUTING_KEY = "home.content.published";

    private final RabbitTemplate rabbitTemplate;
    private final ObjectMapper objectMapper;

    public void publishPublished(int version) {
        try {
            String payload = objectMapper.writeValueAsString(Map.of(
                    "eventType", ROUTING_KEY,
                    "version", version,
                    "occurredAt", Instant.now().toString()
            ));

            CorrelationData correlation = new CorrelationData("home-content-v" + version);
            rabbitTemplate.convertAndSend(RabbitConfig.EXCHANGE, ROUTING_KEY, payload, message -> {
                message.getMessageProperties().setDeliveryMode(MessageDeliveryMode.PERSISTENT);
                return message;
            }, correlation);

            CorrelationData.Confirm confirm = correlation.getFuture().get(5, TimeUnit.SECONDS);
            if (confirm == null || !confirm.ack()) {
                log.error("Broker did not confirm home.content.published v{}", version);
            } else {
                log.info("Published & confirmed home.content.published v{}", version);
            }
        } catch (Exception ex) {
            log.error("Failed to publish home.content.published v{}: {}", version, ex.getMessage());
        }
    }
}
