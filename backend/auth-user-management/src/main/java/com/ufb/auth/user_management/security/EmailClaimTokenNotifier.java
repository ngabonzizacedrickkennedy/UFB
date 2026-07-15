package com.ufb.auth.user_management.security;

import java.time.Instant;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class EmailClaimTokenNotifier implements ClaimTokenNotifier {

    private final EmailGateway emailGateway;

    @Value("${ufb.frontend.base-url}")
    private String frontendBaseUrl;

    public EmailClaimTokenNotifier(EmailGateway emailGateway) {
        this.emailGateway = emailGateway;
    }

    @Override
    public void deliver(String recipientEmail, String rawClaimToken, Instant expiresAt) {
        String html = EmailTemplateBuilder.render(
                "Claim your admin account",
                List.of("An admin account has been created for you. Use the one-time token below to set your password."),
                rawClaimToken,
                "Claim account",
                frontendBaseUrl + "/claim",
                "This token is single-use and expires at " + expiresAt + "."
        );
        emailGateway.sendHtml(recipientEmail, "UFB Consulting — Claim your admin account", html);
    }
}
