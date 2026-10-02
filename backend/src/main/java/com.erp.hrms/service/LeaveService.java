package com.erp.hrms.service;

import com.erp.hrms.entity.Leave;
import com.erp.hrms.entity.LeaveApprovalConfig;
import com.erp.hrms.entity.User;
import com.erp.hrms.repository.LeaveApprovalConfigRepository;
import com.erp.hrms.repository.LeaveRepository;
import com.erp.hrms.repository.UserRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class LeaveService {

    private final LeaveRepository leaveRepository;
    private final LeaveApprovalConfigRepository configRepository;
    private final UserRepository userRepository;

    public LeaveService(
            LeaveRepository leaveRepository,
            LeaveApprovalConfigRepository configRepository,
            UserRepository userRepository) {

        this.leaveRepository = leaveRepository;
        this.configRepository = configRepository;
        this.userRepository = userRepository;
    }

    // =========================================================
    // CREATE LEAVE
    // =========================================================

    public Leave createLeave(Leave leave) {

        validateDates(leave);
        calculateDays(leave);

        LeaveApprovalConfig config =
                configRepository.findByEmployeeId(leave.getEmployeeId())
                        .filter(LeaveApprovalConfig::isActive)
                        .orElse(null);

        if (config == null) {

            // Default workflow:
            // Employee -> HR

            leave.setStatus("PENDING_HR");

        } else {

            if (config.isManagerApprovalRequired()) {

                if (config.getManagerEmployeeId() == null) {
                    throw new RuntimeException(
                            "Manager approval is required but manager is not configured"
                    );
                }

                leave.setStatus("PENDING_MANAGER");

            } else if (config.isHrApprovalRequired()) {

                if (config.getHrEmployeeId() == null) {
                    throw new RuntimeException(
                            "HR approval is required but HR approver is not configured"
                    );
                }

                leave.setStatus("PENDING_HR");

            } else {

                // No approval required

                leave.setStatus("APPROVED");
                leave.setApprovedBy("SYSTEM");
            }
        }

        return leaveRepository.save(leave);
    }

    // =========================================================
    // GET ALL
    // =========================================================

    public List<Leave> getAllLeaves() {

        return leaveRepository.findAll();
    }

    // =========================================================
    // GET BY ID
    // =========================================================

    public Leave getLeaveById(Long id) {

        return leaveRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Leave not found"));
    }

    // =========================================================
    // GET BY EMPLOYEE
    // =========================================================

    public List<Leave> getLeavesByEmployee(Long employeeId) {

        return leaveRepository.findByEmployeeId(employeeId);
    }

    // =========================================================
    // GET BY STATUS
    // =========================================================

    public List<Leave> getLeavesByStatus(String status) {

        return leaveRepository.findByStatus(status);
    }

    // =========================================================
    // GET PENDING LEAVES FOR LOGGED-IN MANAGER
    // =========================================================

    public List<Leave> getMyPendingManagerLeaves(String username) {

        User user = getUser(username);

        Long managerEmployeeId = user.getEmployeeId();

        if (managerEmployeeId == null) {
            throw new RuntimeException(
                    "Your user account is not linked with an employee"
            );
        }

        List<LeaveApprovalConfig> configs =
                configRepository
                        .findByManagerEmployeeIdAndManagerApprovalRequiredTrueAndActiveTrue(
                                managerEmployeeId
                        );

        List<Long> employeeIds = configs.stream()
                .map(LeaveApprovalConfig::getEmployeeId)
                .toList();

        if (employeeIds.isEmpty()) {
            return List.of();
        }

        return leaveRepository.findByEmployeeIdInAndStatus(
                employeeIds,
                "PENDING_MANAGER"
        );
    }

    // =========================================================
    // UPDATE
    // =========================================================

    public Leave updateLeave(Long id, Leave leave) {

        Leave existing = getLeaveById(id);

        if ("APPROVED".equals(existing.getStatus())
                || "MANAGER_REJECTED".equals(existing.getStatus())
                || "HR_REJECTED".equals(existing.getStatus())) {

            throw new RuntimeException(
                    "Finalized leave cannot be edited"
            );
        }

        existing.setEmployeeId(leave.getEmployeeId());
        existing.setLeaveType(leave.getLeaveType());
        existing.setStartDate(leave.getStartDate());
        existing.setEndDate(leave.getEndDate());
        existing.setReason(leave.getReason());

        validateDates(existing);
        calculateDays(existing);

        return leaveRepository.save(existing);
    }

    // =========================================================
    // DELETE
    // =========================================================

    public void deleteLeave(Long id) {

        Leave leave = getLeaveById(id);

        if ("APPROVED".equals(leave.getStatus())) {

            throw new RuntimeException(
                    "Approved leave cannot be deleted"
            );
        }

        leaveRepository.delete(leave);
    }

    // =========================================================
    // MANAGER APPROVE
    // =========================================================

    public Leave managerApprove(
            Long leaveId,
            String username) {

        User user = getUser(username);

        Long managerEmployeeId = user.getEmployeeId();

        if (managerEmployeeId == null) {

            throw new RuntimeException(
                    "Your user account is not linked with an employee"
            );
        }

        Leave leave = getLeaveById(leaveId);

        if (!"PENDING_MANAGER".equals(leave.getStatus())) {

            throw new RuntimeException(
                    "This leave is not waiting for manager approval"
            );
        }

        LeaveApprovalConfig config =
                getConfig(leave.getEmployeeId());

        if (!config.isActive()
                || !config.isManagerApprovalRequired()) {

            throw new RuntimeException(
                    "Manager approval is not configured for this employee"
            );
        }

        if (!managerEmployeeId.equals(
                config.getManagerEmployeeId())) {

            throw new RuntimeException(
                    "You are not the assigned manager for this leave"
            );
        }

        leave.setManagerApprovedBy(username);
        leave.setManagerApprovedAt(LocalDateTime.now());

        leave.setStatus(
                config.isHrApprovalRequired()
                        ? "PENDING_HR"
                        : "APPROVED"
        );

        if ("APPROVED".equals(leave.getStatus())) {
            leave.setApprovedBy(username);
        }

        return leaveRepository.save(leave);
    }

    // =========================================================
    // MANAGER REJECT
    // =========================================================

    public Leave managerReject(
            Long leaveId,
            String username,
            String rejectionReason) {

        User user = getUser(username);

        Long managerEmployeeId = user.getEmployeeId();

        if (managerEmployeeId == null) {

            throw new RuntimeException(
                    "Your user account is not linked with an employee"
            );
        }

        Leave leave = getLeaveById(leaveId);

        if (!"PENDING_MANAGER".equals(leave.getStatus())) {

            throw new RuntimeException(
                    "This leave is not waiting for manager approval"
            );
        }

        LeaveApprovalConfig config =
                getConfig(leave.getEmployeeId());

        if (!managerEmployeeId.equals(
                config.getManagerEmployeeId())) {

            throw new RuntimeException(
                    "You are not the assigned manager for this leave"
            );
        }

        leave.setStatus("MANAGER_REJECTED");
        leave.setRejectedBy(username);
        leave.setRejectedAt(LocalDateTime.now());
        leave.setRejectionReason(
                rejectionReason == null ? "" : rejectionReason
        );

        return leaveRepository.save(leave);
    }

    // =========================================================
    // HR APPROVE
    // =========================================================

    public Leave hrApprove(
            Long leaveId,
            String username) {

        User user = getUser(username);

        Long hrEmployeeId = user.getEmployeeId();

        if (hrEmployeeId == null) {

            throw new RuntimeException(
                    "Your user account is not linked with an employee"
            );
        }

        Leave leave = getLeaveById(leaveId);

        if (!"PENDING_HR".equals(leave.getStatus())) {

            throw new RuntimeException(
                    "This leave is not waiting for HR approval"
            );
        }

        LeaveApprovalConfig config =
                getConfig(leave.getEmployeeId());

        if (!config.isActive()
                || !config.isHrApprovalRequired()) {

            throw new RuntimeException(
                    "HR approval is not configured for this employee"
            );
        }

        if (!hrEmployeeId.equals(
                config.getHrEmployeeId())) {

            throw new RuntimeException(
                    "You are not the assigned HR approver for this leave"
            );
        }

        leave.setHrApprovedBy(username);
        leave.setHrApprovedAt(LocalDateTime.now());
        leave.setApprovedBy(username);
        leave.setStatus("APPROVED");

        return leaveRepository.save(leave);
    }

    // =========================================================
    // HR REJECT
    // =========================================================

    public Leave hrReject(
            Long leaveId,
            String username,
            String rejectionReason) {

        User user = getUser(username);

        Long hrEmployeeId = user.getEmployeeId();

        if (hrEmployeeId == null) {

            throw new RuntimeException(
                    "Your user account is not linked with an employee"
            );
        }

        Leave leave = getLeaveById(leaveId);

        if (!"PENDING_HR".equals(leave.getStatus())) {

            throw new RuntimeException(
                    "This leave is not waiting for HR approval"
            );
        }

        LeaveApprovalConfig config =
                getConfig(leave.getEmployeeId());

        if (!hrEmployeeId.equals(
                config.getHrEmployeeId())) {

            throw new RuntimeException(
                    "You are not the assigned HR approver for this leave"
            );
        }

        leave.setStatus("HR_REJECTED");
        leave.setRejectedBy(username);
        leave.setRejectedAt(LocalDateTime.now());
        leave.setRejectionReason(
                rejectionReason == null ? "" : rejectionReason
        );

        return leaveRepository.save(leave);
    }

    // =========================================================
    // SAVE APPROVAL CONFIGURATION
    // =========================================================

    public LeaveApprovalConfig saveApprovalConfig(
            LeaveApprovalConfig config) {

        if (config.getEmployeeId() == null) {

            throw new RuntimeException(
                    "Employee is required"
            );
        }

        if (config.isManagerApprovalRequired()
                && config.getManagerEmployeeId() == null) {

            throw new RuntimeException(
                    "Manager employee is required"
            );
        }

        if (config.isHrApprovalRequired()
                && config.getHrEmployeeId() == null) {

            throw new RuntimeException(
                    "HR employee is required"
            );
        }

        LeaveApprovalConfig existing =
                configRepository
                        .findByEmployeeId(
                                config.getEmployeeId()
                        )
                        .orElse(null);

        if (existing != null) {

            existing.setManagerEmployeeId(
                    config.getManagerEmployeeId()
            );

            existing.setManagerApprovalRequired(
                    config.isManagerApprovalRequired()
            );

            existing.setHrEmployeeId(
                    config.getHrEmployeeId()
            );

            existing.setHrApprovalRequired(
                    config.isHrApprovalRequired()
            );

            existing.setActive(
                    config.isActive()
            );

            return configRepository.save(existing);
        }

        return configRepository.save(config);
    }

    // =========================================================
    // GET ALL APPROVAL CONFIGURATIONS
    // =========================================================

    public List<LeaveApprovalConfig> getAllApprovalConfigs() {

        return configRepository.findAll();
    }

    // =========================================================
    // GET EMPLOYEE APPROVAL CONFIGURATION
    // =========================================================

    public LeaveApprovalConfig getApprovalConfig(
            Long employeeId) {

        return configRepository
                .findByEmployeeId(employeeId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Leave approval configuration not found"
                        ));
    }

    // =========================================================
    // DELETE APPROVAL CONFIGURATION
    // =========================================================

    public void deleteApprovalConfig(Long employeeId) {

        LeaveApprovalConfig config =
                configRepository
                        .findByEmployeeId(employeeId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Leave approval configuration not found"
                                ));

        configRepository.delete(config);
    }

    // =========================================================
    // HELPERS
    // =========================================================

    private User getUser(String username) {

        return userRepository
                .findByUsername(username)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found"
                        ));
    }

    private LeaveApprovalConfig getConfig(
            Long employeeId) {

        return configRepository
                .findByEmployeeId(employeeId)
                .filter(LeaveApprovalConfig::isActive)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Leave approval configuration not found"
                        ));
    }

    private void validateDates(Leave leave) {

        if (leave.getEmployeeId() == null) {

            throw new RuntimeException(
                    "Employee is required"
            );
        }

        if (leave.getStartDate() == null
                || leave.getEndDate() == null) {

            throw new RuntimeException(
                    "Start date and end date are required"
            );
        }

        if (leave.getEndDate()
                .isBefore(leave.getStartDate())) {

            throw new RuntimeException(
                    "End date cannot be before start date"
            );
        }
    }

    private void calculateDays(Leave leave) {

        long days = ChronoUnit.DAYS.between(
                leave.getStartDate(),
                leave.getEndDate()
        ) + 1;

        leave.setNumberOfDays((double) days);
    }
}