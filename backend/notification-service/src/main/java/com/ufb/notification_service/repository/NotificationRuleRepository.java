package com.ufb.notification_service.repository;

import com.ufb.notification_service.model.NotificationRule;
import com.ufb.notification_service.model.TriggerType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRuleRepository extends JpaRepository<NotificationRule, Long> {
    List<NotificationRule> findByEnabledTrueAndTriggerType(TriggerType triggerType);
    List<NotificationRule> findByEnabledTrueAndTriggerTypeAndEventType(TriggerType triggerType, String eventType);
    long count();
}
