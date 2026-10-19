package com.adz4needz.claimdesk.repository;

import com.adz4needz.claimdesk.entity.ClaimCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClaimCategoryRepository extends JpaRepository<ClaimCategory, Long> {
    Optional<ClaimCategory> findByName(String name);
    boolean existsByName(String name);
    List<ClaimCategory> findByStatus(String status);
}
