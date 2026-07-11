package com.ufb.consultation_service.event;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.ufb.consultation_service.config.RabbitMQConfig;
import com.ufb.consultation_service.model.Business;
import com.ufb.consultation_service.model.Consultation;
import com.ufb.consultation_service.model.Stage;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
@RequiredArgsConstructor
public class ConsultationEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(ConsultationEventPublisher.class);
    private static final ObjectMapper MAPPER = new ObjectMapper().registerModule(new JavaTimeModule());

    private final RabbitTemplate rabbitTemplate;

    public void publishBusinessDescribed(Business business) {
        BusinessDescribedEvent event = new BusinessDescribedEvent(
                "business.described",
                business.getId(),
                business.getOwnerEmail(),
                business.getName(),
                business.getSector(),
                business.getStage(),
                Instant.now()
        );
        publish("business.described", business.getId(), event);
    }

    public void publishConsultationRequested(Consultation consultation) {
        ConsultationRequestedEvent event = new ConsultationRequestedEvent(
                "consultation.requested",
                consultation.getId(),
                consultation.getBusiness().getId(),
                consultation.getBusiness().getOwnerEmail(),
                Instant.now()
        );
        publish("consultation.requested", consultation.getBusiness().getId(), event);
    }

    public void publishConsultationCompleted(Consultation consultation, String adminEmail) {
        ConsultationCompletedEvent event = new ConsultationCompletedEvent(
                "consultation.completed",
                consultation.getId(),
                consultation.getBusiness().getId(),
                consultation.getBusiness().getOwnerEmail(),
                adminEmail,
                Instant.now()
        );
        publish("consultation.completed", consultation.getBusiness().getId(), event);
    }

    public void publishBusinessStageChanged(Business business, Stage oldStage, Stage newStage) {
        BusinessStageChangedEvent event = new BusinessStageChangedEvent(
                "business.stage.changed",
                business.getId(),
                business.getOwnerEmail(),
                business.getSector(),
                oldStage,
                newStage,
                Instant.now()
        );
        publish("business.stage.changed", business.getId(), event);
    }

    private void publish(String routingKey, Long businessId, Object event) {
        try {
            String payload = MAPPER.writeValueAsString(event);
            rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE, routingKey, payload);
            log.info("Published {} for businessId={}", routingKey, businessId);
        } catch (JsonProcessingException ex) {
            log.error("Failed to serialize {} for businessId={}: {}", routingKey, businessId, ex.getMessage());
        } catch (Exception ex) {
            log.error("Failed to publish {} for businessId={}: {}", routingKey, businessId, ex.getMessage());
        }
    }
}
