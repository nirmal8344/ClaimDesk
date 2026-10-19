package com.adz4needz.claimdesk.repository;

import com.adz4needz.claimdesk.entity.ClaimDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClaimDocumentRepository extends JpaRepository<ClaimDocument, Long> {
    List<ClaimDocument> findByClaimId(Long claimId);
    List<ClaimDocument> findByClaimIdAndIsPhoto(Long claimId, Boolean isPhoto);
    long countByClaimIdAndIsPhoto(Long claimId, Boolean isPhoto);
    long countByClaimIdAndReviewStatus(Long claimId, String reviewStatus);
    long countByReviewStatus(String reviewStatus);
}
