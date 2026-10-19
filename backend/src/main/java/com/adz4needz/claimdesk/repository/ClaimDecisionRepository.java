package com.adz4needz.claimdesk.repository;

import com.adz4needz.claimdesk.entity.ClaimDecision;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ClaimDecisionRepository extends JpaRepository<ClaimDecision, Long> {
    Optional<ClaimDecision> findByClaimId(Long claimId);
    boolean existsByClaimId(Long claimId);
}
