package com.erp.hrms.controller;

import com.erp.hrms.entity.Attendance;
import com.erp.hrms.service.AttendanceService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = "*")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(
            AttendanceService attendanceService) {

        this.attendanceService = attendanceService;
    }

    /*
     * ============================================================
     * ADMIN / HR - CREATE ATTENDANCE
     * ============================================================
     */

    @PostMapping
    public ResponseEntity<Attendance> createAttendance(
            @RequestBody Attendance attendance) {

        return ResponseEntity.ok(
                attendanceService.createAttendance(
                        attendance
                )
        );
    }

    /*
     * ============================================================
     * ADMIN / HR - GET ALL ATTENDANCE
     * ============================================================
     */

    @GetMapping
    public ResponseEntity<List<Attendance>>
    getAllAttendance() {

        return ResponseEntity.ok(
                attendanceService.getAllAttendance()
        );
    }

    /*
     * ============================================================
     * LOGGED-IN EMPLOYEE - MY ATTENDANCE
     * ============================================================
     */

    @GetMapping("/my")
    public ResponseEntity<List<Attendance>>
    getMyAttendance(
            Authentication authentication) {

        if (authentication == null
                || authentication.getName() == null
                || authentication.getName().trim().isEmpty()) {

            throw new RuntimeException(
                    "User authentication is required"
            );
        }

        return ResponseEntity.ok(
                attendanceService.getMyAttendance(
                        authentication.getName()
                )
        );
    }

    /*
     * ============================================================
     * GET ATTENDANCE BY ID
     * ============================================================
     */

    @GetMapping("/{id}")
    public ResponseEntity<Attendance>
    getAttendanceById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                attendanceService.getAttendanceById(id)
        );
    }

    /*
     * ============================================================
     * GET EMPLOYEE ATTENDANCE
     * ============================================================
     */

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<Attendance>>
    getByEmployee(
            @PathVariable Long employeeId) {

        return ResponseEntity.ok(
                attendanceService.getByEmployee(
                        employeeId
                )
        );
    }

    /*
     * ============================================================
     * EMPLOYEE PUNCH IN
     * ============================================================
     *
     * Employee ID is NOT accepted from frontend.
     *
     * Backend gets username from JWT authentication
     * and then finds the employeeId linked with that user.
     *
     */

    @PostMapping("/punch-in")
    public ResponseEntity<Attendance>
    punchIn(
            Authentication authentication) {

        if (authentication == null
                || authentication.getName() == null
                || authentication.getName().trim().isEmpty()) {

            throw new RuntimeException(
                    "User authentication is required"
            );
        }

        return ResponseEntity.ok(
                attendanceService.punchIn(
                        authentication.getName()
                )
        );
    }

    /*
     * ============================================================
     * EMPLOYEE PUNCH OUT
     * ============================================================
     */

    @PostMapping("/punch-out")
    public ResponseEntity<Attendance>
    punchOut(
            Authentication authentication) {

        if (authentication == null
                || authentication.getName() == null
                || authentication.getName().trim().isEmpty()) {

            throw new RuntimeException(
                    "User authentication is required"
            );
        }

        return ResponseEntity.ok(
                attendanceService.punchOut(
                        authentication.getName()
                )
        );
    }

    /*
     * ============================================================
     * ADMIN / HR - UPDATE
     * ============================================================
     */

    @PutMapping("/{id}")
    public ResponseEntity<Attendance>
    updateAttendance(
            @PathVariable Long id,
            @RequestBody Attendance attendance) {

        return ResponseEntity.ok(
                attendanceService.updateAttendance(
                        id,
                        attendance
                )
        );
    }

    /*
     * ============================================================
     * ADMIN / HR - DELETE
     * ============================================================
     */

    @DeleteMapping("/{id}")
    public ResponseEntity<String>
    deleteAttendance(
            @PathVariable Long id) {

        attendanceService.deleteAttendance(id);

        return ResponseEntity.ok(
                "Attendance deleted successfully"
        );
    }
}