package com.onboarding.system.controller;

import com.onboarding.system.entity.AssetAssignmentHistory;
import com.onboarding.system.repository.AssetAssignmentHistoryRepository;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/asset-history")
public class AssetHistoryController {

    private final AssetAssignmentHistoryRepository assetHistoryRepository;

    public AssetHistoryController(AssetAssignmentHistoryRepository assetHistoryRepository) {
        this.assetHistoryRepository = assetHistoryRepository;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    public List<AssetAssignmentHistory> getAllHistory() {
        return assetHistoryRepository.findAll();
    }

    @GetMapping("/asset/{assetId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    public List<AssetAssignmentHistory> getAssetHistory(@PathVariable Long assetId) {
        return assetHistoryRepository.findByAssetId(assetId);
    }

    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    public List<AssetAssignmentHistory> getEmployeeHistory(@PathVariable Long employeeId) {
        return assetHistoryRepository.findByAssignedToId(employeeId);
    }
}
