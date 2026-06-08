package com.onboarding.system.repository;

import com.onboarding.system.entity.Asset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface AssetRepository extends JpaRepository<Asset, Long> {

    @Query(
            value =
                    "SELECT COUNT(*) FROM assets a INNER JOIN users u ON a.assigned_to = u.id "
                            + "WHERE u.role = 'EMPLOYEE' AND UPPER(TRIM(a.status)) IN ('PENDING_APPROVAL', 'PENDING')",
            nativeQuery = true)
    long countEmployeeAssetsPendingHrApproval();
}
