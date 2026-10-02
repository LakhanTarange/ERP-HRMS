package com.erp.hrms.service;

import com.erp.hrms.entity.Department;
import com.erp.hrms.repository.DepartmentRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DepartmentService {

    private final DepartmentRepository departmentRepository;

    public DepartmentService(DepartmentRepository departmentRepository) {
        this.departmentRepository = departmentRepository;
    }

    public Department createDepartment(Department department) {

        validateDepartment(department);

        String name = department.getName().trim();
        String code = normalizeCode(department.getCode());

        if (departmentRepository.existsByNameIgnoreCase(name)) {
            throw new RuntimeException(
                    "Department name already exists"
            );
        }

        if (code != null &&
                departmentRepository.existsByCodeIgnoreCase(code)) {
            throw new RuntimeException(
                    "Department code already exists"
            );
        }

        department.setName(name);
        department.setCode(code);

        if (department.getDescription() != null) {
            department.setDescription(
                    department.getDescription().trim()
            );
        }

        if (department.getActive() == null) {
            department.setActive(true);
        }

        return departmentRepository.save(department);
    }

    public List<Department> getAllDepartments() {
        return departmentRepository.findAll();
    }

    public Department getDepartmentById(Long id) {

        if (id == null) {
            throw new RuntimeException(
                    "Department ID is required"
            );
        }

        return departmentRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Department not found with ID: " + id
                        )
                );
    }

    public Department updateDepartment(
            Long id,
            Department department) {

        Department existing = getDepartmentById(id);

        validateDepartment(department);

        String name = department.getName().trim();
        String code = normalizeCode(department.getCode());

        if (departmentRepository
                .existsByNameIgnoreCaseAndIdNot(name, id)) {

            throw new RuntimeException(
                    "Department name already exists"
            );
        }

        if (code != null &&
                departmentRepository
                        .existsByCodeIgnoreCaseAndIdNot(code, id)) {

            throw new RuntimeException(
                    "Department code already exists"
            );
        }

        existing.setName(name);
        existing.setCode(code);

        existing.setDescription(
                department.getDescription() == null
                        ? null
                        : department.getDescription().trim()
        );

        existing.setActive(
                department.getActive() == null
                        ? true
                        : department.getActive()
        );

        return departmentRepository.save(existing);
    }

    public void deleteDepartment(Long id) {

        Department department = getDepartmentById(id);

        departmentRepository.delete(department);
    }

    private void validateDepartment(Department department) {

        if (department == null) {
            throw new RuntimeException(
                    "Department data is required"
            );
        }

        if (department.getName() == null ||
                department.getName().trim().isEmpty()) {

            throw new RuntimeException(
                    "Department name is required"
            );
        }

        if (department.getName().trim().length() < 2) {
            throw new RuntimeException(
                    "Department name must contain at least 2 characters"
            );
        }

        if (department.getCode() != null &&
                department.getCode().trim().length() > 50) {

            throw new RuntimeException(
                    "Department code cannot exceed 50 characters"
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