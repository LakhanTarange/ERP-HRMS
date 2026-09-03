package com.erp.hrms.controller;

import com.erp.hrms.entity.Interview;
import com.erp.hrms.service.InterviewService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/interviews")
@CrossOrigin(origins = "*")
public class InterviewController {

    private final InterviewService interviewService;

    public InterviewController(
            InterviewService interviewService) {

        this.interviewService = interviewService;
    }

    @PostMapping
    public ResponseEntity<Interview> createInterview(
            @RequestBody Interview interview) {

        return ResponseEntity.ok(
                interviewService.createInterview(interview)
        );
    }

    @GetMapping
    public ResponseEntity<List<Interview>>
    getAllInterviews() {

        return ResponseEntity.ok(
                interviewService.getAllInterviews()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Interview>
    getInterviewById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                interviewService.getInterviewById(id)
        );
    }

    @GetMapping("/candidate/{candidateId}")
    public ResponseEntity<List<Interview>>
    getByCandidate(
            @PathVariable Long candidateId) {

        return ResponseEntity.ok(
                interviewService.getByCandidate(
                        candidateId
                )
        );
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Interview>>
    getByStatus(
            @PathVariable String status) {

        return ResponseEntity.ok(
                interviewService.getByStatus(status)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<Interview>
    updateInterview(
            @PathVariable Long id,
            @RequestBody Interview interview) {

        return ResponseEntity.ok(
                interviewService.updateInterview(
                        id,
                        interview
                )
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String>
    deleteInterview(
            @PathVariable Long id) {

        interviewService.deleteInterview(id);

        return ResponseEntity.ok(
                "Interview deleted successfully"
        );
    }
}