package com.erp.hrms.config;

import com.erp.hrms.entity.Role;
import com.erp.hrms.entity.RoleName;
import com.erp.hrms.repository.RoleRepository;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initializeRoles(RoleRepository roleRepository) {

        return args -> {

            for (RoleName roleName : RoleName.values()) {

                if (roleRepository.findByName(roleName).isEmpty()) {

                    Role role = new Role();
                    role.setName(roleName);

                    roleRepository.save(role);
                }
            }

            System.out.println("Default roles initialized successfully.");
        };
    }
}