package com.ufb.notification_service.service;

import com.ufb.notification_service.model.NotificationRule;
import com.ufb.notification_service.model.UserReadModel;
import com.ufb.notification_service.repository.UserReadModelRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AudienceResolver {

    private final UserReadModelRepository users;

    public List<UserReadModel> resolve(NotificationRule rule) {
        return switch (rule.getAudience()) {
            case ALL -> users.findByEnabledTrueAndUnsubscribedFalse();
            case BY_STAGE -> users.findByEnabledTrueAndUnsubscribedFalseAndBusinessStage(rule.getAudienceStage());
            case NO_BUSINESS -> users.findByEnabledTrueAndUnsubscribedFalseAndBusinessCount(0);
            case HAS_BUSINESS -> users.findByEnabledTrueAndUnsubscribedFalseAndBusinessCountGreaterThan(0);
        };
    }
}
