package com.ufb.notification_service.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "notification_rule")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "template_code", nullable = false)
    private String templateCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Audience audience;

    // Only used when audience = BY_STAGE (e.g. "STARTUP")
    @Column(name = "audience_stage")
    private String audienceStage;

    @Enumerated(EnumType.STRING)
    @Column(name = "trigger_type", nullable = false)
    private TriggerType triggerType;

    // For EVENT triggers: the routing key that fires this rule (e.g. "user.registered")
    @Column(name = "event_type")
    private String eventType;

    // For SCHEDULE triggers: a Spring cron expression (e.g. "0 0 8 * * MON")
    @Column(name = "cron")
    private String cron;

    @Column(name = "last_fired_at")
    private Instant lastFiredAt;

    @Column(nullable = false)
    private boolean enabled;
}
