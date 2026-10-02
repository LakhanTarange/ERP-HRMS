package com.erp.hrms.entity;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "leaves")
public class Leave {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long employeeId;

    @Column(nullable = false)
    private String leaveType;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    private Double numberOfDays;

    private String reason;

    /*
     * Workflow statuses:
     *
     * PENDING_MANAGER
     * MANAGER_APPROVED
     * PENDING_HR
     * APPROVED
     * MANAGER_REJECTED
     * HR_REJECTED
     */
    @Column(nullable = false)
    private String status = "PENDING_HR";

    private String approvedBy;

    private String managerApprovedBy;

    private LocalDateTime managerApprovedAt;

    private String hrApprovedBy;

    private LocalDateTime hrApprovedAt;

    private String rejectedBy;

    private LocalDateTime rejectedAt;

    @Column(length = 1000)
    private String rejectionReason;

    public Leave() {
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

    public String getLeaveType() {
        return leaveType;
    }

    public void setLeaveType(String leaveType) {
        this.leaveType = leaveType;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public Double getNumberOfDays() {
        return numberOfDays;
    }

    public void setNumberOfDays(Double numberOfDays) {
        this.numberOfDays = numberOfDays;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getApprovedBy() {
        return approvedBy;
    }

    public void setApprovedBy(String approvedBy) {
        this.approvedBy = approvedBy;
    }

    public String getManagerApprovedBy() {
        return managerApprovedBy;
    }

    public void setManagerApprovedBy(String managerApprovedBy) {
        this.managerApprovedBy = managerApprovedBy;
    }

    public LocalDateTime getManagerApprovedAt() {
        return managerApprovedAt;
    }

    public void setManagerApprovedAt(LocalDateTime managerApprovedAt) {
        this.managerApprovedAt = managerApprovedAt;
    }

    public String getHrApprovedBy() {
        return hrApprovedBy;
    }

    public void setHrApprovedBy(String hrApprovedBy) {
        this.hrApprovedBy = hrApprovedBy;
    }

    public LocalDateTime getHrApprovedAt() {
        return hrApprovedAt;
    }

    public void setHrApprovedAt(LocalDateTime hrApprovedAt) {
        this.hrApprovedAt = hrApprovedAt;
    }

    public String getRejectedBy() {
        return rejectedBy;
    }

    public void setRejectedBy(String rejectedBy) {
        this.rejectedBy = rejectedBy;
    }

    public LocalDateTime getRejectedAt() {
        return rejectedAt;
    }

    public void setRejectedAt(LocalDateTime rejectedAt) {
        this.rejectedAt = rejectedAt;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }
}