package com.ufb.home_controller.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ufb.home_controller.model.ContentStatus;
import com.ufb.home_controller.model.HomeContent;
import com.ufb.home_controller.repository.HomeContentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class HomeContentService {

    private final HomeContentRepository repository;
    private final HomeEventPublisher eventPublisher;
    private final ObjectMapper objectMapper;

    @Transactional
    public HomeContent getOrCreateDraft() {
        return repository.findFirstByStatusOrderByVersionDesc(ContentStatus.DRAFT)
                .orElseGet(() -> repository.save(HomeContent.builder()
                        .version(0)
                        .status(ContentStatus.DRAFT)
                        .data(DefaultHomeContent.JSON)
                        .build()));
    }

    @Transactional(readOnly = true)
    public HomeContent getPublishedOrDefault() {
        return repository.findFirstByStatusOrderByVersionDesc(ContentStatus.PUBLISHED)
                .orElseGet(() -> HomeContent.builder()
                        .version(0)
                        .status(ContentStatus.PUBLISHED)
                        .data(DefaultHomeContent.JSON)
                        .build());
    }

    @Transactional
    public HomeContent updateDraft(String json) {
        validateJson(json);
        HomeContent draft = getOrCreateDraft();
        draft.setData(json);
        return repository.save(draft);
    }

    @Transactional
    public HomeContent publish() {
        HomeContent draft = getOrCreateDraft();
        int nextVersion = repository.findFirstByStatusOrderByVersionDesc(ContentStatus.PUBLISHED)
                .map(HomeContent::getVersion)
                .orElse(0) + 1;

        HomeContent published = repository.save(HomeContent.builder()
                .version(nextVersion)
                .status(ContentStatus.PUBLISHED)
                .data(draft.getData())
                .publishedAt(Instant.now())
                .build());

        eventPublisher.publishPublished(nextVersion);
        return published;
    }

    private void validateJson(String json) {
        if (json == null || json.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Empty body");
        }
        try {
            objectMapper.readTree(json);
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Body is not valid JSON");
        }
    }

    public String envelope(HomeContent content) {
        return "{\"version\":" + content.getVersion()
                + ",\"status\":\"" + content.getStatus().name() + "\""
                + ",\"data\":" + content.getData() + "}";
    }
}
