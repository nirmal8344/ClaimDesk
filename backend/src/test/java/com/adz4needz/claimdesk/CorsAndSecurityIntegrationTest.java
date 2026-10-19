package com.adz4needz.claimdesk;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
public class CorsAndSecurityIntegrationTest {

    @Autowired
    private WebApplicationContext context;

    private MockMvc mockMvc;

    private static final String VERCEL_PROD_ORIGIN = "https://claim-desk-three.vercel.app";
    private static final String UNAPPROVED_ORIGIN = "https://unauthorized-malicious-site.com";

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();
    }

    @Test
    @DisplayName("Preflight OPTIONS request to login succeeds with 200 and production CORS headers")
    void testPreflightAllowedOriginOnLogin() throws Exception {
        mockMvc.perform(options("/api/auth/login")
                        .header("Origin", VERCEL_PROD_ORIGIN)
                        .header("Access-Control-Request-Method", "POST")
                        .header("Access-Control-Request-Headers", "content-type"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", VERCEL_PROD_ORIGIN))
                .andExpect(header().string("Access-Control-Allow-Methods", containsString("POST")))
                .andExpect(header().string("Access-Control-Allow-Credentials", "true"));
    }

    @Test
    @DisplayName("Preflight OPTIONS request to protected route succeeds without requiring authentication")
    void testPreflightAllowedOriginOnProtectedRouteWithoutAuth() throws Exception {
        mockMvc.perform(options("/api/admin/claims")
                        .header("Origin", VERCEL_PROD_ORIGIN)
                        .header("Access-Control-Request-Method", "GET")
                        .header("Access-Control-Request-Headers", "authorization"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", VERCEL_PROD_ORIGIN))
                .andExpect(header().string("Access-Control-Allow-Credentials", "true"));
    }

    @Test
    @DisplayName("Login request from production origin includes CORS headers even on authentication failure")
    void testActualLoginResponseIncludesCorsHeaders() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .header("Origin", VERCEL_PROD_ORIGIN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"invalid@test.com\",\"password\":\"wrongpassword\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(header().string("Access-Control-Allow-Origin", VERCEL_PROD_ORIGIN))
                .andExpect(header().string("Access-Control-Allow-Credentials", "true"));
    }

    @Test
    @DisplayName("Unapproved origin does not receive Access-Control-Allow-Origin")
    void testUnapprovedOriginBlocked() throws Exception {
        mockMvc.perform(options("/api/auth/login")
                        .header("Origin", UNAPPROVED_ORIGIN)
                        .header("Access-Control-Request-Method", "POST"))
                .andExpect(header().doesNotExist("Access-Control-Allow-Origin"));
    }

    @Test
    @DisplayName("Public health endpoint /api/health is accessible and returns HTTP 200 JSON with status and service")
    void testPublicHealthEndpoint() throws Exception {
        mockMvc.perform(get("/api/health")
                        .header("Origin", VERCEL_PROD_ORIGIN))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", VERCEL_PROD_ORIGIN))
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.service").value("ClaimDesk API"));
    }

    @Test
    @DisplayName("Public health endpoint with trailing slash /api/health/ returns HTTP 200 JSON")
    void testPublicHealthEndpointTrailingSlash() throws Exception {
        mockMvc.perform(get("/api/health/")
                        .header("Origin", VERCEL_PROD_ORIGIN))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", VERCEL_PROD_ORIGIN))
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.service").value("ClaimDesk API"));
    }

    @Test
    @DisplayName("Health endpoint /health returns HTTP 200 JSON")
    void testHealthEndpoint() throws Exception {
        mockMvc.perform(get("/health")
                        .header("Origin", VERCEL_PROD_ORIGIN))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", VERCEL_PROD_ORIGIN))
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.service").value("ClaimDesk API"));
    }

    @Test
    @DisplayName("Root endpoint / is accessible and returns CORS headers and UP status")
    void testRootEndpoint() throws Exception {
        mockMvc.perform(get("/")
                        .header("Origin", VERCEL_PROD_ORIGIN))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", VERCEL_PROD_ORIGIN))
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.service").value("ClaimDesk API"));
    }

    @Test
    @DisplayName("Protected endpoint remains protected against unauthenticated requests")
    void testProtectedEndpointRequiresAuth() throws Exception {
        mockMvc.perform(get("/api/admin/claims")
                        .header("Origin", VERCEL_PROD_ORIGIN))
                .andExpect(status().isForbidden());
    }
}
