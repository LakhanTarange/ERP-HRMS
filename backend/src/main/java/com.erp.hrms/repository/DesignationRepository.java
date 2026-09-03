package com.erp.hrms.repository;

import com.erp.hrms.entity.Designation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DesignationRepository extends JpaRepository<Designation, Long> {

    Optional<Designation> findByName(String name);

    Optional<Designation> findByCode(String code);
}