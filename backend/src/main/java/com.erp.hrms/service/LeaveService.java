package com.erp.hrms.service;

import com.erp.hrms.entity.Leave;
import com.erp.hrms.repository.LeaveRepository;
import org.springframework.stereotype.Service;

import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class LeaveService {

    private final LeaveRepository leaveRepository;

    public LeaveService(LeaveRepository leaveRepository) {
        this.leaveRepository = leaveRepository;
    }

    public Leave createLeave(Leave leave) {

        calculateDays(leave);

        leave.setStatus("PENDING");

        return leaveRepository.save(leave);
    }

    public List<Leave> getAllLeaves() {
        return leaveRepository.findAll();
    }

    public Leave getLeaveById(Long id) {

        return leaveRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Leave not found"));
    }

    public List<Leave> getLeavesByEmployee(Long employeeId) {

        return leaveRepository.findByEmployeeId(employeeId);
    }

    public List<Leave> getLeavesByStatus(String status) {

        return leaveRepository.findByStatus(status);
    }

    public Leave updateLeave(Long id, Leave leave) {

        Leave existing = getLeaveById(id);

        existing.setEmployeeId(leave.getEmployeeId());
        existing.setLeaveType(leave.getLeaveType());
        existing.setStartDate(leave.getStartDate());
        existing.setEndDate(leave.getEndDate());
        existing.setReason(leave.getReason());
        existing.setStatus(leave.getStatus());
        existing.setApprovedBy(leave.getApprovedBy());

        calculateDays(existing);

        return leaveRepository.save(existing);
    }

    public void deleteLeave(Long id) {

        Leave leave = getLeaveById(id);

        leaveRepository.delete(leave);
    }

    private void calculateDays(Leave leave) {

        if (leave.getStartDate() != null
                && leave.getEndDate() != null) {

            long days = ChronoUnit.DAYS.between(
                    leave.getStartDate(),
                    leave.getEndDate()
            ) + 1;

            leave.setNumberOfDays((double) days);
        }
    }
}