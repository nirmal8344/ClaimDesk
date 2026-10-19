package com.adz4needz.claimdesk.service;

import com.adz4needz.claimdesk.dto.AdminDashboardDto;
import com.adz4needz.claimdesk.dto.CustomerDashboardDto;
import com.adz4needz.claimdesk.dto.OfficerDashboardDto;
import com.adz4needz.claimdesk.entity.Claim;
import com.adz4needz.claimdesk.repository.ClaimRepository;
import com.adz4needz.claimdesk.repository.PolicyRepository;
import com.adz4needz.claimdesk.repository.SettlementRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final ClaimRepository claimRepository;
    private final PolicyRepository policyRepository;
    private final SettlementRepository settlementRepository;
    private final ClaimService claimService;
    private final PolicyService policyService;

    public DashboardService(ClaimRepository claimRepository,
                            PolicyRepository policyRepository,
                            SettlementRepository settlementRepository,
                            ClaimService claimService,
                            PolicyService policyService) {
        this.claimRepository = claimRepository;
        this.policyRepository = policyRepository;
        this.settlementRepository = settlementRepository;
        this.claimService = claimService;
        this.policyService = policyService;
    }

    public CustomerDashboardDto getCustomerDashboard(Long customerId) {
        CustomerDashboardDto dto = new CustomerDashboardDto();
        dto.setActivePolicies(policyRepository.countByCustomerIdAndStatus(customerId, "ACTIVE"));
        dto.setTotalClaims(claimRepository.countByCustomerId(customerId));
        dto.setUnderReview(claimRepository.countByCustomerIdAndStatus(customerId, "Under Review"));
        dto.setSettled(claimRepository.countByCustomerIdAndStatus(customerId, "Settled"));
        dto.setDocumentsPending(claimRepository.countByCustomerIdAndStatus(customerId, "Documents Required"));
        dto.setApproved(claimRepository.countByCustomerIdAndStatus(customerId, "Approved"));

        List<Claim> recent = claimRepository.findByCustomerIdOrderByCreatedAtDesc(customerId);
        dto.setRecentClaims(recent.stream().limit(5).map(claimService::enrichClaimDto).collect(Collectors.toList()));
        dto.setActivePoliciesList(policyService.getPoliciesForCustomerAndStatus(customerId, "ACTIVE"));

        return dto;
    }

    public OfficerDashboardDto getOfficerDashboard(Long officerId) {
        OfficerDashboardDto dto = new OfficerDashboardDto();

        dto.setAssignedClaims(claimRepository.countByAssignedOfficerId(officerId));
        dto.setPendingDocuments(claimRepository.countByAssignedOfficerIdAndStatus(officerId, "Documents Required"));
        dto.setUnderReview(claimRepository.countByAssignedOfficerIdAndStatus(officerId, "Under Review"));
        dto.setAssessmentPending(claimRepository.countByAssignedOfficerIdAndStatus(officerId, "Assessment"));
        dto.setApprovedClaims(claimRepository.countByAssignedOfficerIdAndStatus(officerId, "Approved"));
        dto.setRejectedClaims(claimRepository.countByAssignedOfficerIdAndStatus(officerId, "Rejected"));
        dto.setSettlementPending(claimRepository.countByAssignedOfficerIdAndStatus(officerId, "Settlement Processing"));
        dto.setNewClaims(claimRepository.countByAssignedOfficerIdAndStatus(officerId, "Submitted"));

        List<Claim> recent = claimRepository.findByAssignedOfficerIdOrderByCreatedAtDesc(officerId);
        dto.setRecentAssignedClaims(recent.stream().limit(6).map(claimService::enrichClaimDto).collect(Collectors.toList()));

        Map<String, Long> tasks = new LinkedHashMap<>();
        tasks.put("Review pending documents", dto.getPendingDocuments());
        tasks.put("Complete assessments", dto.getAssessmentPending());
        tasks.put("Claims awaiting response", claimRepository.countByAssignedOfficerIdAndStatus(officerId, "Documents Required"));
        tasks.put("Overdue claims", claimRepository.countByAssignedOfficerIdAndStatusIn(officerId, Arrays.asList("Under Review", "Verification")));
        dto.setTasksSummary(tasks);

        Map<String, Long> overview = new LinkedHashMap<>();
        overview.put("New", dto.getNewClaims());
        overview.put("Under Review", dto.getUnderReview());
        overview.put("Documents Required", dto.getPendingDocuments());
        overview.put("Assessment Pending", dto.getAssessmentPending());
        overview.put("Completed", dto.getApprovedClaims() + dto.getRejectedClaims() + claimRepository.countByAssignedOfficerIdAndStatus(officerId, "Settled"));
        dto.setStatusOverview(overview);

        return dto;
    }

    public AdminDashboardDto getAdminDashboard() {
        AdminDashboardDto dto = new AdminDashboardDto();

        long total = claimRepository.count();
        dto.setTotalClaims(total);
        dto.setNewClaims(claimRepository.countByStatus("Submitted"));
        dto.setUnderReview(claimRepository.countByStatus("Under Review"));
        dto.setDocumentsPending(claimRepository.countByStatus("Documents Required"));
        dto.setApproved(claimRepository.countByStatus("Approved"));
        dto.setRejected(claimRepository.countByStatus("Rejected"));
        dto.setSettled(claimRepository.countByStatus("Settled"));

        BigDecimal totalSettled = settlementRepository.sumTotalCompletedSettlement();
        dto.setTotalSettlementAmount(totalSettled != null ? totalSettled : BigDecimal.ZERO);

        // Claims by type group
        Map<String, Long> byType = new LinkedHashMap<>();
        List<Object[]> typeRows = claimRepository.countByClaimTypeGroup();
        for (Object[] row : typeRows) {
            byType.put((String) row[0], (Long) row[1]);
        }
        // Ensure standard keys exist
        for (String t : Arrays.asList("Vehicle Damage", "Property Damage", "Travel", "Electronics/Device", "Other")) {
            byType.putIfAbsent(t, 0L);
        }
        dto.setClaimsByType(byType);

        // Claims by status group
        Map<String, Long> byStatus = new LinkedHashMap<>();
        List<Object[]> statusRows = claimRepository.countByStatusGroup();
        for (Object[] row : statusRows) {
            byStatus.put((String) row[0], (Long) row[1]);
        }
        dto.setClaimsByStatus(byStatus);

        // Monthly claims trend from database
        List<Map<String, Object>> monthly = new ArrayList<>();
        List<Object[]> monthlyClaimRows = claimRepository.countClaimsByMonth();
        List<Object[]> monthlySettlementRows = settlementRepository.sumSettlementsByMonth();

        // Build a map of month -> settled count from settlement data
        Map<String, BigDecimal> settlementByMonth = new LinkedHashMap<>();
        for (Object[] row : monthlySettlementRows) {
            String month = (String) row[0];
            BigDecimal amount = (BigDecimal) row[1];
            settlementByMonth.put(month, amount);
        }

        // Build monthly claims data
        String[] monthLabels = {"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};
        for (Object[] row : monthlyClaimRows) {
            String yearMonth = (String) row[0]; // e.g. "2026-05"
            Long count = (Long) row[1];

            // Parse month label from YYYY-MM
            String monthLabel = yearMonth;
            try {
                int monthNum = Integer.parseInt(yearMonth.split("-")[1]);
                monthLabel = monthLabels[monthNum - 1] + " " + yearMonth.split("-")[0].substring(2);
            } catch (Exception ignored) {}

            Map<String, Object> m = new HashMap<>();
            m.put("month", monthLabel);
            m.put("submitted", count);
            // Find settled count for this month
            BigDecimal settledAmt = settlementByMonth.getOrDefault(yearMonth, BigDecimal.ZERO);
            m.put("settled", settledAmt.longValue() > 0 ? 1 : 0); // Simplified: count of months with settlements
            monthly.add(m);
        }

        // If no data exists, provide an empty list instead of fake data
        dto.setMonthlyClaims(monthly);

        // Settlement trend from database
        List<Map<String, Object>> trend = new ArrayList<>();
        for (Object[] row : monthlySettlementRows) {
            String yearMonth = (String) row[0];
            BigDecimal amount = (BigDecimal) row[1];

            String monthLabel = yearMonth;
            try {
                int monthNum = Integer.parseInt(yearMonth.split("-")[1]);
                monthLabel = monthLabels[monthNum - 1] + " " + yearMonth.split("-")[0].substring(2);
            } catch (Exception ignored) {}

            Map<String, Object> t = new HashMap<>();
            t.put("month", monthLabel);
            t.put("amount", amount.doubleValue() / 100000.0); // Convert to lakhs
            trend.add(t);
        }
        dto.setSettlementTrend(trend);

        return dto;
    }
}
