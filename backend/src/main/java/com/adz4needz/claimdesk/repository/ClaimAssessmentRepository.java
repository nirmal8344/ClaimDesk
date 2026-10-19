package com.adz4needz.claimdesk.repository;

import com.adz4needz.claimdesk.entity.ClaimAssessment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ClaimAssessmentRepository extends JpaRepository<ClaimAssessment, Long> {
    Optional<ClaimAssessment> findByClaimId(Long claimId);
    boolean existsByClaimId(Long claimId);
}
