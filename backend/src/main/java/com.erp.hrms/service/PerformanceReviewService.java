package com.erp.hrms.service;

import com.erp.hrms.entity.PerformanceReview;
import com.erp.hrms.repository.PerformanceReviewRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class PerformanceReviewService {

    private final PerformanceReviewRepository reviewRepository;

    public PerformanceReviewService(
            PerformanceReviewRepository reviewRepository) {

        this.reviewRepository = reviewRepository;
    }

    public PerformanceReview createReview(
            PerformanceReview review) {

        if (review.getReviewDate() == null) {
            review.setReviewDate(LocalDate.now());
        }

        if (review.getStatus() == null
                || review.getStatus().isBlank()) {

            review.setStatus("DRAFT");
        }

        validateRating(review);

        return reviewRepository.save(review);
    }

    public List<PerformanceReview> getAllReviews() {
        return reviewRepository.findAll();
    }

    public PerformanceReview getReviewById(Long id) {

        return reviewRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Performance review not found"));
    }

    public List<PerformanceReview> getReviewsByEmployee(
            Long employeeId) {

        return reviewRepository.findByEmployeeId(employeeId);
    }

    public List<PerformanceReview> getReviewsByStatus(
            String status) {

        return reviewRepository.findByStatus(status);
    }

    public List<PerformanceReview> getReviewsByPeriod(
            String reviewPeriod) {

        return reviewRepository
                .findByReviewPeriod(reviewPeriod);
    }

    public PerformanceReview updateReview(
            Long id,
            PerformanceReview review) {

        PerformanceReview existing =
                getReviewById(id);

        existing.setEmployeeId(review.getEmployeeId());
        existing.setReviewPeriod(review.getReviewPeriod());
        existing.setReviewDate(review.getReviewDate());
        existing.setReviewer(review.getReviewer());
        existing.setRating(review.getRating());
        existing.setGoals(review.getGoals());
        existing.setAchievements(review.getAchievements());
        existing.setStrengths(review.getStrengths());
        existing.setAreasForImprovement(
                review.getAreasForImprovement());
        existing.setComments(review.getComments());
        existing.setStatus(review.getStatus());

        validateRating(existing);

        return reviewRepository.save(existing);
    }

    public void deleteReview(Long id) {

        PerformanceReview review =
                getReviewById(id);

        reviewRepository.delete(review);
    }

    private void validateRating(
            PerformanceReview review) {

        if (review.getRating() != null) {

            if (review.getRating() < 0
                    || review.getRating() > 5) {

                throw new RuntimeException(
                        "Rating must be between 0 and 5");
            }
        }
    }
}