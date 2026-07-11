package com.ufb.consultation_service.controller;

import com.ufb.consultation_service.dto.ConsultationMessageCreateRequest;
import com.ufb.consultation_service.dto.ConsultationMessageResponse;
import com.ufb.consultation_service.security.Principals;
import com.ufb.consultation_service.service.ConsultationService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/consultation")
@RequiredArgsConstructor
public class ConsultationController {

    private final ConsultationService consultationService;

    @PostMapping("/businesses/{businessId}/request")
    public ResponseEntity<Void> requestConsultation(Authentication authentication, @PathVariable Long businessId) {
        consultationService.requestConsultation(authentication.getName(), businessId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/businesses/{businessId}/messages")
    public ResponseEntity<List<ConsultationMessageResponse>> listMessages(
            Authentication authentication, @PathVariable Long businessId) {
        return ResponseEntity.ok(consultationService.listMessages(
                authentication.getName(), Principals.roleOf(authentication), businessId));
    }

    @PostMapping("/businesses/{businessId}/messages")
    public ResponseEntity<ConsultationMessageResponse> postMessage(
            Authentication authentication, @PathVariable Long businessId,
            @Valid @RequestBody ConsultationMessageCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(consultationService.postMessage(
                authentication.getName(), Principals.roleOf(authentication), businessId, request));
    }
}
