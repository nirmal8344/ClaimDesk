package com.adz4needz.claimdesk.repository;

import com.adz4needz.claimdesk.entity.ClaimNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClaimNoteRepository extends JpaRepository<ClaimNote, Long> {
    List<ClaimNote> findByClaimIdOrderByCreatedAtDesc(Long claimId);
    List<ClaimNote> findByClaimIdAndIsInternalFalseOrderByCreatedAtDesc(Long claimId);
}
