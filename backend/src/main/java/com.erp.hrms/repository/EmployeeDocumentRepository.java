package com.erp.hrms.repository;

import com.erp.hrms.entity.EmployeeDocument;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EmployeeDocumentRepository
        extends JpaRepository<EmployeeDocument, Long> {

    List<EmployeeDocument> findByEmployeeId(Long employeeId);

    List<EmployeeDocument> findByDocumentType(String documentType);

    List<EmployeeDocument> findByStatus(String status);
}