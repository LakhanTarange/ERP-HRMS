package com.erp.hrms.service;

import com.erp.hrms.entity.Designation;
import com.erp.hrms.repository.DesignationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DesignationService {

    private final DesignationRepository designationRepository;

    public DesignationService(DesignationRepository designationRepository) {
        this.designationRepository = designationRepository;
    }

    public Designation createDesignation(Designation designation) {
        return designationRepository.save(designation);
    }

    public List<Designation> getAllDesignations() {
        return designationRepository.findAll();
    }

    public Designation getDesignationById(Long id) {
        return designationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Designation not found"));
    }

    public Designation updateDesignation(Long id, Designation designation) {

        Designation existing = getDesignationById(id);

        existing.setName(designation.getName());
        existing.setCode(designation.getCode());
        existing.setDescription(designation.getDescription());
        existing.setLevel(designation.getLevel());
        existing.setActive(designation.getActive());

        return designationRepository.save(existing);
    }

    public void deleteDesignation(Long id) {

        Designation designation = getDesignationById(id);

        designationRepository.delete(designation);
    }
}