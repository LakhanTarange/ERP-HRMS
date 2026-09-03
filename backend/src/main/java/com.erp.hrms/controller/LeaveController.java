package com.erp.hrms.controller;

import com.erp.hrms.entity.Leave;
import com.erp.hrms.service.LeaveService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leaves")
@CrossOrigin(origins = "*")
public class LeaveController {

    private final LeaveService leaveService;

    public LeaveController(LeaveService leaveService) {
        this.leaveService = leaveService;
    }

    @PostMapping
    public ResponseEntity<Leave> createLeave(
            @RequestBody Leave leave) {

        return ResponseEntity.ok(
                leaveService.createLeave(leave)
        );
    }

    @GetMapping
    public ResponseEntity<List<Leave>> getAllLeaves() {

        return ResponseEntity.ok(
                leaveService.getAllLeaves()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Leave> getLeaveById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                leaveService.getLeaveById(id)
        );
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<Leave>> getLeavesByEmployee(
            @PathVariable Long employeeId) {

        return ResponseEntity.ok(
                leaveService.getLeavesByEmployee(employeeId)
        );
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Leave>> getLeavesByStatus(
            @PathVariable String status) {

        return ResponseEntity.ok(
                leaveService.getLeavesByStatus(status)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<Leave> updateLeave(
            @PathVariable Long id,
            @RequestBody Leave leave) {

        return ResponseEntity.ok(
                leaveService.updateLeave(id, leave)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteLeave(
            @PathVariable Long id) {

        leaveService.deleteLeave(id);

        return ResponseEntity.ok(
                "Leave deleted successfully"
        );
    }
}