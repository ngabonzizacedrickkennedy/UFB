package com.ufb.consultation_service.service;

import com.ufb.consultation_service.dto.BusinessCreateRequest;
import com.ufb.consultation_service.dto.BusinessResponse;
import com.ufb.consultation_service.model.Sector;
import com.ufb.consultation_service.model.Stage;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface BusinessService {
    BusinessResponse create(String ownerEmail, BusinessCreateRequest request);
    BusinessResponse update(String ownerEmail, Long id, BusinessCreateRequest request);
    List<BusinessResponse> listForOwner(String ownerEmail);
    BusinessResponse getForOwner(String ownerEmail, Long id);
    Page<BusinessResponse> listForAdmin(Sector sector, Stage stage, Pageable pageable);
    BusinessResponse getForAdmin(Long id);
}
