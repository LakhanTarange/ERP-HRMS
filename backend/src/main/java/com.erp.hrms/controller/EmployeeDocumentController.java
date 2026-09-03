package com.erp.hrms.controller;

import com.erp.hrms.entity.EmployeeDocument;
import com.erp.hrms.repository.EmployeeDocumentRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employee-documents")
@CrossOrigin(origins = "*")
public class EmployeeDocumentController {

    private final EmployeeDocumentRepository employeeDocumentRepository;

    public EmployeeDocumentController(EmployeeDocumentRepository employeeDocumentRepository) {
        this.employeeDocumentRepository = employeeDocumentRepository;
    }

    @PostMapping
    public ResponseEntity<EmployeeDocument> createDocument(@RequestBody EmployeeDocument document) {
        return ResponseEntity.ok(employeeDocumentRepository.save(document));
    }

    @GetMapping
    public ResponseEntity<List<EmployeeDocument>> getAllDocuments() {
        return ResponseEntity.ok(employeeDocumentRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmployeeDocument> getDocumentById(@PathVariable Long id) {
        return ResponseEntity.ok(
                employeeDocumentRepository.findById(id)
                        .orElseThrow(() -> new RuntimeException("Document not found"))
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteDocument(@PathVariable Long id) {
        employeeDocumentRepository.deleteById(id);
        return ResponseEntity.ok("Document deleted successfully");
    }
}