package com.adz4needz.claimdesk.repository;

import com.adz4needz.claimdesk.entity.DocumentRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentRequestRepository extends JpaRepository<DocumentRequest, Long> {
    List<DocumentRequest> findByClaimId(Long claimId);
    List<DocumentRequest> findByClaimIdAndStatus(Long claimId, String status);
    long countByClaimIdAndStatus(Long claimId, String status);
}
