package com.erp.hrms.service;

import com.erp.hrms.entity.EmployeeDocument;
import com.erp.hrms.repository.EmployeeDocumentRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class EmployeeDocumentService {

    private final EmployeeDocumentRepository documentRepository;

    public EmployeeDocumentService(
            EmployeeDocumentRepository documentRepository) {

        this.documentRepository = documentRepository;
    }

    public EmployeeDocument createDocument(
            EmployeeDocument document) {

        if (document.getUploadedDate() == null) {
            document.setUploadedDate(LocalDate.now());
        }

        if (document.getStatus() == null
                || document.getStatus().isBlank()) {

            document.setStatus("ACTIVE");
        }

        return documentRepository.save(document);
    }

    public List<EmployeeDocument> getAllDocuments() {
        return documentRepository.findAll();
    }

    public EmployeeDocument getDocumentById(Long id) {

        return documentRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Employee document not found"));
    }

    public List<EmployeeDocument> getDocumentsByEmployee(
            Long employeeId) {

        return documentRepository.findByEmployeeId(employeeId);
    }

    public List<EmployeeDocument> getDocumentsByType(
            String documentType) {

        return documentRepository
                .findByDocumentType(documentType);
    }

    public List<EmployeeDocument> getDocumentsByStatus(
            String status) {

        return documentRepository.findByStatus(status);
    }

    public EmployeeDocument updateDocument(
            Long id,
            EmployeeDocument document) {

        EmployeeDocument existing =
                getDocumentById(id);

        existing.setEmployeeId(
                document.getEmployeeId());

        existing.setDocumentType(
                document.getDocumentType());

        existing.setDocumentName(
                document.getDocumentName());

        existing.setDocumentNumber(
                document.getDocumentNumber());

        existing.setFilePath(
                document.getFilePath());

        existing.setUploadedDate(
                document.getUploadedDate());

        existing.setExpiryDate(
                document.getExpiryDate());

        existing.setStatus(
                document.getStatus());

        existing.setRemarks(
                document.getRemarks());

        return documentRepository.save(existing);
    }

    public void deleteDocument(Long id) {

        EmployeeDocument document =
                getDocumentById(id);

        documentRepository.delete(document);
    }
}