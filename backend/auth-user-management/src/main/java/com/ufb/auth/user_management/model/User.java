package com.ufb.auth.user_management.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    // Nullable: a seeded-but-unclaimed admin has no password until they claim the account
    @Column(nullable = true)
    private String password;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(nullable = false)
    private boolean enabled;

    // False until the account owner has set their own password (true for normal signups)
    @Column(name = "password_set", nullable = false)
    private boolean passwordSet;

    // SHA-256 hash of the one-time claim token; null once claimed or for normal users
    @Column(name = "claim_token_hash")
    private String claimTokenHash;

    // When the claim token stops being valid; null once claimed or for normal users
    @Column(name = "claim_token_expires_at")
    private Instant claimTokenExpiresAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
        if (this.role == null) this.role = Role.USER;
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = Instant.now();
    }
}
