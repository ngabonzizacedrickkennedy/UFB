package com.ufb.auth.user_management.security;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

@Component
public class EmailAccountVerificationNotifier implements AccountVerificationNotifier {

    private final JavaMailSender mailSender;

    @Value("${ufb.mail.from}")
    private String fromAddress;

    @Value("${ufb.frontend.base-url}")
    private String frontendBaseUrl;

    public EmailAccountVerificationNotifier(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Override
    public void deliver(String recipientEmail, String rawVerificationToken, Instant expiresAt) {
        String encodedEmail = URLEncoder.encode(recipientEmail, StandardCharsets.UTF_8);
        String encodedToken = URLEncoder.encode(rawVerificationToken, StandardCharsets.UTF_8);
        String verifyLink = frontendBaseUrl + "/verify-email?email=" + encodedEmail + "&token=" + encodedToken;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(recipientEmail);
        message.setSubject("UFB Consulting — Verify your email");
        message.setText("""
                Welcome to UFB Consulting.

                Confirm this is your email address to activate your account.

                Email       : %s
                Verify link : %s
                Expires     : %s

                If you didn't create this account, you can safely ignore this email.
                """.formatted(recipientEmail, verifyLink, expiresAt));
        mailSender.send(message);
    }
}
