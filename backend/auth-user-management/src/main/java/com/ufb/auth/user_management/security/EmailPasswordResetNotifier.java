package com.ufb.auth.user_management.security;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class EmailPasswordResetNotifier implements PasswordResetNotifier {

    private final EmailGateway emailGateway;

    @Value("${ufb.frontend.base-url}")
    private String frontendBaseUrl;

    public EmailPasswordResetNotifier(EmailGateway emailGateway) {
        this.emailGateway = emailGateway;
    }

    @Override
    public void deliver(String recipientEmail, String rawResetToken, Instant expiresAt) {
        String encodedEmail = URLEncoder.encode(recipientEmail, StandardCharsets.UTF_8);
        String encodedToken = URLEncoder.encode(rawResetToken, StandardCharsets.UTF_8);
        String resetLink = frontendBaseUrl + "/reset-password?email=" + encodedEmail + "&token=" + encodedToken;

        String html = EmailTemplateBuilder.render(
                "Reset your password",
                List.of("We received a request to reset the password on your UFB Consulting account."),
                null,
                "Reset password",
                resetLink,
                "This link expires at " + expiresAt + ". If you didn't request this, you can safely ignore this email — your password will not change."
        );
        emailGateway.sendHtml(recipientEmail, "UFB Consulting — Reset your password", html);
    }
}
