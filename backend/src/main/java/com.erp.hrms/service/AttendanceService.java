package com.erp.hrms.service;

import com.erp.hrms.entity.Attendance;
import com.erp.hrms.repository.AttendanceRepository;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.List;

@Service
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;

    public AttendanceService(AttendanceRepository attendanceRepository) {
        this.attendanceRepository = attendanceRepository;
    }

    public Attendance createAttendance(Attendance attendance) {

        calculateWorkingHours(attendance);

        return attendanceRepository.save(attendance);
    }

    public List<Attendance> getAllAttendance() {
        return attendanceRepository.findAll();
    }

    public Attendance getAttendanceById(Long id) {

        return attendanceRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Attendance not found"));
    }

    public List<Attendance> getByEmployee(Long employeeId) {

        return attendanceRepository.findByEmployeeId(employeeId);
    }

    public Attendance updateAttendance(
            Long id,
            Attendance attendance) {

        Attendance existing = getAttendanceById(id);

        existing.setEmployeeId(attendance.getEmployeeId());
        existing.setAttendanceDate(attendance.getAttendanceDate());
        existing.setCheckIn(attendance.getCheckIn());
        existing.setCheckOut(attendance.getCheckOut());
        existing.setStatus(attendance.getStatus());
        existing.setRemarks(attendance.getRemarks());

        calculateWorkingHours(existing);

        return attendanceRepository.save(existing);
    }

    public void deleteAttendance(Long id) {

        Attendance attendance = getAttendanceById(id);

        attendanceRepository.delete(attendance);
    }

    private void calculateWorkingHours(Attendance attendance) {

        if (attendance.getCheckIn() != null
                && attendance.getCheckOut() != null) {

            Duration duration = Duration.between(
                    attendance.getCheckIn(),
                    attendance.getCheckOut()
            );

            double hours = duration.toMinutes() / 60.0;

            attendance.setWorkingHours(
                    Math.round(hours * 100.0) / 100.0
            );
        }
    }
}