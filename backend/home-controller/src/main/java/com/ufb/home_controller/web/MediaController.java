package com.ufb.home_controller.web;

import com.ufb.home_controller.service.MediaStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/home/media")
@RequiredArgsConstructor
public class MediaController {

    private final MediaStorageService storage;

    @PostMapping
    public ResponseEntity<Map<String, String>> upload(@RequestParam("file") MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        String key = "home-media/" + UUID.randomUUID() + extension(file.getOriginalFilename(), file.getContentType());
        String url = storage.upload(file.getBytes(), file.getContentType(), key);
        return ResponseEntity.ok(Map.of("url", url));
    }

    private String extension(String filename, String contentType) {
        if (filename != null && filename.contains(".")) {
            String ext = filename.substring(filename.lastIndexOf('.')).toLowerCase();
            if (ext.length() <= 6) {
                return ext;
            }
        }
        if (contentType != null && contentType.contains("/")) {
            return "." + contentType.substring(contentType.indexOf('/') + 1);
        }
        return "";
    }
}
