package com.ufb.notification_service.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.ufb.notification_service.model.UserReadModel;
import com.ufb.notification_service.repository.UserReadModelRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class ReadModelService {

    private final UserReadModelRepository users;

    @Transactional
    public void applyUserUpsert(JsonNode event) {
        Long userId = event.path("userId").asLong();
        String email = event.path("email").asText();
        UserReadModel user = users.findById(userId).orElseGet(() -> UserReadModel.builder()
                .userId(userId)
                .businessCount(0)
                .unsubscribed(false)
                .createdAt(Instant.now())
                .build());
        user.setEmail(email);
        user.setFullName(event.path("fullName").asText(""));
        user.setRole(event.path("role").asText("USER"));
        user.setEnabled(event.path("enabled").asBoolean(true));
        users.save(user);
    }

    @Transactional
    public void applyUserDeleted(JsonNode event) {
        Long userId = event.path("userId").asLong();
        users.findById(userId).ifPresent(users::delete);
    }

    @Transactional
    public void applyBusinessDescribed(JsonNode event) {
        String ownerEmail = event.path("ownerEmail").asText();
        String stage = event.path("stage").asText(null);
        users.findByEmail(ownerEmail).ifPresent(user -> {
            user.setBusinessCount(user.getBusinessCount() + 1);
            if (stage != null) user.setBusinessStage(stage);
            users.save(user);
        });
    }

    @Transactional
    public void applyStageChanged(JsonNode event) {
        String ownerEmail = event.path("ownerEmail").asText();
        String newStage = event.path("newStage").asText(null);
        users.findByEmail(ownerEmail).ifPresent(user -> {
            if (newStage != null) user.setBusinessStage(newStage);
            users.save(user);
        });
    }

    @Transactional
    public boolean unsubscribe(String email) {
        return users.findByEmail(email).map(user -> {
            user.setUnsubscribed(true);
            users.save(user);
            return true;
        }).orElse(false);
    }
}
