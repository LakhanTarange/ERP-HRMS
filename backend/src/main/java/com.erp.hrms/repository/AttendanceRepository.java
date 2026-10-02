package com.erp.hrms.repository;

import com.erp.hrms.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AttendanceRepository
        extends JpaRepository<Attendance, Long> {

    List<Attendance> findByEmployeeId(Long employeeId);

    List<Attendance> findByEmployeeIdOrderByAttendanceDateDesc(
            Long employeeId
    );

    List<Attendance> findByAttendanceDate(
            LocalDate attendanceDate
    );

    List<Attendance> findByEmployeeIdAndAttendanceDate(
            Long employeeId,
            LocalDate attendanceDate
    );

    boolean existsByEmployeeIdAndAttendanceDate(
            Long employeeId,
            LocalDate attendanceDate
    );

    boolean existsByEmployeeIdAndAttendanceDateAndIdNot(
            Long employeeId,
            LocalDate attendanceDate,
            Long id
    );

    Optional<Attendance>
    findFirstByEmployeeIdAndCheckOutIsNullOrderByAttendanceDateDesc(
            Long employeeId
    );
}