package com.erp.hrms.service;

import com.erp.hrms.entity.Attendance;
import com.erp.hrms.entity.User;
import com.erp.hrms.employee.EmployeeRepository;
import com.erp.hrms.repository.AttendanceRepository;
import com.erp.hrms.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;

    public AttendanceService(
            AttendanceRepository attendanceRepository,
            EmployeeRepository employeeRepository,
            UserRepository userRepository) {

        this.attendanceRepository = attendanceRepository;
        this.employeeRepository = employeeRepository;
        this.userRepository = userRepository;
    }

    /*
     * ============================================================
     * ADMIN CREATE ATTENDANCE
     * ============================================================
     */

    public Attendance createAttendance(
            Attendance attendance) {

        validateAttendance(attendance);

        Long employeeId =
                attendance.getEmployeeId();

        LocalDate attendanceDate =
                attendance.getAttendanceDate();

        if (!employeeRepository.existsById(employeeId)) {
            throw new RuntimeException(
                    "Employee not found with ID: "
                            + employeeId
            );
        }

        if (attendanceRepository
                .existsByEmployeeIdAndAttendanceDate(
                        employeeId,
                        attendanceDate
                )) {

            throw new RuntimeException(
                    "Attendance already exists for this employee on "
                            + attendanceDate
            );
        }

        normalizeAttendance(attendance);

        /*
         * MANUAL SHIFT
         */

        if (isManualShift(attendance)) {

            normalizeManualShift(attendance);

        } else {

            attendance.setShiftSource("AUTO");
            attendance.setShiftCode(null);
            attendance.setShiftName(null);
        }

        calculateAttendance(attendance);

        return attendanceRepository.save(
                attendance
        );
    }

    /*
     * ============================================================
     * GET ALL
     * ============================================================
     */

    public List<Attendance> getAllAttendance() {

        return attendanceRepository.findAll();
    }

    /*
     * ============================================================
     * GET MY ATTENDANCE
     * ============================================================
     */

    public List<Attendance> getMyAttendance(
            String username) {

        User user =
                getAuthenticatedUser(username);

        Long employeeId =
                user.getEmployeeId();

        if (employeeId == null) {

            throw new RuntimeException(
                    "This user is not linked with an employee"
            );
        }

        if (!employeeRepository.existsById(employeeId)) {

            throw new RuntimeException(
                    "Employee not found with ID: "
                            + employeeId
            );
        }

        return attendanceRepository
                .findByEmployeeIdOrderByAttendanceDateDesc(
                        employeeId
                );
    }

    /*
     * ============================================================
     * GET BY ID
     * ============================================================
     */

    public Attendance getAttendanceById(
            Long id) {

        if (id == null) {

            throw new RuntimeException(
                    "Attendance ID is required"
            );
        }

        return attendanceRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Attendance not found with ID: "
                                        + id
                        )
                );
    }

    /*
     * ============================================================
     * GET BY EMPLOYEE
     * ============================================================
     */

    public List<Attendance> getByEmployee(
            Long employeeId) {

        if (employeeId == null) {

            throw new RuntimeException(
                    "Employee ID is required"
            );
        }

        if (!employeeRepository.existsById(employeeId)) {

            throw new RuntimeException(
                    "Employee not found with ID: "
                            + employeeId
            );
        }

        return attendanceRepository
                .findByEmployeeId(
                        employeeId
                );
    }

    /*
     * ============================================================
     * EMPLOYEE PUNCH IN
     * ============================================================
     */

    public Attendance punchIn(
            String username) {

        User user =
                getAuthenticatedUser(username);

        Long employeeId =
                user.getEmployeeId();

        if (employeeId == null) {

            throw new RuntimeException(
                    "This user is not linked with an employee"
            );
        }

        if (!employeeRepository.existsById(employeeId)) {

            throw new RuntimeException(
                    "Employee not found with ID: "
                            + employeeId
            );
        }

        LocalDate today =
                LocalDate.now();

        LocalTime currentTime =
                LocalTime.now();

        /*
         * Check today's attendance.
         */

        List<Attendance> todayRecords =
                attendanceRepository
                        .findByEmployeeIdAndAttendanceDate(
                                employeeId,
                                today
                        );

        if (!todayRecords.isEmpty()) {

            Attendance existing =
                    todayRecords.get(0);

            if (existing.getCheckIn() != null
                    && existing.getCheckOut() == null) {

                throw new RuntimeException(
                        "You have already punched in today"
                );
            }

            throw new RuntimeException(
                    "Today's attendance already exists"
            );
        }

        /*
         * Check previous open attendance.
         *
         * Important for overnight shifts.
         */

        Attendance openAttendance =
                attendanceRepository
                        .findFirstByEmployeeIdAndCheckOutIsNullOrderByAttendanceDateDesc(
                                employeeId
                        )
                        .orElse(null);

        if (openAttendance != null) {

            throw new RuntimeException(
                    "Previous attendance is still open. "
                            + "Please punch out first."
            );
        }

        /*
         * Create today's attendance.
         */

        Attendance attendance =
                new Attendance();

        attendance.setEmployeeId(
                employeeId
        );

        attendance.setAttendanceDate(
                today
        );

        attendance.setCheckIn(
                currentTime
        );

        attendance.setCheckOut(
                null
        );

        /*
         * Employee punching always starts
         * with automatic shift detection.
         */

        attendance.setShiftSource(
                "AUTO"
        );

        attendance.setShiftCode(
                null
        );

        attendance.setShiftName(
                null
        );

        attendance.setRemarks(
                "Employee Punch In"
        );

        /*
         * Initial calculation.
         *
         * Since Punch Out is not available,
         * status is HALF_DAY temporarily.
         */

        calculateAttendance(
                attendance
        );

        return attendanceRepository.save(
                attendance
        );
    }

    /*
     * ============================================================
     * EMPLOYEE PUNCH OUT
     * ============================================================
     */

    public Attendance punchOut(
            String username) {

        User user =
                getAuthenticatedUser(username);

        Long employeeId =
                user.getEmployeeId();

        if (employeeId == null) {

            throw new RuntimeException(
                    "This user is not linked with an employee"
            );
        }

        if (!employeeRepository.existsById(employeeId)) {

            throw new RuntimeException(
                    "Employee not found with ID: "
                            + employeeId
            );
        }

        /*
         * Find employee's latest open attendance.
         *
         * This also supports overnight shifts.
         */

        Attendance attendance =
                attendanceRepository
                        .findFirstByEmployeeIdAndCheckOutIsNullOrderByAttendanceDateDesc(
                                employeeId
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "No open attendance found. "
                                                + "Please punch in first."
                                )
                        );

        LocalTime currentTime =
                LocalTime.now();

        /*
         * Prevent exact same time.
         */

        if (attendance.getCheckIn() != null
                && attendance.getAttendanceDate()
                .equals(LocalDate.now())
                && attendance.getCheckIn()
                .equals(currentTime)) {

            throw new RuntimeException(
                    "Punch Out time cannot be the same as Punch In time"
            );
        }

        /*
         * Set Punch Out.
         */

        attendance.setCheckOut(
                currentTime
        );

        /*
         * Employee punch system uses AUTO shift.
         */

        attendance.setShiftSource(
                "AUTO"
        );

        attendance.setShiftCode(
                null
        );

        attendance.setShiftName(
                null
        );

        attendance.setRemarks(
                "Employee Punch In / Punch Out"
        );

        /*
         * Calculate:
         *
         * Working Hours
         * Shift
         * Overtime
         * Status
         */

        calculateAttendance(
                attendance
        );

        return attendanceRepository.save(
                attendance
        );
    }

    /*
     * ============================================================
     * UPDATE ATTENDANCE
     * ============================================================
     */

    public Attendance updateAttendance(
            Long id,
            Attendance attendance) {

        Attendance existing =
                getAttendanceById(id);

        validateAttendance(
                attendance
        );

        Long employeeId =
                attendance.getEmployeeId();

        LocalDate attendanceDate =
                attendance.getAttendanceDate();

        if (!employeeRepository.existsById(employeeId)) {

            throw new RuntimeException(
                    "Employee not found with ID: "
                            + employeeId
            );
        }

        if (attendanceRepository
                .existsByEmployeeIdAndAttendanceDateAndIdNot(
                        employeeId,
                        attendanceDate,
                        id
                )) {

            throw new RuntimeException(
                    "Attendance already exists for this employee on "
                            + attendanceDate
            );
        }

        existing.setEmployeeId(
                employeeId
        );

        existing.setAttendanceDate(
                attendanceDate
        );

        existing.setCheckIn(
                attendance.getCheckIn()
        );

        existing.setCheckOut(
                attendance.getCheckOut()
        );

        existing.setRemarks(
                normalizeRemarks(
                        attendance.getRemarks()
                )
        );

        /*
         * Manual Shift
         */

        if (isManualShift(attendance)) {

            existing.setShiftSource(
                    "MANUAL"
            );

            existing.setShiftName(
                    attendance.getShiftName()
            );

            existing.setShiftCode(
                    attendance.getShiftCode()
            );

            normalizeManualShift(
                    existing
            );

        } else {

            existing.setShiftSource(
                    "AUTO"
            );

            existing.setShiftName(
                    null
            );

            existing.setShiftCode(
                    null
            );
        }

        calculateAttendance(
                existing
        );

        return attendanceRepository.save(
                existing
        );
    }

    /*
     * ============================================================
     * DELETE
     * ============================================================
     */

    public void deleteAttendance(
            Long id) {

        Attendance attendance =
                getAttendanceById(id);

        attendanceRepository.delete(
                attendance
        );
    }

    /*
     * ============================================================
     * CALCULATE ATTENDANCE
     * ============================================================
     */

    private void calculateAttendance(
            Attendance attendance) {

        LocalTime checkIn =
                attendance.getCheckIn();

        LocalTime checkOut =
                attendance.getCheckOut();

        /*
         * Punch In without Punch Out.
         */

        if (checkIn == null
                || checkOut == null) {

            ShiftInfo shift;

            if (isManualShift(attendance)) {

                shift =
                        getManualShift(
                                attendance.getShiftCode()
                        );

            } else {

                shift =
                        detectShiftByPunchIn(
                                checkIn
                        );
            }

            attendance.setShiftName(
                    shift.name
            );

            attendance.setShiftCode(
                    shift.code
            );

            attendance.setWorkingHours(
                    null
            );

            attendance.setOvertimeHours(
                    0.0
            );

            attendance.setStatus(
                    "HALF_DAY"
            );

            return;
        }

        /*
         * Calculate working hours.
         */

        double workingHours =
                calculateHours(
                        checkIn,
                        checkOut
                );

        workingHours =
                roundTwoDecimals(
                        workingHours
                );

        attendance.setWorkingHours(
                workingHours
        );

        ShiftInfo shift;

        /*
         * MANUAL SHIFT
         */

        if (isManualShift(attendance)) {

            shift =
                    getManualShift(
                            attendance.getShiftCode()
                    );

            attendance.setShiftName(
                    shift.name
            );

            attendance.setShiftCode(
                    shift.code
            );

            attendance.setShiftSource(
                    "MANUAL"
            );

        }
        /*
         * AUTO SHIFT
         */

        else {

            shift =
                    detectShift(
                            checkIn,
                            checkOut
                    );

            attendance.setShiftName(
                    shift.name
            );

            attendance.setShiftCode(
                    shift.code
            );

            attendance.setShiftSource(
                    "AUTO"
            );
        }

        /*
         * Full shift calculation.
         */

        boolean fullShift =
                isFullShift(
                        shift.code,
                        workingHours
                );

        if (fullShift) {

            attendance.setStatus(
                    "PRESENT"
            );

        } else {

            attendance.setStatus(
                    "HALF_DAY"
            );
        }

        /*
         * Overtime calculation.
         */

        double normalHours =
                getNormalShiftHours(
                        shift.code
                );

        double overtime =
                0.0;

        if (normalHours > 0
                && workingHours > normalHours) {

            overtime =
                    workingHours - normalHours;
        }

        attendance.setOvertimeHours(
                roundTwoDecimals(
                        overtime
                )
        );
    }

    /*
     * ============================================================
     * AUTHENTICATED USER
     * ============================================================
     */

    private User getAuthenticatedUser(
            String username) {

        if (username == null
                || username.trim().isEmpty()) {

            throw new RuntimeException(
                    "Authenticated username is required"
            );
        }

        return userRepository
                .findByUsername(
                        username
                )
                .orElseThrow(() ->
                        new RuntimeException(
                                "Authenticated user not found"
                        )
                );
    }

    /*
     * ============================================================
     * MANUAL SHIFT
     * ============================================================
     */

    private boolean isManualShift(
            Attendance attendance) {

        if (attendance == null) {
            return false;
        }

        if ("MANUAL".equalsIgnoreCase(
                attendance.getShiftSource()
        )) {

            return true;
        }

        return attendance.getShiftCode() != null
                && !attendance.getShiftCode()
                .trim()
                .isEmpty();
    }

    private void normalizeManualShift(
            Attendance attendance) {

        if (attendance.getShiftCode() == null
                || attendance.getShiftCode()
                .trim()
                .isEmpty()) {

            throw new RuntimeException(
                    "Manual shift code is required"
            );
        }

        ShiftInfo shift =
                getManualShift(
                        attendance.getShiftCode()
                );

        attendance.setShiftName(
                shift.name
        );

        attendance.setShiftCode(
                shift.code
        );

        attendance.setShiftSource(
                "MANUAL"
        );
    }

    private ShiftInfo getManualShift(
            String shiftCode) {

        if (shiftCode == null) {

            throw new RuntimeException(
                    "Shift is required"
            );
        }

        switch (
                shiftCode
                        .trim()
                        .toUpperCase()
        ) {

            case "P1":
                return new ShiftInfo(
                        "First",
                        "P1"
                );

            case "P2":
                return new ShiftInfo(
                        "Second",
                        "P2"
                );

            case "P3":
                return new ShiftInfo(
                        "Third / Night",
                        "P3"
                );

            case "G":
                return new ShiftInfo(
                        "General",
                        "G"
                );

            case "P3-12D":
                return new ShiftInfo(
                        "12 Hr Day",
                        "P3-12D"
                );

            case "P4":
                return new ShiftInfo(
                        "12 Hr Night",
                        "P4"
                );

            case "P1-P2":
                return new ShiftInfo(
                        "First + Second",
                        "P1-P2"
                );

            case "P2-P3":
                return new ShiftInfo(
                        "Second + Night",
                        "P2-P3"
                );

            case "P3-P1":
                return new ShiftInfo(
                        "Night + First",
                        "P3-P1"
                );

            default:
                throw new RuntimeException(
                        "Invalid shift code: "
                                + shiftCode
                );
        }
    }

    /*
     * ============================================================
     * AUTO SHIFT DETECTION
     * ============================================================
     */

    private ShiftInfo detectShift(
            LocalTime checkIn,
            LocalTime checkOut) {

        double hours =
                calculateHours(
                        checkIn,
                        checkOut
                );

        if (isNear(checkIn, 19, 0)
                && isAroundHours(
                        hours,
                        12
                )) {

            return new ShiftInfo(
                    "12 Hr Night",
                    "P4"
            );
        }

        if (isNear(checkIn, 23, 0)
                && isAroundHours(
                        hours,
                        16
                )) {

            return new ShiftInfo(
                    "Night + First",
                    "P3-P1"
            );
        }

        if (isNear(checkIn, 23, 0)
                && isAroundHours(
                        hours,
                        8
                )) {

            return new ShiftInfo(
                    "Third / Night",
                    "P3"
            );
        }

        if (isNear(checkIn, 15, 0)
                && isAroundHours(
                        hours,
                        16
                )) {

            return new ShiftInfo(
                    "Second + Night",
                    "P2-P3"
            );
        }

        if (isNear(checkIn, 15, 0)
                && isAroundHours(
                        hours,
                        8
                )) {

            return new ShiftInfo(
                    "Second",
                    "P2"
            );
        }

        if (isNear(checkIn, 7, 0)
                && isAroundHours(
                        hours,
                        16
                )) {

            return new ShiftInfo(
                    "First + Second",
                    "P1-P2"
            );
        }

        if (isNear(checkIn, 7, 0)
                && isAroundHours(
                        hours,
                        12
                )) {

            return new ShiftInfo(
                    "12 Hr Day",
                    "P3-12D"
            );
        }

        if (isNear(checkIn, 7, 0)
                && isAroundHours(
                        hours,
                        8
                )) {

            return new ShiftInfo(
                    "First",
                    "P1"
            );
        }

        if (isNear(checkIn, 10, 0)
                && isAroundHours(
                        hours,
                        8
                )) {

            return new ShiftInfo(
                    "General",
                    "G"
            );
        }

        return detectShiftByPunchIn(
                checkIn
        );
    }

    private ShiftInfo detectShiftByPunchIn(
            LocalTime checkIn) {

        if (checkIn == null) {

            return new ShiftInfo(
                    "Unknown",
                    "UNKNOWN"
            );
        }

        int hour =
                checkIn.getHour();

        if (hour >= 5
                && hour < 10) {

            return new ShiftInfo(
                    "First",
                    "P1"
            );
        }

        if (hour >= 10
                && hour < 15) {

            return new ShiftInfo(
                    "General",
                    "G"
            );
        }

        if (hour >= 15
                && hour < 19) {

            return new ShiftInfo(
                    "Second",
                    "P2"
            );
        }

        if (hour >= 19
                && hour < 23) {

            return new ShiftInfo(
                    "12 Hr Night",
                    "P4"
            );
        }

        return new ShiftInfo(
                "Third / Night",
                "P3"
        );
    }

    /*
     * ============================================================
     * NORMAL SHIFT HOURS
     * ============================================================
     */

    private double getNormalShiftHours(
            String shiftCode) {

        if (shiftCode == null) {
            return 0.0;
        }

        switch (shiftCode) {

            case "P1":
            case "P2":
            case "P3":
            case "G":
                return 8.0;

            case "P3-12D":
            case "P4":
                return 12.0;

            case "P1-P2":
            case "P2-P3":
            case "P3-P1":
                return 16.0;

            default:
                return 0.0;
        }
    }

    /*
     * ============================================================
     * FULL SHIFT
     * ============================================================
     */

    private boolean isFullShift(
            String shiftCode,
            double hours) {

        double normalHours =
                getNormalShiftHours(
                        shiftCode
                );

        if (normalHours <= 0) {
            return false;
        }

        /*
         * 30 minutes tolerance.
         *
         * Example:
         * 8-hour shift:
         * 7.5 hours or more = PRESENT
         */

        return hours >= normalHours - 0.5;
    }

    /*
     * ============================================================
     * 15 MINUTE CHECK
     * ============================================================
     */

    private boolean isValid15MinuteTime(
            LocalTime time) {

        if (time == null) {
            return false;
        }

        return time.getMinute() % 15 == 0
                && time.getSecond() == 0
                && time.getNano() == 0;
    }

    /*
     * ============================================================
     * HOURS CALCULATION
     * ============================================================
     */

    private double calculateHours(
            LocalTime checkIn,
            LocalTime checkOut) {

        if (checkIn == null
                || checkOut == null) {

            return 0.0;
        }

        Duration duration;

        if (checkOut.isAfter(checkIn)) {

            duration =
                    Duration.between(
                            checkIn,
                            checkOut
                    );

        } else {

            /*
             * Overnight shift.
             */

            duration =
                    Duration.between(
                            checkIn,
                            checkOut
                    ).plusDays(1);
        }

        return duration.toMinutes()
                / 60.0;
    }

    /*
     * ============================================================
     * TIME MATCH
     * ============================================================
     */

    private boolean isNear(
            LocalTime time,
            int expectedHour,
            int expectedMinute) {

        if (time == null) {
            return false;
        }

        int actualMinutes =
                time.getHour() * 60
                        + time.getMinute();

        int expectedMinutes =
                expectedHour * 60
                        + expectedMinute;

        return Math.abs(
                actualMinutes
                        - expectedMinutes
        ) <= 45;
    }

    /*
     * ============================================================
     * HOURS RANGE
     * ============================================================
     */

    private boolean isAroundHours(
            double actual,
            double expected) {

        return actual >= expected - 0.75
                && actual <= expected + 0.75;
    }

    /*
     * ============================================================
     * VALIDATION
     * ============================================================
     */

    private void validateAttendance(
            Attendance attendance) {

        if (attendance == null) {

            throw new RuntimeException(
                    "Attendance data is required"
            );
        }

        if (attendance.getEmployeeId() == null) {

            throw new RuntimeException(
                    "Employee is required"
            );
        }

        if (attendance.getAttendanceDate() == null) {

            throw new RuntimeException(
                    "Attendance date is required"
            );
        }

        LocalTime checkIn =
                attendance.getCheckIn();

        LocalTime checkOut =
                attendance.getCheckOut();

        if (checkIn != null
                && checkOut != null
                && checkIn.equals(checkOut)) {

            throw new RuntimeException(
                    "Check-in and check-out time cannot be the same"
            );
        }

        if (attendance.getRemarks() != null
                && attendance.getRemarks().length() > 500) {

            throw new RuntimeException(
                    "Remarks cannot exceed 500 characters"
            );
        }

        if (isManualShift(attendance)) {

            getManualShift(
                    attendance.getShiftCode()
            );
        }
    }

    /*
     * ============================================================
     * NORMALIZE
     * ============================================================
     */

    private void normalizeAttendance(
            Attendance attendance) {

        attendance.setRemarks(
                normalizeRemarks(
                        attendance.getRemarks()
                )
        );
    }

    private String normalizeRemarks(
            String remarks) {

        if (remarks == null
                || remarks.trim().isEmpty()) {

            return null;
        }

        return remarks.trim();
    }

    /*
     * ============================================================
     * ROUNDING
     * ============================================================
     */

    private double roundTwoDecimals(
            double value) {

        return Math.round(
                value * 100.0
        ) / 100.0;
    }

    /*
     * ============================================================
     * SHIFT INFO
     * ============================================================
     */

    private static class ShiftInfo {

        private final String name;
        private final String code;

        private ShiftInfo(
                String name,
                String code) {

            this.name = name;
            this.code = code;
        }
    }
}