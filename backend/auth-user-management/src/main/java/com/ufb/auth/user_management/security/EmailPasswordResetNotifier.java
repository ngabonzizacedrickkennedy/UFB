package com.ufb.auth.user_management.security;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

@Component
public class EmailPasswordResetNotifier implements PasswordResetNotifier {

    private final JavaMailSender mailSender;

    @Value("${ufb.mail.from}")
    private String fromAddress;

    @Value("${ufb.frontend.base-url}")
    private String frontendBaseUrl;

    public EmailPasswordResetNotifier(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Override
    public void deliver(String recipientEmail, String rawResetToken, Instant expiresAt) {
        String encodedEmail = URLEncoder.encode(recipientEmail, StandardCharsets.UTF_8);
        String encodedToken = URLEncoder.encode(rawResetToken, StandardCharsets.UTF_8);
        String resetLink = frontendBaseUrl + "/reset-password?email=" + encodedEmail + "&token=" + encodedToken;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(recipientEmail);
        message.setSubject("UFB Consulting — Reset your password");
        message.setText("""
                We received a request to reset the password on your UFB Consulting account.

                Email       : %s
                Reset token : %s
                Expires     : %s

                Reset your password: %s

                If you didn't request this, you can safely ignore this email — your password will not change.
                """.formatted(recipientEmail, rawResetToken, expiresAt, resetLink));
        mailSender.send(message);
    }
}
