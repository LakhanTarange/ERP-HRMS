package com.erp.hrms.controller;

import com.erp.hrms.entity.Designation;
import com.erp.hrms.service.DesignationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/designations")
@CrossOrigin(origins = "*")
public class DesignationController {

    private final DesignationService designationService;

    public DesignationController(DesignationService designationService) {
        this.designationService = designationService;
    }

    @PostMapping
    public ResponseEntity<Designation> createDesignation(
            @RequestBody Designation designation) {

        return ResponseEntity.ok(
                designationService.createDesignation(designation)
        );
    }

    @GetMapping
    public ResponseEntity<List<Designation>> getAllDesignations() {

        return ResponseEntity.ok(
                designationService.getAllDesignations()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Designation> getDesignationById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                designationService.getDesignationById(id)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<Designation> updateDesignation(
            @PathVariable Long id,
            @RequestBody Designation designation) {

        return ResponseEntity.ok(
                designationService.updateDesignation(id, designation)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteDesignation(
            @PathVariable Long id) {

        designationService.deleteDesignation(id);

        return ResponseEntity.ok("Designation deleted successfully");
    }
}