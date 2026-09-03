package com.erp.hrms.controller;

import com.erp.hrms.entity.Expense;
import com.erp.hrms.service.ExpenseService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/expenses")
@CrossOrigin(origins = "*")
public class ExpenseController {

    private final ExpenseService expenseService;

    public ExpenseController(ExpenseService expenseService) {
        this.expenseService = expenseService;
    }

    @PostMapping
    public ResponseEntity<Expense> createExpense(
            @RequestBody Expense expense) {

        return ResponseEntity.ok(
                expenseService.createExpense(expense)
        );
    }

    @GetMapping
    public ResponseEntity<List<Expense>> getAllExpenses() {

        return ResponseEntity.ok(
                expenseService.getAllExpenses()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Expense> getExpenseById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                expenseService.getExpenseById(id)
        );
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<Expense>>
    getExpensesByEmployee(
            @PathVariable Long employeeId) {

        return ResponseEntity.ok(
                expenseService
                        .getExpensesByEmployee(employeeId)
        );
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Expense>>
    getExpensesByStatus(
            @PathVariable String status) {

        return ResponseEntity.ok(
                expenseService.getExpensesByStatus(status)
        );
    }

    @GetMapping("/payment-status/{paymentStatus}")
    public ResponseEntity<List<Expense>>
    getExpensesByPaymentStatus(
            @PathVariable String paymentStatus) {

        return ResponseEntity.ok(
                expenseService
                        .getExpensesByPaymentStatus(
                                paymentStatus
                        )
        );
    }

    @GetMapping("/type/{expenseType}")
    public ResponseEntity<List<Expense>>
    getExpensesByType(
            @PathVariable String expenseType) {

        return ResponseEntity.ok(
                expenseService
                        .getExpensesByType(expenseType)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<Expense> updateExpense(
            @PathVariable Long id,
            @RequestBody Expense expense) {

        return ResponseEntity.ok(
                expenseService.updateExpense(
                        id,
                        expense
                )
        );
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<Expense> approveExpense(
            @PathVariable Long id,
            @RequestParam String approvedBy) {

        return ResponseEntity.ok(
                expenseService.approveExpense(
                        id,
                        approvedBy
                )
        );
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<Expense> rejectExpense(
            @PathVariable Long id,
            @RequestParam String approvedBy,
            @RequestParam String remarks) {

        return ResponseEntity.ok(
                expenseService.rejectExpense(
                        id,
                        approvedBy,
                        remarks
                )
        );
    }

    @PutMapping("/{id}/pay")
    public ResponseEntity<Expense> markAsPaid(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                expenseService.markAsPaid(id)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteExpense(
            @PathVariable Long id) {

        expenseService.deleteExpense(id);

        return ResponseEntity.ok(
                "Expense deleted successfully"
        );
    }
}