package com.erp.hrms.controller;

import com.erp.hrms.entity.Leave;
import com.erp.hrms.entity.LeaveApprovalConfig;
import com.erp.hrms.service.LeaveService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/leaves")
@CrossOrigin(origins = "*")
public class LeaveController {

    private final LeaveService leaveService;

    public LeaveController(LeaveService leaveService) {
        this.leaveService = leaveService;
    }

    // =========================================================
    // CREATE LEAVE
    // =========================================================

    @PostMapping
    public ResponseEntity<Leave> createLeave(
            @RequestBody Leave leave) {

        return ResponseEntity.ok(
                leaveService.createLeave(leave)
        );
    }

    // =========================================================
    // GET ALL
    // =========================================================

    @GetMapping
    public ResponseEntity<List<Leave>> getAllLeaves() {

        return ResponseEntity.ok(
                leaveService.getAllLeaves()
        );
    }

    // =========================================================
    // GET BY ID
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<Leave> getLeaveById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                leaveService.getLeaveById(id)
        );
    }

    // =========================================================
    // GET BY EMPLOYEE
    // =========================================================

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<Leave>> getLeavesByEmployee(
            @PathVariable Long employeeId) {

        return ResponseEntity.ok(
                leaveService.getLeavesByEmployee(employeeId)
        );
    }

    // =========================================================
    // GET BY STATUS
    // =========================================================

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Leave>> getLeavesByStatus(
            @PathVariable String status) {

        return ResponseEntity.ok(
                leaveService.getLeavesByStatus(status)
        );
    }

    // =========================================================
    // GET MY PENDING MANAGER LEAVES
    // =========================================================

    @GetMapping("/my-manager-pending")
    public ResponseEntity<List<Leave>> getMyPendingManagerLeaves(
            Authentication authentication) {

        return ResponseEntity.ok(
                leaveService.getMyPendingManagerLeaves(
                        authentication.getName()
                )
        );
    }

    // =========================================================
    // UPDATE
    // =========================================================

    @PutMapping("/{id}")
    public ResponseEntity<Leave> updateLeave(
            @PathVariable Long id,
            @RequestBody Leave leave) {

        return ResponseEntity.ok(
                leaveService.updateLeave(id, leave)
        );
    }

    // =========================================================
    // DELETE
    // =========================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteLeave(
            @PathVariable Long id) {

        leaveService.deleteLeave(id);

        return ResponseEntity.ok(
                "Leave deleted successfully"
        );
    }

    // =========================================================
    // MANAGER APPROVE
    // =========================================================

    @PostMapping("/{id}/manager-approve")
    public ResponseEntity<Leave> managerApprove(
            @PathVariable Long id,
            Authentication authentication) {

        return ResponseEntity.ok(
                leaveService.managerApprove(
                        id,
                        authentication.getName()
                )
        );
    }

    // =========================================================
    // MANAGER REJECT
    // =========================================================

    @PostMapping("/{id}/manager-reject")
    public ResponseEntity<Leave> managerReject(
            @PathVariable Long id,
            @RequestBody(required = false)
            Map<String, String> body,
            Authentication authentication) {

        String reason = "";

        if (body != null
                && body.get("reason") != null) {

            reason = body.get("reason");
        }

        return ResponseEntity.ok(
                leaveService.managerReject(
                        id,
                        authentication.getName(),
                        reason
                )
        );
    }

    // =========================================================
    // HR APPROVE
    // =========================================================

    @PostMapping("/{id}/hr-approve")
    public ResponseEntity<Leave> hrApprove(
            @PathVariable Long id,
            Authentication authentication) {

        return ResponseEntity.ok(
                leaveService.hrApprove(
                        id,
                        authentication.getName()
                )
        );
    }

    // =========================================================
    // HR REJECT
    // =========================================================

    @PostMapping("/{id}/hr-reject")
    public ResponseEntity<Leave> hrReject(
            @PathVariable Long id,
            @RequestBody(required = false)
            Map<String, String> body,
            Authentication authentication) {

        String reason = "";

        if (body != null
                && body.get("reason") != null) {

            reason = body.get("reason");
        }

        return ResponseEntity.ok(
                leaveService.hrReject(
                        id,
                        authentication.getName(),
                        reason
                )
        );
    }

    // =========================================================
    // HR - SAVE APPROVAL CONFIGURATION
    // =========================================================

    @PostMapping("/approval-config")
    public ResponseEntity<LeaveApprovalConfig> saveApprovalConfig(
            @RequestBody LeaveApprovalConfig config,
            Authentication authentication) {

        requireHrOrAdmin(authentication);

        return ResponseEntity.ok(
                leaveService.saveApprovalConfig(config)
        );
    }

    // =========================================================
    // GET ALL APPROVAL CONFIGURATIONS
    // =========================================================

    @GetMapping("/approval-config")
    public ResponseEntity<List<LeaveApprovalConfig>> getAllApprovalConfigs(
            Authentication authentication) {

        requireHrOrAdmin(authentication);

        return ResponseEntity.ok(
                leaveService.getAllApprovalConfigs()
        );
    }

    // =========================================================
    // GET EMPLOYEE APPROVAL CONFIGURATION
    // =========================================================

    @GetMapping("/approval-config/{employeeId}")
    public ResponseEntity<LeaveApprovalConfig> getApprovalConfig(
            @PathVariable Long employeeId,
            Authentication authentication) {

        requireHrOrAdmin(authentication);

        return ResponseEntity.ok(
                leaveService.getApprovalConfig(employeeId)
        );
    }

    // =========================================================
    // DELETE APPROVAL CONFIGURATION
    // =========================================================

    @DeleteMapping("/approval-config/{employeeId}")
    public ResponseEntity<String> deleteApprovalConfig(
            @PathVariable Long employeeId,
            Authentication authentication) {

        requireHrOrAdmin(authentication);

        leaveService.deleteApprovalConfig(employeeId);

        return ResponseEntity.ok(
                "Leave approval configuration deleted successfully"
        );
    }

    // =========================================================
    // SECURITY HELPER
    // =========================================================

    private void requireHrOrAdmin(
            Authentication authentication) {

        boolean allowed = authentication.getAuthorities()
                .stream()
                .anyMatch(authority ->
                        authority.getAuthority()
                                .equals("ROLE_HR_ADMIN")
                                ||
                        authority.getAuthority()
                                .equals("ROLE_SUPER_ADMIN")
                );

        if (!allowed) {

            throw new RuntimeException(
                    "Only HR Admin or Super Admin can configure leave approval"
            );
        }
    }
}