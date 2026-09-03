package com.erp.hrms.controller;

import com.erp.hrms.entity.PerformanceReview;
import com.erp.hrms.service.PerformanceReviewService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/performance-reviews")
@CrossOrigin(origins = "*")
public class PerformanceReviewController {

    private final PerformanceReviewService reviewService;

    public PerformanceReviewController(
            PerformanceReviewService reviewService) {

        this.reviewService = reviewService;
    }

    @PostMapping
    public ResponseEntity<PerformanceReview> createReview(
            @RequestBody PerformanceReview review) {

        return ResponseEntity.ok(
                reviewService.createReview(review)
        );
    }

    @GetMapping
    public ResponseEntity<List<PerformanceReview>>
    getAllReviews() {

        return ResponseEntity.ok(
                reviewService.getAllReviews()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<PerformanceReview>
    getReviewById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                reviewService.getReviewById(id)
        );
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<PerformanceReview>>
    getReviewsByEmployee(
            @PathVariable Long employeeId) {

        return ResponseEntity.ok(
                reviewService.getReviewsByEmployee(
                        employeeId
                )
        );
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<PerformanceReview>>
    getReviewsByStatus(
            @PathVariable String status) {

        return ResponseEntity.ok(
                reviewService.getReviewsByStatus(status)
        );
    }

    @GetMapping("/period/{reviewPeriod}")
    public ResponseEntity<List<PerformanceReview>>
    getReviewsByPeriod(
            @PathVariable String reviewPeriod) {

        return ResponseEntity.ok(
                reviewService.getReviewsByPeriod(
                        reviewPeriod
                )
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<PerformanceReview>
    updateReview(
            @PathVariable Long id,
            @RequestBody PerformanceReview review) {

        return ResponseEntity.ok(
                reviewService.updateReview(
                        id,
                        review
                )
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String>
    deleteReview(
            @PathVariable Long id) {

        reviewService.deleteReview(id);

        return ResponseEntity.ok(
                "Performance review deleted successfully"
        );
    }
}