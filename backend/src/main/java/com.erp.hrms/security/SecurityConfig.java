package com.erp.hrms.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http)
            throws Exception {

        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> {})
                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )
                .authorizeHttpRequests(auth -> auth

                        .requestMatchers("/api/auth/**").permitAll()

                        // Only Admin/HR/Manager can delete records
                        .requestMatchers("DELETE", "/api/employees/**")
                            .hasAnyAuthority("ROLE_SUPER_ADMIN", "ROLE_HR_ADMIN")
                        .requestMatchers("DELETE", "/api/departments/**")
                            .hasAnyAuthority("ROLE_SUPER_ADMIN", "ROLE_HR_ADMIN")
                        .requestMatchers("DELETE", "/api/designations/**")
                            .hasAnyAuthority("ROLE_SUPER_ADMIN", "ROLE_HR_ADMIN")
                        .requestMatchers("DELETE", "/api/payroll/**")
                            .hasAnyAuthority("ROLE_SUPER_ADMIN", "ROLE_HR_ADMIN", "ROLE_ACCOUNTANT")

                        // Only Admin/HR/Manager can create/update employees, departments, designations
                        .requestMatchers("POST", "/api/employees/**")
                            .hasAnyAuthority("ROLE_SUPER_ADMIN", "ROLE_HR_ADMIN")
                        .requestMatchers("PUT", "/api/employees/**")
                            .hasAnyAuthority("ROLE_SUPER_ADMIN", "ROLE_HR_ADMIN")
                        .requestMatchers("POST", "/api/departments/**")
                            .hasAnyAuthority("ROLE_SUPER_ADMIN", "ROLE_HR_ADMIN")
                        .requestMatchers("POST", "/api/designations/**")
                            .hasAnyAuthority("ROLE_SUPER_ADMIN", "ROLE_HR_ADMIN")

                        // Payroll processing only by Admin/HR/Accountant
                        .requestMatchers("POST", "/api/payroll/**")
                            .hasAnyAuthority("ROLE_SUPER_ADMIN", "ROLE_HR_ADMIN", "ROLE_ACCOUNTANT")

                        // Everything else just needs to be logged in
                        .anyRequest().authenticated()
                )
                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }
}