package com.ufb.notification_service.messaging;

import com.ufb.notification_service.model.NotificationRule;
import com.ufb.notification_service.model.TriggerType;
import com.ufb.notification_service.model.UserReadModel;
import com.ufb.notification_service.repository.NotificationRuleRepository;
import com.ufb.notification_service.service.AudienceResolver;
import com.ufb.notification_service.service.NotificationEnqueuer;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.scheduling.support.CronExpression;
import org.springframework.stereotype.Component;

import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class NotificationScheduler {

    private static final Logger log = LoggerFactory.getLogger(NotificationScheduler.class);
    private static final ZoneId ZONE = ZoneId.systemDefault();

    private final NotificationRuleRepository rules;
    private final AudienceResolver audienceResolver;
    private final NotificationEnqueuer enqueuer;

    @Scheduled(fixedDelayString = "${ufb.notification.scheduler.tick-ms}")
    public void tick() {
        List<NotificationRule> scheduled = rules.findByEnabledTrueAndTriggerType(TriggerType.SCHEDULE);
        ZonedDateTime now = ZonedDateTime.now(ZONE);

        for (NotificationRule rule : scheduled) {
            if (rule.getCron() == null || rule.getCron().isBlank()) continue;

            final CronExpression cron;
            try {
                cron = CronExpression.parse(rule.getCron());
            } catch (IllegalArgumentException ex) {
                log.warn("Rule {} has invalid cron '{}'", rule.getId(), rule.getCron());
                continue;
            }

            if (rule.getLastFiredAt() == null) {
                rule.setLastFiredAt(now.toInstant());
                rules.save(rule);
                continue;
            }

            ZonedDateTime last = rule.getLastFiredAt().atZone(ZONE);
            ZonedDateTime next = cron.next(last);
            if (next != null && !next.isAfter(now)) {
                fire(rule, next.toEpochSecond());
                rule.setLastFiredAt(now.toInstant());
                rules.save(rule);
            }
        }
    }

    private void fire(NotificationRule rule, long occurrenceEpoch) {
        List<UserReadModel> recipients = audienceResolver.resolve(rule);
        int queued = 0;
        for (UserReadModel user : recipients) {
            Map<String, String> vars = new HashMap<>();
            vars.put("name", firstName(user.getFullName()));
            vars.put("email", user.getEmail());
            vars.put("stage", user.getBusinessStage() == null ? "" : user.getBusinessStage());

            String dedupeKey = "rule:" + rule.getId() + ":" + user.getEmail() + ":" + occurrenceEpoch;
            if (enqueuer.enqueue(dedupeKey, user.getEmail(), rule.getTemplateCode(), rule.getId(), vars)) {
                queued++;
            }
        }
        log.info("Scheduled rule '{}' queued {} of {} recipients", rule.getName(), queued, recipients.size());
    }

    private String firstName(String fullName) {
        if (fullName == null || fullName.isBlank()) return "there";
        return fullName.trim().split("\\s+")[0];
    }
}
