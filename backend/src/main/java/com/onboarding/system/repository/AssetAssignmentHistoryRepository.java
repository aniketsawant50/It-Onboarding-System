package com.onboarding.system.repository;

import com.onboarding.system.entity.AssetAssignmentHistory;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AssetAssignmentHistoryRepository extends JpaRepository<AssetAssignmentHistory, Long> {
    List<AssetAssignmentHistory> findByAssetId(Long assetId);
    List<AssetAssignmentHistory> findByAssignedToId(Long assignedToId);
}
