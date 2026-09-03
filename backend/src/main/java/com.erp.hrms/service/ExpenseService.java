package com.erp.hrms.service;

import com.erp.hrms.entity.Expense;
import com.erp.hrms.repository.ExpenseRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class ExpenseService {

    private final ExpenseRepository expenseRepository;

    public ExpenseService(ExpenseRepository expenseRepository) {
        this.expenseRepository = expenseRepository;
    }

    public Expense createExpense(Expense expense) {
        return expenseRepository.save(expense);
    }

    public List<Expense> getAllExpenses() {
        return expenseRepository.findAll();
    }

    public Expense getExpenseById(Long id) {
        return expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found"));
    }

    public List<Expense> getExpensesByEmployee(Long employeeId) {
        return expenseRepository.findByEmployeeId(employeeId);
    }

    public List<Expense> getExpensesByStatus(String status) {
        return expenseRepository.findByStatus(status);
    }

    public List<Expense> getExpensesByPaymentStatus(String paymentStatus) {
        return expenseRepository.findByPaymentStatus(paymentStatus);
    }

    public List<Expense> getExpensesByType(String expenseType) {
        return expenseRepository.findByExpenseType(expenseType);
    }

    public Expense updateExpense(Long id, Expense updated) {
        Expense expense = getExpenseById(id);

        expense.setEmployeeId(updated.getEmployeeId());
        expense.setExpenseType(updated.getExpenseType());
        expense.setAmount(updated.getAmount());
        expense.setExpenseDate(updated.getExpenseDate());
        expense.setDescription(updated.getDescription());
        expense.setReceiptPath(updated.getReceiptPath());
        expense.setRemarks(updated.getRemarks());

        return expenseRepository.save(expense);
    }

    public Expense approveExpense(Long id, String approvedBy) {
        Expense expense = getExpenseById(id);

        expense.setStatus("APPROVED");
        expense.setApprovedBy(approvedBy);
        expense.setApprovalDate(LocalDate.now());

        return expenseRepository.save(expense);
    }

    public Expense rejectExpense(Long id, String approvedBy, String remarks) {
        Expense expense = getExpenseById(id);

        expense.setStatus("REJECTED");
        expense.setApprovedBy(approvedBy);
        expense.setApprovalDate(LocalDate.now());
        expense.setRemarks(remarks);

        return expenseRepository.save(expense);
    }

    public Expense markAsPaid(Long id) {
        Expense expense = getExpenseById(id);

        expense.setPaymentStatus("PAID");

        return expenseRepository.save(expense);
    }

    public void deleteExpense(Long id) {
        expenseRepository.deleteById(id);
    }
}