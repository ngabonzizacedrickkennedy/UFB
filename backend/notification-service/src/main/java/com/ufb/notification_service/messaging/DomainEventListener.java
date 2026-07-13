package com.ufb.notification_service.messaging;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ufb.notification_service.config.RabbitConfig;
import com.ufb.notification_service.model.NotificationRule;
import com.ufb.notification_service.model.TriggerType;
import com.ufb.notification_service.repository.NotificationRuleRepository;
import com.ufb.notification_service.repository.UserReadModelRepository;
import com.ufb.notification_service.service.NotificationEnqueuer;
import com.ufb.notification_service.service.ReadModelService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class DomainEventListener {

    private static final Logger log = LoggerFactory.getLogger(DomainEventListener.class);

    private final ObjectMapper objectMapper;
    private final ReadModelService readModel;
    private final NotificationRuleRepository rules;
    private final NotificationEnqueuer enqueuer;
    private final UserReadModelRepository users;

    @RabbitListener(queues = RabbitConfig.EVENTS_QUEUE)
    public void onEvent(String payload) {
        final JsonNode event;
        try {
            event = objectMapper.readTree(payload);
        } catch (Exception ex) {
            log.error("Unparseable event dropped: {}", ex.getMessage());
            return;
        }

        String type = event.path("eventType").asText("");
        try {
            switch (type) {
                case "user.registered", "user.updated" -> readModel.applyUserUpsert(event);
                case "user.deleted" -> readModel.applyUserDeleted(event);
                case "business.described" -> readModel.applyBusinessDescribed(event);
                case "business.stage.changed" -> readModel.applyStageChanged(event);
                default -> { }
            }
        } catch (Exception ex) {
            log.error("Failed to apply read-model update for {}: {}", type, ex.getMessage());
        }

        fireEventRules(type, event);
    }

    private void fireEventRules(String type, JsonNode event) {
        List<NotificationRule> matching = rules.findByEnabledTrueAndTriggerTypeAndEventType(TriggerType.EVENT, type);
        if (matching.isEmpty()) return;

        EventContext ctx = contextFor(type, event);
        if (ctx == null || ctx.email() == null || ctx.email().isBlank()) return;

        for (NotificationRule rule : matching) {
            String dedupeKey = "rule:" + rule.getId() + ":" + ctx.keyBase();
            enqueuer.enqueue(dedupeKey, ctx.email(), rule.getTemplateCode(), rule.getId(), ctx.variables());
        }
    }

    private EventContext contextFor(String type, JsonNode event) {
        return switch (type) {
            case "user.registered", "user.updated" -> {
                String email = event.path("email").asText(null);
                Map<String, String> vars = baseVars(email, firstName(event.path("fullName").asText("")));
                yield new EventContext(email, type + ":" + event.path("userId").asLong(), vars);
            }
            case "business.described" -> {
                String email = event.path("ownerEmail").asText(null);
                Map<String, String> vars = baseVars(email, resolveFirstName(email));
                vars.put("business", event.path("name").asText(""));
                yield new EventContext(email, type + ":" + event.path("businessId").asLong(), vars);
            }
            case "consultation.requested", "consultation.completed" -> {
                String email = event.path("ownerEmail").asText(null);
                Map<String, String> vars = baseVars(email, resolveFirstName(email));
                yield new EventContext(email, type + ":" + event.path("consultationId").asLong(), vars);
            }
            case "business.stage.changed" -> {
                String email = event.path("ownerEmail").asText(null);
                String newStage = event.path("newStage").asText("");
                Map<String, String> vars = baseVars(email, resolveFirstName(email));
                vars.put("stage", newStage);
                yield new EventContext(email, type + ":" + event.path("businessId").asLong() + ":" + newStage, vars);
            }
            default -> null;
        };
    }

    private Map<String, String> baseVars(String email, String name) {
        Map<String, String> vars = new HashMap<>();
        vars.put("name", name);
        vars.put("email", email == null ? "" : email);
        return vars;
    }

    private String resolveFirstName(String email) {
        if (email == null) return "there";
        return users.findByEmail(email).map(u -> firstName(u.getFullName())).orElse("there");
    }

    private String firstName(String fullName) {
        if (fullName == null || fullName.isBlank()) return "there";
        return fullName.trim().split("\\s+")[0];
    }

    private record EventContext(String email, String keyBase, Map<String, String> variables) {}
}
