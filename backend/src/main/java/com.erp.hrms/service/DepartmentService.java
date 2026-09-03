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
        return departmentRepository.save(department);
    }

    public List<Department> getAllDepartments() {
        return departmentRepository.findAll();
    }

    public Department getDepartmentById(Long id) {
        return departmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Department not found"));
    }

    public Department updateDepartment(Long id, Department department) {

        Department existing = getDepartmentById(id);

        existing.setName(department.getName());
        existing.setCode(department.getCode());
        existing.setDescription(department.getDescription());
        existing.setActive(department.getActive());

        return departmentRepository.save(existing);
    }

    public void deleteDepartment(Long id) {

        Department department = getDepartmentById(id);

        departmentRepository.delete(department);
    }
}