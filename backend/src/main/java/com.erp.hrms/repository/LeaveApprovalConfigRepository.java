package com.erp.hrms.repository;

import com.erp.hrms.entity.LeaveApprovalConfig;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LeaveApprovalConfigRepository
        extends JpaRepository<LeaveApprovalConfig, Long> {

    Optional<LeaveApprovalConfig> findByEmployeeId(Long employeeId);

    boolean existsByEmployeeId(Long employeeId);

    List<LeaveApprovalConfig>
    findByManagerEmployeeIdAndManagerApprovalRequiredTrueAndActiveTrue(
            Long managerEmployeeId
    );
}