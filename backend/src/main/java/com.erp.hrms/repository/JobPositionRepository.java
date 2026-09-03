package com.erp.hrms.repository;

import com.erp.hrms.entity.JobPosition;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JobPositionRepository
        extends JpaRepository<JobPosition, Long> {

    List<JobPosition> findByStatus(String status);

    List<JobPosition> findByDepartment(String department);
}