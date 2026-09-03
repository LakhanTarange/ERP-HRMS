package com.erp.hrms.controller;

import com.erp.hrms.entity.Candidate;
import com.erp.hrms.service.CandidateService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/candidates")
@CrossOrigin(origins = "*")
public class CandidateController {

    private final CandidateService candidateService;

    public CandidateController(
            CandidateService candidateService) {

        this.candidateService = candidateService;
    }

    @PostMapping
    public ResponseEntity<Candidate> createCandidate(
            @RequestBody Candidate candidate) {

        return ResponseEntity.ok(
                candidateService.createCandidate(candidate)
        );
    }

    @GetMapping
    public ResponseEntity<List<Candidate>>
    getAllCandidates() {

        return ResponseEntity.ok(
                candidateService.getAllCandidates()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Candidate>
    getCandidateById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                candidateService.getCandidateById(id)
        );
    }

    @GetMapping("/job-position/{jobPositionId}")
    public ResponseEntity<List<Candidate>>
    getCandidatesByJobPosition(
            @PathVariable Long jobPositionId) {

        return ResponseEntity.ok(
                candidateService
                        .getCandidatesByJobPosition(
                                jobPositionId
                        )
        );
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Candidate>>
    getCandidatesByStatus(
            @PathVariable String status) {

        return ResponseEntity.ok(
                candidateService
                        .getCandidatesByStatus(status)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<Candidate>
    updateCandidate(
            @PathVariable Long id,
            @RequestBody Candidate candidate) {

        return ResponseEntity.ok(
                candidateService.updateCandidate(
                        id,
                        candidate
                )
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String>
    deleteCandidate(
            @PathVariable Long id) {

        candidateService.deleteCandidate(id);

        return ResponseEntity.ok(
                "Candidate deleted successfully"
        );
    }
}