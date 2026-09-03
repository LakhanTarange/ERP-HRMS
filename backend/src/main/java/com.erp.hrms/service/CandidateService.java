package com.erp.hrms.service;

import com.erp.hrms.entity.Candidate;
import com.erp.hrms.repository.CandidateRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class CandidateService {

    private final CandidateRepository candidateRepository;

    public CandidateService(
            CandidateRepository candidateRepository) {

        this.candidateRepository = candidateRepository;
    }

    public Candidate createCandidate(Candidate candidate) {

        if (candidate.getApplicationDate() == null) {
            candidate.setApplicationDate(LocalDate.now());
        }

        if (candidate.getStatus() == null
                || candidate.getStatus().isBlank()) {

            candidate.setStatus("NEW");
        }

        return candidateRepository.save(candidate);
    }

    public List<Candidate> getAllCandidates() {

        return candidateRepository.findAll();
    }

    public Candidate getCandidateById(Long id) {

        return candidateRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Candidate not found"));
    }

    public List<Candidate> getCandidatesByJobPosition(
            Long jobPositionId) {

        return candidateRepository
                .findByJobPositionId(jobPositionId);
    }

    public List<Candidate> getCandidatesByStatus(
            String status) {

        return candidateRepository
                .findByStatus(status);
    }

    public Candidate updateCandidate(
            Long id,
            Candidate candidate) {

        Candidate existing = getCandidateById(id);

        existing.setName(candidate.getName());
        existing.setEmail(candidate.getEmail());
        existing.setPhone(candidate.getPhone());
        existing.setJobPositionId(
                candidate.getJobPositionId());
        existing.setApplicationDate(
                candidate.getApplicationDate());
        existing.setStatus(candidate.getStatus());
        existing.setInterviewDate(
                candidate.getInterviewDate());
        existing.setRemarks(candidate.getRemarks());
        existing.setResumePath(
                candidate.getResumePath());

        return candidateRepository.save(existing);
    }

    public void deleteCandidate(Long id) {

        Candidate candidate = getCandidateById(id);

        candidateRepository.delete(candidate);
    }
}