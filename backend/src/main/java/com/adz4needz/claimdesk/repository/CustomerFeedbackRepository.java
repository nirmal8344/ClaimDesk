package com.adz4needz.claimdesk.repository;

import com.adz4needz.claimdesk.entity.CustomerFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomerFeedbackRepository extends JpaRepository<CustomerFeedback, Long> {
    List<CustomerFeedback> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
    List<CustomerFeedback> findByClaimId(Long claimId);
}
