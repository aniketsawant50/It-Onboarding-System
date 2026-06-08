package com.onboarding.system.service;

import com.onboarding.system.dto.AssetRequest;
import com.onboarding.system.entity.Asset;
import com.onboarding.system.entity.AssetAssignmentHistory;
import com.onboarding.system.entity.Role;
import com.onboarding.system.entity.User;
import com.onboarding.system.repository.AssetRepository;
import com.onboarding.system.repository.AssetAssignmentHistoryRepository;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
public class AssetService {

    private final AssetRepository assetRepository;
    private final AssetAssignmentHistoryRepository assetHistoryRepository;
    private final UserService userService;

    public AssetService(AssetRepository assetRepository, AssetAssignmentHistoryRepository assetHistoryRepository, UserService userService) {
        this.assetRepository = assetRepository;
        this.assetHistoryRepository = assetHistoryRepository;
        this.userService = userService;
    }

    public List<Asset> getAllAssets() {
        List<Asset> assets = assetRepository.findAll();
        boolean requiresUpdate = false;

        for (Asset asset : assets) {
            if (asset.getStatus() == null || asset.getStatus().isBlank()) {
                boolean toEmployee = asset.getAssignedTo() != null && asset.getAssignedTo().getRole() == Role.EMPLOYEE;
                asset.setStatus(toEmployee ? "PENDING_APPROVAL" : "PENDING");
                requiresUpdate = true;
            } else if (asset.getAssignedTo() != null
                    && asset.getAssignedTo().getRole() == Role.EMPLOYEE
                    && "PENDING".equalsIgnoreCase(asset.getStatus())) {
                asset.setStatus("PENDING_APPROVAL");
                requiresUpdate = true;
            }
        }

        if (requiresUpdate) {
            assetRepository.saveAll(assets);
        }

        return assets;
    }

    public Asset createAsset(AssetRequest request) {
        Asset asset = new Asset();
        asset.setName(request.getName());
        asset.setType(request.getType());
        asset.setSerialNumber(request.getSerialNumber());
        User assignee = userService.findById(request.getAssignedTo());
        asset.setAssignedTo(assignee);
        String initialStatus = assignee.getRole() == Role.EMPLOYEE ? "PENDING_APPROVAL" : "PENDING";
        asset.setStatus(initialStatus);
        asset.setAssignedDate(LocalDateTime.now());
        Asset savedAsset = assetRepository.save(asset);

        // Record history for asset creation
        AssetAssignmentHistory history = new AssetAssignmentHistory(
                savedAsset,
                savedAsset.getAssignedTo(),
                "NEW",
                initialStatus,
                "ADMIN",
                "Asset created and assigned to employee"
        );
        assetHistoryRepository.save(history);

        return savedAsset;
    }

    public Asset updateAssetStatus(Long id, String status) {
        Asset asset = assetRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Asset not found"));
        
        String previousStatus = asset.getStatus();
        asset.setStatus(status);
        Asset updatedAsset = assetRepository.save(asset);

        // Record history for status change
        AssetAssignmentHistory history = new AssetAssignmentHistory(
                updatedAsset,
                updatedAsset.getAssignedTo(),
                previousStatus,
                status,
                "HR",
                "Asset status updated"
        );
        assetHistoryRepository.save(history);

        return updatedAsset;
    }

    public List<Asset> getAssetsForUser(Authentication authentication, UserService userService) {
        if (authentication == null) {
            return getAllAssets();
        }

        User currentUser = userService.getCurrentUser(authentication);
        if (currentUser == null) {
            return getAllAssets();
        }

        String userRole = currentUser.getRole().name();

        // Employees only see their own assets
        if ("EMPLOYEE".equals(userRole)) {
            List<Asset> userAssets = assetRepository.findAll().stream()
                    .filter(asset -> asset.getAssignedTo() != null && asset.getAssignedTo().getId().equals(currentUser.getId()))
                    .toList();
            // Ensure statuses are initialized
            userAssets.forEach(asset -> {
                if (asset.getStatus() == null || asset.getStatus().isBlank()) {
                    asset.setStatus("PENDING_APPROVAL");
                }
            });
            return userAssets;
        }

        // Managers, HR, and Admins see all assets
        return getAllAssets();
    }
}
