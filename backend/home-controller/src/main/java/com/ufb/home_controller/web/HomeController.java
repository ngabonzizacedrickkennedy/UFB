package com.ufb.home_controller.web;

import com.ufb.home_controller.service.HomeContentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/home")
@RequiredArgsConstructor
public class HomeController {

    private final HomeContentService service;

    @GetMapping
    public ResponseEntity<byte[]> published() {
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(service.envelope(service.getPublishedOrDefault()).getBytes(StandardCharsets.UTF_8));
    }
}
