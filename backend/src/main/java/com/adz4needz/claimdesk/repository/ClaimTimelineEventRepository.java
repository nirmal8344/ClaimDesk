package com.adz4needz.claimdesk.repository;

import com.adz4needz.claimdesk.entity.ClaimTimelineEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClaimTimelineEventRepository extends JpaRepository<ClaimTimelineEvent, Long> {
    List<ClaimTimelineEvent> findByClaimIdOrderByEventTimeAsc(Long claimId);
}
