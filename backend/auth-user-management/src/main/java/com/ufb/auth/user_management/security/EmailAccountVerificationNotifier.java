package com.ufb.auth.user_management.security;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class EmailAccountVerificationNotifier implements AccountVerificationNotifier {

    private final EmailGateway emailGateway;

    @Value("${ufb.frontend.base-url}")
    private String frontendBaseUrl;

    public EmailAccountVerificationNotifier(EmailGateway emailGateway) {
        this.emailGateway = emailGateway;
    }

    @Override
    public void deliver(String recipientEmail, String rawVerificationToken, Instant expiresAt) {
        String encodedEmail = URLEncoder.encode(recipientEmail, StandardCharsets.UTF_8);
        String encodedToken = URLEncoder.encode(rawVerificationToken, StandardCharsets.UTF_8);
        String verifyLink = frontendBaseUrl + "/verify-email?email=" + encodedEmail + "&token=" + encodedToken;

        String html = EmailTemplateBuilder.render(
                "Verify your email",
                List.of("Welcome to UFB Consulting. Confirm this is your email address to activate your account."),
                null,
                "Verify email",
                verifyLink,
                "This link expires at " + expiresAt + ". If you didn't create this account, you can safely ignore this email."
        );
        emailGateway.sendHtml(recipientEmail, "UFB Consulting — Verify your email", html);
    }
}
