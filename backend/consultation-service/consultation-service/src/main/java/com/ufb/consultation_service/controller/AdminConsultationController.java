package com.ufb.consultation_service.controller;

import com.ufb.consultation_service.dto.BusinessResponse;
import com.ufb.consultation_service.dto.ConsultationStatusUpdateRequest;
import com.ufb.consultation_service.model.Sector;
import com.ufb.consultation_service.model.Stage;
import com.ufb.consultation_service.service.BusinessService;
import com.ufb.consultation_service.service.ConsultationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/consultation")
@RequiredArgsConstructor
public class AdminConsultationController {

    private final BusinessService businessService;
    private final ConsultationService consultationService;

    @GetMapping("/businesses")
    public ResponseEntity<Page<BusinessResponse>> listAll(
            @RequestParam(required = false) Sector sector,
            @RequestParam(required = false) Stage stage,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "desc") String dir,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Sort.Direction direction = Sort.Direction.fromString(dir);
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(direction, sort));
        return ResponseEntity.ok(businessService.listForAdmin(sector, stage, pageRequest));
    }

    @GetMapping("/businesses/{id}")
    public ResponseEntity<BusinessResponse> getOne(@PathVariable Long id) {
        return ResponseEntity.ok(businessService.getForAdmin(id));
    }

    @PatchMapping("/{consultationId}/status")
    public ResponseEntity<Void> updateStatus(Authentication authentication, @PathVariable Long consultationId,
                                              @Valid @RequestBody ConsultationStatusUpdateRequest request) {
        consultationService.updateStatus(consultationId, request, authentication.getName());
        return ResponseEntity.ok().build();
    }
}
