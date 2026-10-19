package com.adz4needz.claimdesk.repository;

import com.adz4needz.claimdesk.entity.Policy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PolicyRepository extends JpaRepository<Policy, Long> {
    List<Policy> findByCustomerId(Long customerId);
    List<Policy> findByCustomerIdAndStatus(Long customerId, String status);
    Optional<Policy> findByPolicyNumber(String policyNumber);
    boolean existsByPolicyNumber(String policyNumber);

    long countByCustomerIdAndStatus(Long customerId, String status);

    @Query("SELECT p FROM Policy p WHERE (" +
           "LOWER(p.policyNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.policyType) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.providerCompany) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.customer.fullName) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Policy> searchPolicies(@Param("search") String search, Pageable pageable);

    @Query("SELECT p FROM Policy p WHERE p.status = :status AND (" +
           "LOWER(p.policyNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.policyType) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.providerCompany) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.customer.fullName) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Policy> searchPoliciesByStatus(@Param("status") String status, @Param("search") String search, Pageable pageable);

    long countByStatus(String status);
}
