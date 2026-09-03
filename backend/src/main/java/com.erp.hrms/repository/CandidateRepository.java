package com.erp.hrms.repository;

import com.erp.hrms.entity.Candidate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CandidateRepository
        extends JpaRepository<Candidate, Long> {

    List<Candidate> findByJobPositionId(Long jobPositionId);

    List<Candidate> findByStatus(String status);

    List<Candidate> findByEmail(String email);
}