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
        return employeeRepository.save(employee);
    }

    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    public Employee getEmployeeById(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
    }

    public Employee updateEmployee(Long id, Employee updated) {
        Employee employee = getEmployeeById(id);

        employee.setEmployeeCode(updated.getEmployeeCode());
        employee.setFirstName(updated.getFirstName());
        employee.setLastName(updated.getLastName());
        employee.setEmail(updated.getEmail());
        employee.setPhone(updated.getPhone());
        employee.setDateOfBirth(updated.getDateOfBirth());
        employee.setGender(updated.getGender());
        employee.setDateOfJoining(updated.getDateOfJoining());
        employee.setDepartmentId(updated.getDepartmentId());
        employee.setDesignationId(updated.getDesignationId());
        employee.setAddress(updated.getAddress());
        employee.setStatus(updated.getStatus());

        return employeeRepository.save(employee);
    }

    public void deleteEmployee(Long id) {
        employeeRepository.deleteById(id);
    }
}