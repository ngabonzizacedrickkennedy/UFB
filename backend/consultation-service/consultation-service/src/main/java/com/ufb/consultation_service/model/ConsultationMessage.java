package com.ufb.consultation_service.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "consultation_messages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConsultationMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "consultation_id", nullable = false)
    private Consultation consultation;

    // Always the authenticated principal (SecurityContextHolder), never client-supplied -
    // this is what prevents an admin from posting a message "as" the business owner.
    @Column(name = "author_email", nullable = false)
    private String authorEmail;

    @Enumerated(EnumType.STRING)
    @Column(name = "author_role", nullable = false)
    private Role authorRole;

    @Column(nullable = false, columnDefinition = "text")
    private String body;

    // Messages are never edited - createdAt is the only timestamp needed.
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        this.createdAt = Instant.now();
    }
}
