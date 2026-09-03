package com.erp.hrms.service;

import com.erp.hrms.dto.AuthResponse;
import com.erp.hrms.dto.LoginRequest;
import com.erp.hrms.dto.RegisterRequest;
import com.erp.hrms.entity.Role;
import com.erp.hrms.entity.RoleName;
import com.erp.hrms.entity.User;
import com.erp.hrms.repository.RoleRepository;
import com.erp.hrms.repository.UserRepository;
import com.erp.hrms.security.JwtService;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {

        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public String register(RegisterRequest request) {

        if (userRepository.existsByUsername(request.getUsername())) {
            return "Username already exists";
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            return "Email already exists";
        }

        RoleName roleName;

        try {
            roleName = RoleName.valueOf(
                    request.getRole().toUpperCase()
            );
        } catch (Exception e) {
            roleName = RoleName.EMPLOYEE;
        }

        Role role = roleRepository
                .findByName(roleName)
                .orElseThrow();

        User user = new User();

        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(
                passwordEncoder.encode(request.getPassword())
        );
        user.setRole(role);
        user.setEnabled(true);

        userRepository.save(user);

        return "User registered successfully";
    }

    public AuthResponse login(LoginRequest request) {

        User user = userRepository
                .findByUsername(request.getUsername())
                .orElseThrow(() ->
                        new RuntimeException("Invalid username or password")
                );

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword())) {

            throw new RuntimeException(
                    "Invalid username or password"
            );
        }

        String token = jwtService.generateToken(
                user.getUsername(),
                user.getRole().getName().name(),
                user.getEmployeeId()
        );

        return new AuthResponse(
                token,
                user.getUsername(),
                user.getRole().getName().name(),
                user.getEmployeeId()
        );
    }
}