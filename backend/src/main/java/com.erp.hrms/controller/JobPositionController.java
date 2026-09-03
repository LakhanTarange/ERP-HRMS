package com.erp.hrms.controller;

import com.erp.hrms.entity.JobPosition;
import com.erp.hrms.service.JobPositionService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/job-positions")
@CrossOrigin(origins = "*")
public class JobPositionController {

    private final JobPositionService jobPositionService;

    public JobPositionController(
            JobPositionService jobPositionService) {

        this.jobPositionService = jobPositionService;
    }

    @PostMapping
    public ResponseEntity<JobPosition> createJobPosition(
            @RequestBody JobPosition jobPosition) {

        return ResponseEntity.ok(
                jobPositionService
                        .createJobPosition(jobPosition)
        );
    }

    @GetMapping
    public ResponseEntity<List<JobPosition>>
    getAllJobPositions() {

        return ResponseEntity.ok(
                jobPositionService
                        .getAllJobPositions()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobPosition>
    getJobPositionById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                jobPositionService
                        .getJobPositionById(id)
        );
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<JobPosition>>
    getByStatus(
            @PathVariable String status) {

        return ResponseEntity.ok(
                jobPositionService
                        .getByStatus(status)
        );
    }

    @GetMapping("/department/{department}")
    public ResponseEntity<List<JobPosition>>
    getByDepartment(
            @PathVariable String department) {

        return ResponseEntity.ok(
                jobPositionService
                        .getByDepartment(department)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<JobPosition>
    updateJobPosition(
            @PathVariable Long id,
            @RequestBody JobPosition jobPosition) {

        return ResponseEntity.ok(
                jobPositionService
                        .updateJobPosition(
                                id,
                                jobPosition
                        )
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String>
    deleteJobPosition(
            @PathVariable Long id) {

        jobPositionService
                .deleteJobPosition(id);

        return ResponseEntity.ok(
                "Job position deleted successfully"
        );
    }
}