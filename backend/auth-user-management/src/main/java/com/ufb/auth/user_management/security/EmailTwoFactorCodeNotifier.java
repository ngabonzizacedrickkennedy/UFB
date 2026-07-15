package com.ufb.auth.user_management.security;

import java.time.Instant;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class EmailTwoFactorCodeNotifier implements TwoFactorCodeNotifier {

    private final EmailGateway emailGateway;

    public EmailTwoFactorCodeNotifier(EmailGateway emailGateway) {
        this.emailGateway = emailGateway;
    }

    @Override
    public void deliver(String recipientEmail, String rawCode, Instant expiresAt) {
        String html = EmailTemplateBuilder.render(
                "Confirm it's you",
                List.of("Enter the code below to finish signing in to your UFB Consulting account.",
                        "This one-time check only happens on your first login."),
                rawCode,
                null,
                null,
                "This code expires at " + expiresAt + ". If you didn't try to sign in, you can safely ignore this email."
        );
        emailGateway.sendHtml(recipientEmail, "UFB Consulting — Your sign-in code", html);
    }
}
