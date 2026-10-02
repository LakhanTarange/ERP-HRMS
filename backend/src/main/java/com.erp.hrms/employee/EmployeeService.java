package com.erp.hrms.employee;

import com.erp.hrms.entity.Employee;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EmployeeService {

    private final EmployeeRepository employeeRepository;

    public EmployeeService(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    public Employee createEmployee(Employee employee) {

        validateEmployee(employee);

        String employeeCode = employee.getEmployeeCode().trim();
        String email = employee.getEmail().trim().toLowerCase();

        employee.setEmployeeCode(employeeCode);
        employee.setEmail(email);

        if (employeeRepository.existsByEmployeeCode(employeeCode)) {
            throw new RuntimeException("Employee code already exists");
        }

        if (employeeRepository.existsByEmail(email)) {
            throw new RuntimeException("Employee email already exists");
        }

        if (employee.getStatus() == null ||
                employee.getStatus().trim().isEmpty()) {
            employee.setStatus("ACTIVE");
        }

        return employeeRepository.save(employee);
    }

    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    public Employee getEmployeeById(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Employee not found with ID: " + id));
    }

    public Employee updateEmployee(Long id, Employee updated) {

        Employee employee = getEmployeeById(id);

        validateEmployee(updated);

        String employeeCode = updated.getEmployeeCode().trim();
        String email = updated.getEmail().trim().toLowerCase();

        if (employeeRepository.existsByEmployeeCodeAndIdNot(
                employeeCode, id)) {
            throw new RuntimeException(
                    "Employee code already exists");
        }

        if (employeeRepository.existsByEmailAndIdNot(
                email, id)) {
            throw new RuntimeException(
                    "Employee email already exists");
        }

        employee.setEmployeeCode(employeeCode);
        employee.setFirstName(updated.getFirstName().trim());
        employee.setLastName(
                updated.getLastName() == null
                        ? null
                        : updated.getLastName().trim());
        employee.setEmail(email);
        employee.setPhone(updated.getPhone());
        employee.setDateOfBirth(updated.getDateOfBirth());
        employee.setGender(updated.getGender());
        employee.setDateOfJoining(updated.getDateOfJoining());
        employee.setDepartmentId(updated.getDepartmentId());
        employee.setDesignationId(updated.getDesignationId());
        employee.setAddress(updated.getAddress());

        if (updated.getStatus() == null ||
                updated.getStatus().trim().isEmpty()) {
            employee.setStatus("ACTIVE");
        } else {
            employee.setStatus(updated.getStatus());
        }

        return employeeRepository.save(employee);
    }

    public void deleteEmployee(Long id) {

        if (!employeeRepository.existsById(id)) {
            throw new RuntimeException(
                    "Employee not found with ID: " + id);
        }

        employeeRepository.deleteById(id);
    }

    private void validateEmployee(Employee employee) {

        if (employee == null) {
            throw new RuntimeException(
                    "Employee data is required");
        }

        if (employee.getEmployeeCode() == null ||
                employee.getEmployeeCode().trim().isEmpty()) {
            throw new RuntimeException(
                    "Employee code is required");
        }

        if (employee.getFirstName() == null ||
                employee.getFirstName().trim().isEmpty()) {
            throw new RuntimeException(
                    "First name is required");
        }

        if (employee.getEmail() == null ||
                employee.getEmail().trim().isEmpty()) {
            throw new RuntimeException(
                    "Email is required");
        }

        if (!employee.getEmail().matches(
                "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$")) {
            throw new RuntimeException(
                    "Invalid email address");
        }

        if (employee.getDateOfJoining() != null &&
                employee.getDateOfBirth() != null &&
                employee.getDateOfJoining()
                        .isBefore(employee.getDateOfBirth())) {

            throw new RuntimeException(
                    "Date of joining cannot be before date of birth");
        }
    }
}