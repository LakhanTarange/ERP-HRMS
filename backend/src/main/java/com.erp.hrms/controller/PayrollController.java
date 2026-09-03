package com.erp.hrms.controller;

import com.erp.hrms.entity.Payroll;
import com.erp.hrms.service.PayrollService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payroll")
@CrossOrigin(origins = "*")
public class PayrollController {

    private final PayrollService payrollService;

    public PayrollController(
            PayrollService payrollService) {

        this.payrollService = payrollService;
    }

    // Create Payroll
    @PostMapping
    public ResponseEntity<Payroll> createPayroll(
            @RequestBody Payroll payroll) {

        return ResponseEntity.ok(
                payrollService.createPayroll(payroll)
        );
    }

    // Get All Payroll
    @GetMapping
    public ResponseEntity<List<Payroll>> getAllPayrolls() {

        return ResponseEntity.ok(
                payrollService.getAllPayrolls()
        );
    }

    // Get Payroll By ID
    @GetMapping("/{id}")
    public ResponseEntity<Payroll> getPayrollById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                payrollService.getPayrollById(id)
        );
    }

    // Get Payroll By Employee
    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<Payroll>> getPayrollsByEmployee(
            @PathVariable Long employeeId) {

        return ResponseEntity.ok(
                payrollService.getPayrollsByEmployee(employeeId)
        );
    }

    // Get Payroll By Month
    @GetMapping("/month/{month}")
    public ResponseEntity<List<Payroll>> getPayrollsByMonth(
            @PathVariable String month) {

        return ResponseEntity.ok(
                payrollService.getPayrollsByMonth(month)
        );
    }

    // Get Payroll By Status
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Payroll>> getPayrollsByStatus(
            @PathVariable String status) {

        return ResponseEntity.ok(
                payrollService.getPayrollsByStatus(status)
        );
    }

    // Update Payroll
    @PutMapping("/{id}")
    public ResponseEntity<Payroll> updatePayroll(
            @PathVariable Long id,
            @RequestBody Payroll payroll) {

        return ResponseEntity.ok(
                payrollService.updatePayroll(
                        id,
                        payroll
                )
        );
    }

    // Delete Payroll
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deletePayroll(
            @PathVariable Long id) {

        payrollService.deletePayroll(id);

        return ResponseEntity.ok(
                "Payroll deleted successfully"
        );
    }
}