package com.adz4needz.claimdesk;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.hamcrest.Matchers.containsString;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
public class CustomerPolicyAndReportControllerIntegrationTest {

    @Autowired
    private WebApplicationContext context;

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private String customerToken;
    private String adminToken;

    @BeforeEach
    void setUp() throws Exception {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();

        // Login as customer
        MvcResult custResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"arun.kumar@example.com\",\"password\":\"Customer@123\"}"))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode custNode = objectMapper.readTree(custResult.getResponse().getContentAsString());
        customerToken = custNode.get("token").asText();

        // Login as admin
        MvcResult adminResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"admin@company.com\",\"password\":\"Admin@123\"}"))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode adminNode = objectMapper.readTree(adminResult.getResponse().getContentAsString());
        adminToken = adminNode.get("token").asText();
    }

    @Test
    @DisplayName("Integration: Authenticated customer can register a policy via POST /api/customer/policies (No 403 Forbidden)")
    void testCustomerPolicyRegistrationEndpoint() throws Exception {
        String uniquePolNumber = "POL-INTEG-" + System.currentTimeMillis();
        String requestJson = String.format("""
                {
                    "policyNumber": "%s",
                    "policyType": "Motor Comprehensive",
                    "providerCompany": "National Insurance",
                    "coverageAmount": 650000.00,
                    "premiumAmount": 16000.00,
                    "premiumTerm": "year",
                    "startDate": "2025-01-01",
                    "endDate": "2027-12-31",
                    "coverageDescription": "Integrated test policy"
                }
                """, uniquePolNumber);

        mockMvc.perform(post("/api/customer/policies")
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.policyNumber").value(uniquePolNumber))
                .andExpect(jsonPath("$.policyType").value("Motor Comprehensive"))
                .andExpect(jsonPath("$.customerId").value(9)) // Arun Kumar is id 9
                .andExpect(jsonPath("$.status").value("ACTIVE"));
    }

    @Test
    @DisplayName("Integration: Customer querying /api/customer/policies receives only their policies")
    void testCustomerGetPolicies() throws Exception {
        mockMvc.perform(get("/api/customer/policies")
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].customerId").value(9));
    }

    @Test
    @DisplayName("Integration: Customer cannot access another customer's policy by ID (HTTP 403 Forbidden)")
    void testCustomerCannotAccessAnotherCustomerPolicy() throws Exception {
        // Policy id 4 in seed data belongs to Customer id 10 (Priya S)
        mockMvc.perform(get("/api/customer/policies/4")
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Integration: Customer cannot access /api/reports/export/csv (HTTP 403 Forbidden)")
    void testCustomerCannotAccessReports() throws Exception {
        mockMvc.perform(get("/api/reports/export/csv?type=claims")
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Integration: Admin can export claims report as CSV")
    void testAdminExportCsv() throws Exception {
        MvcResult result = mockMvc.perform(get("/api/reports/export/csv?type=claims")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", containsString("text/csv")))
                .andExpect(header().string("Content-Disposition", containsString("claimdesk_claims_")))
                .andReturn();

        String content = result.getResponse().getContentAsString();
        assertTrue(content.contains("Claim Number"));
        assertTrue(content.contains("CLM-"));
    }

    @Test
    @DisplayName("Integration: Admin can export settlements report as Excel (.xlsx)")
    void testAdminExportExcel() throws Exception {
        MvcResult result = mockMvc.perform(get("/api/reports/export/excel?type=settlements")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", containsString("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")))
                .andExpect(header().string("Content-Disposition", containsString("claimdesk_settlements_")))
                .andReturn();

        byte[] bytes = result.getResponse().getContentAsByteArray();
        assertTrue(bytes.length > 1000);
        // Verify ZIP / XLSX magic bytes (PK..)
        assertEquals((byte) 0x50, bytes[0]);
        assertEquals((byte) 0x4B, bytes[1]);
    }

    @Test
    @DisplayName("Integration: Admin can export claims report as PDF")
    void testAdminExportPdf() throws Exception {
        MvcResult result = mockMvc.perform(get("/api/reports/export/pdf?type=claims")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", containsString("application/pdf")))
                .andExpect(header().string("Content-Disposition", containsString("claimdesk_claims_")))
                .andReturn();

        byte[] bytes = result.getResponse().getContentAsByteArray();
        assertTrue(bytes.length > 500);
        // Verify PDF magic header %PDF-
        String magic = new String(bytes, 0, 5);
        assertEquals("%PDF-", magic);
    }
}
