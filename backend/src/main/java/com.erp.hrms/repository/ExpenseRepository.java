package com.erp.hrms.repository;

import com.erp.hrms.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExpenseRepository
        extends JpaRepository<Expense, Long> {

    List<Expense> findByEmployeeId(Long employeeId);

    List<Expense> findByStatus(String status);

    List<Expense> findByPaymentStatus(String paymentStatus);

    List<Expense> findByExpenseType(String expenseType);
}