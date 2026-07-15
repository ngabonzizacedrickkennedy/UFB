package com.ufb.auth.user_management.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@Component
public class EmailGateway {

    private static final Logger log = LoggerFactory.getLogger(EmailGateway.class);
    private static final String ENDPOINT = "https://api.resend.com/emails";
    private static final ObjectMapper MAPPER = new ObjectMapper();

    private final HttpClient http = HttpClient.newHttpClient();

    @Value("${ufb.mail.from}")
    private String from;

    @Value("${RESEND_API_KEY:}")
    private String apiKey;

    public void sendHtml(String to, String subject, String html) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("RESEND_API_KEY is not set");
        }
        try {
            String payload = MAPPER.writeValueAsString(Map.of(
                    "from", from,
                    "to", List.of(to),
                    "subject", subject,
                    "html", html));

            HttpRequest request = HttpRequest.newBuilder(URI.create(ENDPOINT))
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(payload, StandardCharsets.UTF_8))
                    .build();

            HttpResponse<String> response = http.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 300) {
                throw new IllegalStateException("Resend responded " + response.statusCode() + ": " + response.body());
            }
            log.info("Sent email to {} via Resend", to);
        } catch (IOException ex) {
            throw new IllegalStateException("Failed to send email to " + to, ex);
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Interrupted while sending email to " + to, ex);
        }
    }
}
