package com.ufb.auth.user_management.security;

import java.time.Instant;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

@Component
public class EmailClaimTokenNotifier implements ClaimTokenNotifier {

    private final JavaMailSender mailSender;

    @Value("${ufb.mail.from}")
    private String fromAddress;

    @Value("${ufb.frontend.base-url}")
    private String frontendBaseUrl;

    public EmailClaimTokenNotifier(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Override
    public void deliver(String recipientEmail, String rawClaimToken, Instant expiresAt) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(recipientEmail);
        message.setSubject("UFB Consulting — Claim your admin account");
        message.setText("""
                Welcome to UFB Consulting.

                An admin account has been created for you. Use the one-time token below to set your password.

                Email       : %s
                Claim token : %s
                Expires     : %s

                Claim your account: %s/claim

                This token is single-use and will expire at the time above.
                """.formatted(recipientEmail, rawClaimToken, expiresAt, frontendBaseUrl));
        mailSender.send(message);
    }
}
