package com.adz4needz.claimdesk.repository;

import com.adz4needz.claimdesk.entity.Claim;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ClaimRepository extends JpaRepository<Claim, Long> {

    Optional<Claim> findByClaimNumber(String claimNumber);
    boolean existsByClaimNumber(String claimNumber);

    List<Claim> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
    List<Claim> findByCustomerIdAndStatus(Long customerId, String status);

    List<Claim> findByAssignedOfficerIdOrderByCreatedAtDesc(Long officerId);

    long countByCustomerId(Long customerId);
    long countByCustomerIdAndStatus(Long customerId, String status);
    long countByCustomerIdAndStatusIn(Long customerId, List<String> statuses);

    long countByAssignedOfficerId(Long officerId);
    long countByAssignedOfficerIdAndStatus(Long officerId, String status);
    long countByAssignedOfficerIdAndStatusIn(Long officerId, List<String> statuses);

    long countByStatus(String status);
    long countByStatusIn(List<String> statuses);

    @Query("SELECT COUNT(c) FROM Claim c WHERE c.assignedOfficer IS NULL AND c.status != 'Draft'")
    long countUnassignedClaims();

    @Query("SELECT c.claimType, COUNT(c) FROM Claim c GROUP BY c.claimType")
    List<Object[]> countByClaimTypeGroup();

    @Query("SELECT c.status, COUNT(c) FROM Claim c GROUP BY c.status")
    List<Object[]> countByStatusGroup();

    @Query("SELECT SUM(c.requestedAmount) FROM Claim c WHERE c.status = 'Settled'")
    BigDecimal sumSettledAmount();

    @Query("SELECT c FROM Claim c WHERE " +
           "(:customerId IS NULL OR c.customer.id = :customerId) AND " +
           "(:officerId IS NULL OR c.assignedOfficer.id = :officerId) AND " +
           "(:status IS NULL OR c.status = :status) AND " +
           "(:priority IS NULL OR c.priority = :priority) AND " +
           "(:claimType IS NULL OR c.claimType = :claimType) AND " +
           "(:startDate IS NULL OR c.incidentDate >= :startDate) AND " +
           "(:endDate IS NULL OR c.incidentDate <= :endDate) AND " +
           "(:search IS NULL OR (" +
           "LOWER(c.claimNumber) LIKE :search OR " +
           "LOWER(c.policy.policyNumber) LIKE :search OR " +
           "LOWER(c.customer.fullName) LIKE :search OR " +
           "LOWER(c.incidentTitle) LIKE :search OR " +
           "LOWER(c.incidentLocation) LIKE :search))")
    Page<Claim> filterClaims(
            @Param("customerId") Long customerId,
            @Param("officerId") Long officerId,
            @Param("status") String status,
            @Param("priority") String priority,
            @Param("claimType") String claimType,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("search") String search,
            Pageable pageable
    );

    @Query("SELECT c FROM Claim c WHERE " +
           "c.customer.id = :customerId AND " +
           "(:status IS NULL OR c.status = :status) AND " +
           "(:search IS NULL OR (" +
           "LOWER(c.claimNumber) LIKE :search OR " +
           "LOWER(c.policy.policyNumber) LIKE :search OR " +
           "LOWER(c.incidentTitle) LIKE :search))")
    Page<Claim> findCustomerClaims(
            @Param("customerId") Long customerId,
            @Param("status") String status,
            @Param("search") String search,
            Pageable pageable
    );

    @Query("SELECT c FROM Claim c WHERE " +
           "c.assignedOfficer.id = :officerId AND " +
           "(:status IS NULL OR c.status = :status) AND " +
           "(:priority IS NULL OR c.priority = :priority) AND " +
           "(:claimType IS NULL OR c.claimType = :claimType) AND " +
           "(:search IS NULL OR (" +
           "LOWER(c.claimNumber) LIKE :search OR " +
           "LOWER(c.customer.fullName) LIKE :search OR " +
           "LOWER(c.policy.policyNumber) LIKE :search))")
    Page<Claim> findOfficerClaims(
            @Param("officerId") Long officerId,
            @Param("status") String status,
            @Param("priority") String priority,
            @Param("claimType") String claimType,
            @Param("search") String search,
            Pageable pageable
    );

    @Query("SELECT FUNCTION('to_char', c.createdAt, 'YYYY-MM') as month, COUNT(c) " +
           "FROM Claim c GROUP BY FUNCTION('to_char', c.createdAt, 'YYYY-MM') ORDER BY month ASC")
    List<Object[]> countClaimsByMonth();
}
