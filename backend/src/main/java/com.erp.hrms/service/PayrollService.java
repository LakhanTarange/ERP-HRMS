package com.erp.hrms.service;

import com.erp.hrms.entity.Payroll;
import com.erp.hrms.repository.PayrollRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PayrollService {

    private final PayrollRepository payrollRepository;

    public PayrollService(PayrollRepository payrollRepository) {
        this.payrollRepository = payrollRepository;
    }

    // Create Payroll
    public Payroll createPayroll(Payroll payroll) {

        calculateSalary(payroll);

        if (payroll.getPaymentStatus() == null
                || payroll.getPaymentStatus().isBlank()) {

            payroll.setPaymentStatus("PENDING");
        }

        return payrollRepository.save(payroll);
    }

    // Get All Payroll
    public List<Payroll> getAllPayrolls() {

        return payrollRepository.findAll();
    }

    // Get Payroll By ID
    public Payroll getPayrollById(Long id) {

        return payrollRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Payroll not found"));
    }

    // Get Payroll By Employee
    public List<Payroll> getPayrollsByEmployee(Long employeeId) {

        return payrollRepository.findByEmployeeId(employeeId);
    }

    // Get Payroll By Month
    public List<Payroll> getPayrollsByMonth(String month) {

        return payrollRepository.findByMonth(month);
    }

    // Get Payroll By Payment Status
    public List<Payroll> getPayrollsByStatus(String status) {

        return payrollRepository.findByPaymentStatus(status);
    }

    // Update Payroll
    public Payroll updatePayroll(
            Long id,
            Payroll payroll) {

        Payroll existing = getPayrollById(id);

        existing.setEmployeeId(
                payroll.getEmployeeId()
        );

        existing.setMonth(
                payroll.getMonth()
        );

        existing.setBasicSalary(
                payroll.getBasicSalary()
        );

        existing.setAllowances(
                payroll.getAllowances()
        );

        existing.setDeductions(
                payroll.getDeductions()
        );

        existing.setPaymentDate(
                payroll.getPaymentDate()
        );

        existing.setPaymentStatus(
                payroll.getPaymentStatus()
        );

        existing.setRemarks(
                payroll.getRemarks()
        );

        calculateSalary(existing);

        return payrollRepository.save(existing);
    }

    // Delete Payroll
    public void deletePayroll(Long id) {

        Payroll payroll = getPayrollById(id);

        payrollRepository.delete(payroll);
    }

    // Salary Calculation
    private void calculateSalary(Payroll payroll) {

        double basicSalary = payroll.getBasicSalary() != null
                ? payroll.getBasicSalary()
                : 0.0;

        double allowances = payroll.getAllowances() != null
                ? payroll.getAllowances()
                : 0.0;

        double deductions = payroll.getDeductions() != null
                ? payroll.getDeductions()
                : 0.0;

        // Gross Salary
        double grossSalary =
                basicSalary + allowances;

        // Net Salary
        double netSalary =
                grossSalary - deductions;

        payroll.setGrossSalary(
                Math.round(grossSalary * 100.0) / 100.0
        );

        payroll.setNetSalary(
                Math.round(netSalary * 100.0) / 100.0
        );
    }
}