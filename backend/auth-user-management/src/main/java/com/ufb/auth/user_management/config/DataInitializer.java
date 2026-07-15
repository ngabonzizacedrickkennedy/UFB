package com.ufb.auth.user_management.config;

import com.ufb.auth.user_management.model.Role;
import com.ufb.auth.user_management.model.User;
import com.ufb.auth.user_management.repository.UserRepository;
import com.ufb.auth.user_management.security.ClaimTokenNotifier;
import com.ufb.auth.user_management.security.OneTimeTokens;
import com.ufb.auth.user_management.security.TokenHasher;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Component
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final ClaimTokenNotifier claimTokenNotifier;

    @Value("${ufb.admin.email}")
    private String adminEmail;

    @Value("${ufb.admin.full-name}")
    private String adminFullName;

    @Value("${ufb.admin.claim-token-expiry-hours}")
    private long claimTokenExpiryHours;

    @Override
    public void run(ApplicationArguments args) {
        if (userRepository.existsByEmail(adminEmail)) {
            return;
        }

        String rawToken = OneTimeTokens.generate();

        Instant expiresAt = Instant.now().plus(claimTokenExpiryHours, ChronoUnit.HOURS);

        User admin = User.builder()
                .email(adminEmail)
                .fullName(adminFullName)
                .password(null)
                .role(Role.ADMIN)
                .enabled(true)
                .passwordSet(false)
                .claimTokenHash(TokenHasher.sha256(rawToken))
                .claimTokenExpiresAt(expiresAt)
                .build();

        userRepository.save(admin);

        try {
            claimTokenNotifier.deliver(adminEmail, rawToken, expiresAt);
            log.info("Seeded unclaimed admin account: {} (claim within {} hours)",
                    adminEmail, claimTokenExpiryHours);
        } catch (Exception ex) {
            log.warn("Seeded admin {} but the claim email could not be sent ({}). "
                            + "Claim manually within {} hours using this one-time token: {}",
                    adminEmail, ex.getMessage(), claimTokenExpiryHours, rawToken);
        }
    }
}
