package com.onboarding.system.controller;

import com.onboarding.system.dto.AssetRequest;
import com.onboarding.system.dto.UpdateAssetStatusRequest;
import com.onboarding.system.entity.Asset;
import com.onboarding.system.service.AssetService;
import com.onboarding.system.service.UserService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/assets")
public class AssetController {

    private final AssetService assetService;
    private final UserService userService;

    public AssetController(AssetService assetService, UserService userService) {
        this.assetService = assetService;
        this.userService = userService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    public List<Asset> getAssets(Authentication authentication) {
        return assetService.getAssetsForUser(authentication, userService);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public Asset createAsset(@Valid @RequestBody AssetRequest request) {
        return assetService.createAsset(request);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    public Asset updateAssetStatus(@PathVariable Long id, @Valid @RequestBody UpdateAssetStatusRequest request) {
        return assetService.updateAssetStatus(id, request.getStatus());
    }
}
