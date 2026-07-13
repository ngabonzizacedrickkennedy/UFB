package com.ufb.notification_service.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "user_read_model")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserReadModel {

    @Id
    private Long userId;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(nullable = false)
    private String role;

    @Column(nullable = false)
    private boolean enabled;

    @Column(name = "business_count", nullable = false)
    private int businessCount;

    @Column(name = "business_stage")
    private String businessStage;

    @Column(nullable = false)
    private boolean unsubscribed;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        if (createdAt == null) createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }
}
