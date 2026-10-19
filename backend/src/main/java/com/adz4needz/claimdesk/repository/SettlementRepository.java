package com.adz4needz.claimdesk.repository;

import com.adz4needz.claimdesk.entity.Settlement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface SettlementRepository extends JpaRepository<Settlement, Long> {
    Optional<Settlement> findByClaimId(Long claimId);
    Optional<Settlement> findBySettlementReference(String settlementReference);
    boolean existsBySettlementReference(String settlementReference);
    long countByStatus(String status);

    @Query("SELECT COALESCE(SUM(s.settlementAmount), 0) FROM Settlement s WHERE s.status = 'Completed'")
    BigDecimal sumTotalCompletedSettlement();

    @Query("SELECT FUNCTION('to_char', s.settlementDate, 'YYYY-MM') as month, SUM(s.settlementAmount) " +
           "FROM Settlement s WHERE s.status = 'Completed' GROUP BY FUNCTION('to_char', s.settlementDate, 'YYYY-MM') ORDER BY month ASC")
    List<Object[]> sumSettlementsByMonth();
}
