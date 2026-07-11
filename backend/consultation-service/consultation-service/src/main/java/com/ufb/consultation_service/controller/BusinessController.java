package com.ufb.consultation_service.controller;

import com.ufb.consultation_service.dto.BusinessCreateRequest;
import com.ufb.consultation_service.dto.BusinessResponse;
import com.ufb.consultation_service.service.BusinessService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/consultation/businesses")
@RequiredArgsConstructor
public class BusinessController {

    private final BusinessService businessService;

    @GetMapping
    public ResponseEntity<List<BusinessResponse>> listMine(Authentication authentication) {
        return ResponseEntity.ok(businessService.listForOwner(authentication.getName()));
    }

    @PostMapping
    public ResponseEntity<BusinessResponse> create(Authentication authentication,
                                                     @Valid @RequestBody BusinessCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(businessService.create(authentication.getName(), request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BusinessResponse> getMine(Authentication authentication, @PathVariable Long id) {
        return ResponseEntity.ok(businessService.getForOwner(authentication.getName(), id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BusinessResponse> update(Authentication authentication, @PathVariable Long id,
                                                     @Valid @RequestBody BusinessCreateRequest request) {
        return ResponseEntity.ok(businessService.update(authentication.getName(), id, request));
    }
}
