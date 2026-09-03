package com.erp.hrms.repository;

import com.erp.hrms.entity.Interview;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface InterviewRepository
        extends JpaRepository<Interview, Long> {

    List<Interview> findByCandidateId(Long candidateId);

    List<Interview> findByStatus(String status);

    List<Interview> findByInterviewDate(LocalDate interviewDate);
}