package com.ufb.home_controller.web;

import com.ufb.home_controller.service.HomeContentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;
import java.time.Duration;

@RestController
@RequestMapping("/api/home")
@RequiredArgsConstructor
public class HomeController {

    private final HomeContentService service;

    @GetMapping
    public ResponseEntity<byte[]> published() {
        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(Duration.ofSeconds(60))
                        .staleWhileRevalidate(Duration.ofMinutes(10))
                        .cachePublic())
                .contentType(MediaType.APPLICATION_JSON)
                .body(service.envelope(service.getPublishedOrDefault()).getBytes(StandardCharsets.UTF_8));
    }
}
