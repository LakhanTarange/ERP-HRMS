package com.erp.hrms.service;

import com.erp.hrms.entity.Designation;
import com.erp.hrms.repository.DesignationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DesignationService {

    private final DesignationRepository designationRepository;

    public DesignationService(
            DesignationRepository designationRepository) {

        this.designationRepository = designationRepository;
    }

    public Designation createDesignation(
            Designation designation) {

        validateDesignation(designation);

        String name = designation.getName().trim();
        String code = normalizeCode(designation.getCode());

        if (designationRepository.existsByNameIgnoreCase(name)) {
            throw new RuntimeException(
                    "Designation name already exists"
            );
        }

        if (code != null &&
                designationRepository.existsByCodeIgnoreCase(code)) {

            throw new RuntimeException(
                    "Designation code already exists"
            );
        }

        designation.setName(name);
        designation.setCode(code);

        if (designation.getDescription() != null) {
            designation.setDescription(
                    designation.getDescription().trim()
            );
        }

        if (designation.getLevel() != null) {
            designation.setLevel(
                    designation.getLevel().trim()
            );
        }

        if (designation.getActive() == null) {
            designation.setActive(true);
        }

        return designationRepository.save(designation);
    }

    public List<Designation> getAllDesignations() {
        return designationRepository.findAll();
    }

    public Designation getDesignationById(Long id) {

        if (id == null) {
            throw new RuntimeException(
                    "Designation ID is required"
            );
        }

        return designationRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Designation not found with ID: " + id
                        )
                );
    }

    public Designation updateDesignation(
            Long id,
            Designation designation) {

        Designation existing = getDesignationById(id);

        validateDesignation(designation);

        String name = designation.getName().trim();
        String code = normalizeCode(designation.getCode());

        if (designationRepository
                .existsByNameIgnoreCaseAndIdNot(name, id)) {

            throw new RuntimeException(
                    "Designation name already exists"
            );
        }

        if (code != null &&
                designationRepository
                        .existsByCodeIgnoreCaseAndIdNot(code, id)) {

            throw new RuntimeException(
                    "Designation code already exists"
            );
        }

        existing.setName(name);
        existing.setCode(code);

        existing.setDescription(
                designation.getDescription() == null
                        ? null
                        : designation.getDescription().trim()
        );

        existing.setLevel(
                designation.getLevel() == null
                        ? null
                        : designation.getLevel().trim()
        );

        existing.setActive(
                designation.getActive() == null
                        ? true
                        : designation.getActive()
        );

        return designationRepository.save(existing);
    }

    public void deleteDesignation(Long id) {

        Designation designation = getDesignationById(id);

        designationRepository.delete(designation);
    }

    private void validateDesignation(
            Designation designation) {

        if (designation == null) {
            throw new RuntimeException(
                    "Designation data is required"
            );
        }

        if (designation.getName() == null ||
                designation.getName().trim().isEmpty()) {

            throw new RuntimeException(
                    "Designation name is required"
            );
        }

        if (designation.getName().trim().length() < 2) {
            throw new RuntimeException(
                    "Designation name must contain at least 2 characters"
            );
        }

        if (designation.getCode() != null &&
                designation.getCode().trim().length() > 50) {

            throw new RuntimeException(
                    "Designation code cannot exceed 50 characters"
            );
        }
    }

    private String normalizeCode(String code) {

        if (code == null || code.trim().isEmpty()) {
            return null;
        }

        return code.trim().toUpperCase();
    }
}