package com.ufb.consultation_service.event;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.ufb.consultation_service.model.Business;
import com.ufb.consultation_service.model.Consultation;
import com.ufb.consultation_service.model.Stage;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
@RequiredArgsConstructor
public class ConsultationEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(ConsultationEventPublisher.class);
    private static final ObjectMapper MAPPER = new ObjectMapper().registerModule(new JavaTimeModule());

    private final KafkaTemplate<String, String> kafkaTemplate;

    @Value("${ufb.kafka.topic.business-described}")
    private String businessDescribedTopic;

    @Value("${ufb.kafka.topic.consultation-requested}")
    private String consultationRequestedTopic;

    @Value("${ufb.kafka.topic.consultation-completed}")
    private String consultationCompletedTopic;

    @Value("${ufb.kafka.topic.business-stage-changed}")
    private String businessStageChangedTopic;

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
        publish(businessDescribedTopic, "business.described", business.getId(), event);
    }

    public void publishConsultationRequested(Consultation consultation) {
        ConsultationRequestedEvent event = new ConsultationRequestedEvent(
                "consultation.requested",
                consultation.getId(),
                consultation.getBusiness().getId(),
                consultation.getBusiness().getOwnerEmail(),
                Instant.now()
        );
        publish(consultationRequestedTopic, "consultation.requested", consultation.getBusiness().getId(), event);
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
        publish(consultationCompletedTopic, "consultation.completed", consultation.getBusiness().getId(), event);
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
        publish(businessStageChangedTopic, "business.stage.changed", business.getId(), event);
    }

    private void publish(String topic, String eventType, Long businessId, Object event) {
        try {
            String payload = MAPPER.writeValueAsString(event);
            kafkaTemplate.send(topic, String.valueOf(businessId), payload);
            log.info("Published {} for businessId={}", eventType, businessId);
        } catch (JsonProcessingException ex) {
            log.error("Failed to serialize {} for businessId={}: {}", eventType, businessId, ex.getMessage());
        } catch (Exception ex) {
            log.error("Failed to publish {} for businessId={}: {}", eventType, businessId, ex.getMessage());
        }
    }
}
