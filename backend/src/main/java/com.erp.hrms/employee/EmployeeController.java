package com.erp.hrms.employee;

import com.erp.hrms.entity.Employee;
import com.erp.hrms.entity.Role;
import com.erp.hrms.entity.RoleName;
import com.erp.hrms.entity.User;
import com.erp.hrms.repository.RoleRepository;
import com.erp.hrms.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/employees")
@CrossOrigin(origins = "*")
public class EmployeeController {

    private final EmployeeService employeeService;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public EmployeeController(
            EmployeeService employeeService,
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder) {
        this.employeeService = employeeService;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping
    public ResponseEntity<Employee> createEmployee(@RequestBody Employee employee) {
        return ResponseEntity.ok(employeeService.createEmployee(employee));
    }

    @GetMapping
    public ResponseEntity<List<Employee>> getAllEmployees() {
        return ResponseEntity.ok(employeeService.getAllEmployees());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Employee> getEmployeeById(@PathVariable Long id) {
        return ResponseEntity.ok(employeeService.getEmployeeById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Employee> updateEmployee(
            @PathVariable Long id,
            @RequestBody Employee employee) {
        return ResponseEntity.ok(employeeService.updateEmployee(id, employee));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteEmployee(@PathVariable Long id) {
        employeeService.deleteEmployee(id);
        return ResponseEntity.ok("Employee deleted successfully");
    }

    @PostMapping("/{id}/create-login")
    public ResponseEntity<String> createLogin(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        Employee employee = employeeService.getEmployeeById(id);

        String username = body.get("username");
        String password = body.get("password");

        if (userRepository.existsByUsername(username)) {
            return ResponseEntity.badRequest().body("Username already exists");
        }

        Role role = roleRepository.findByName(RoleName.EMPLOYEE).orElseThrow();

        User user = new User();
        user.setUsername(username);
        user.setEmail(employee.getEmail());
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(role);
        user.setEnabled(true);
        user.setEmployeeId(employee.getId());

        userRepository.save(user);

        return ResponseEntity.ok("Login created successfully for " + username);
    }
}