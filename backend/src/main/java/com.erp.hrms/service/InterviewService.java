package com.erp.hrms.service;

import com.erp.hrms.entity.Interview;
import com.erp.hrms.repository.InterviewRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class InterviewService {

    private final InterviewRepository interviewRepository;

    public InterviewService(
            InterviewRepository interviewRepository) {

        this.interviewRepository = interviewRepository;
    }

    public Interview createInterview(Interview interview) {

        if (interview.getStatus() == null
                || interview.getStatus().isBlank()) {

            interview.setStatus("SCHEDULED");
        }

        return interviewRepository.save(interview);
    }

    public List<Interview> getAllInterviews() {
        return interviewRepository.findAll();
    }

    public Interview getInterviewById(Long id) {

        return interviewRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Interview not found"));
    }

    public List<Interview> getByCandidate(
            Long candidateId) {

        return interviewRepository
                .findByCandidateId(candidateId);
    }

    public List<Interview> getByStatus(
            String status) {

        return interviewRepository
                .findByStatus(status);
    }

    public Interview updateInterview(
            Long id,
            Interview interview) {

        Interview existing = getInterviewById(id);

        existing.setCandidateId(
                interview.getCandidateId());

        existing.setInterviewer(
                interview.getInterviewer());

        existing.setInterviewDate(
                interview.getInterviewDate());

        existing.setInterviewTime(
                interview.getInterviewTime());

        existing.setInterviewType(
                interview.getInterviewType());

        existing.setStatus(
                interview.getStatus());

        existing.setResult(
                interview.getResult());

        existing.setFeedback(
                interview.getFeedback());

        return interviewRepository.save(existing);
    }

    public void deleteInterview(Long id) {

        Interview interview = getInterviewById(id);

        interviewRepository.delete(interview);
    }
}