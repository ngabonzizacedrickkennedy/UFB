package com.ufb.auth.user_management.controller;

import com.ufb.auth.user_management.dto.UserResponse;
import com.ufb.auth.user_management.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final UserService userService;

    @PostMapping("/photo")
    public ResponseEntity<UserResponse> uploadPhoto(
            Authentication authentication,
            @RequestParam("file") MultipartFile file) throws IOException {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        UserResponse updated = userService.updateProfilePhoto(
                authentication.getName(),
                file.getBytes(),
                file.getContentType(),
                file.getOriginalFilename());

        return ResponseEntity.ok(updated);
    }
}
