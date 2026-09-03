package com.erp.hrms.service;

import com.erp.hrms.entity.JobPosition;
import com.erp.hrms.repository.JobPositionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class JobPositionService {

    private final JobPositionRepository jobPositionRepository;

    public JobPositionService(
            JobPositionRepository jobPositionRepository) {

        this.jobPositionRepository = jobPositionRepository;
    }

    public JobPosition createJobPosition(JobPosition jobPosition) {

        if (jobPosition.getStatus() == null
                || jobPosition.getStatus().isBlank()) {

            jobPosition.setStatus("OPEN");
        }

        return jobPositionRepository.save(jobPosition);
    }

    public List<JobPosition> getAllJobPositions() {

        return jobPositionRepository.findAll();
    }

    public JobPosition getJobPositionById(Long id) {

        return jobPositionRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Job position not found"));
    }

    public List<JobPosition> getByStatus(String status) {

        return jobPositionRepository.findByStatus(status);
    }

    public List<JobPosition> getByDepartment(
            String department) {

        return jobPositionRepository
                .findByDepartment(department);
    }

    public JobPosition updateJobPosition(
            Long id,
            JobPosition jobPosition) {

        JobPosition existing =
                getJobPositionById(id);

        existing.setTitle(jobPosition.getTitle());
        existing.setDepartment(
                jobPosition.getDepartment());
        existing.setNumberOfPositions(
                jobPosition.getNumberOfPositions());
        existing.setDescription(
                jobPosition.getDescription());
        existing.setStatus(
                jobPosition.getStatus());

        return jobPositionRepository.save(existing);
    }

    public void deleteJobPosition(Long id) {

        JobPosition jobPosition =
                getJobPositionById(id);

        jobPositionRepository.delete(jobPosition);
    }
}