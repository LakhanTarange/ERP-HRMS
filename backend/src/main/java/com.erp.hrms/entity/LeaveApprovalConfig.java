package com.erp.hrms.entity;

import jakarta.persistence.*;

@Entity
@Table(
    name = "leave_approval_configs",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_leave_approval_employee",
            columnNames = {"employee_id"}
        )
    }
)
public class LeaveApprovalConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "employee_id", nullable = false, unique = true)
    private Long employeeId;

    @Column(name = "manager_employee_id")
    private Long managerEmployeeId;

    @Column(nullable = false)
    private boolean managerApprovalRequired = false;

    @Column(name = "hr_employee_id")
    private Long hrEmployeeId;

    @Column(nullable = false)
    private boolean hrApprovalRequired = true;

    @Column(nullable = false)
    private boolean active = true;

    public LeaveApprovalConfig() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public Long getManagerEmployeeId() {
        return managerEmployeeId;
    }

    public void setManagerEmployeeId(Long managerEmployeeId) {
        this.managerEmployeeId = managerEmployeeId;
    }

    public boolean isManagerApprovalRequired() {
        return managerApprovalRequired;
    }

    public void setManagerApprovalRequired(boolean managerApprovalRequired) {
        this.managerApprovalRequired = managerApprovalRequired;
    }

    public Long getHrEmployeeId() {
        return hrEmployeeId;
    }

    public void setHrEmployeeId(Long hrEmployeeId) {
        this.hrEmployeeId = hrEmployeeId;
    }

    public boolean isHrApprovalRequired() {
        return hrApprovalRequired;
    }

    public void setHrApprovalRequired(boolean hrApprovalRequired) {
        this.hrApprovalRequired = hrApprovalRequired;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}