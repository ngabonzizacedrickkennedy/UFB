package com.ufb.home_controller.web;

import com.ufb.home_controller.service.HomeContentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/home")
@RequiredArgsConstructor
public class AdminHomeController {

    private final HomeContentService service;

    @GetMapping("/draft")
    public ResponseEntity<byte[]> draft() {
        return json(service.envelope(service.getOrCreateDraft()));
    }

    @PutMapping("/draft")
    public ResponseEntity<byte[]> updateDraft(@RequestBody byte[] data) {
        String body = new String(data, StandardCharsets.UTF_8);
        return json(service.envelope(service.updateDraft(body)));
    }

    @PostMapping("/publish")
    public ResponseEntity<byte[]> publish() {
        return json(service.envelope(service.publish()));
    }

    private ResponseEntity<byte[]> json(String body) {
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(body.getBytes(StandardCharsets.UTF_8));
    }
}
