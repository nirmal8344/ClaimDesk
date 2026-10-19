package com.adz4needz.claimdesk.service;

import com.adz4needz.claimdesk.dto.*;
import com.adz4needz.claimdesk.entity.Role;
import com.adz4needz.claimdesk.entity.User;
import com.adz4needz.claimdesk.exception.BadRequestException;
import com.adz4needz.claimdesk.exception.ResourceNotFoundException;
import com.adz4needz.claimdesk.exception.UnauthorizedException;
import com.adz4needz.claimdesk.repository.UserRepository;
import com.adz4needz.claimdesk.security.JwtTokenProvider;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
    }

    public AuthResponse login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if ("INACTIVE".equalsIgnoreCase(user.getStatus())) {
            throw new UnauthorizedException("Account is inactive. Please contact administrator.");
        }

        return new AuthResponse(
                jwt,
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                user.getStatus(),
                user.getEmployeeId(),
                user.getDepartment(),
                user.getPhoneNumber(),
                user.getAddress()
        );
    }

    @Transactional
    public AuthResponse registerCustomer(RegisterRequest registerRequest) {
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new BadRequestException("Email is already in use");
        }

        User user = new User();
        user.setEmail(registerRequest.getEmail().trim().toLowerCase());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setFullName(registerRequest.getFullName().trim());
        user.setRole(Role.CUSTOMER);
        user.setPhoneNumber(registerRequest.getPhoneNumber());
        user.setAddress(registerRequest.getAddress());
        user.setStatus("ACTIVE");

        User saved = userRepository.save(user);

        // Auto authenticate on registration
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(registerRequest.getEmail(), registerRequest.getPassword())
        );
        String jwt = tokenProvider.generateToken(authentication);

        return new AuthResponse(
                jwt,
                saved.getId(),
                saved.getEmail(),
                saved.getFullName(),
                saved.getRole(),
                saved.getStatus(),
                null,
                null,
                saved.getPhoneNumber(),
                saved.getAddress()
        );
    }

    @Transactional
    public User createOfficer(CreateOfficerRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered");
        }

        User officer = new User();
        officer.setEmail(request.getEmail().trim().toLowerCase());
        officer.setPassword(passwordEncoder.encode(request.getInitialPassword()));
        officer.setFullName(request.getFullName().trim());
        officer.setRole(Role.CLAIM_OFFICER);
        officer.setPhoneNumber(request.getPhoneNumber());
        officer.setDepartment(request.getDepartment() != null ? request.getDepartment() : "Claims Processing");
        officer.setEmployeeId(request.getEmployeeId() != null ? request.getEmployeeId() : "OFF-" + System.currentTimeMillis() % 10000);
        officer.setStatus("ACTIVE");

        return userRepository.save(officer);
    }

    public User getProfile(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
    }

    @Transactional
    public User updateProfile(Long userId, UpdateProfileRequest request) {
        User user = getProfile(userId);
        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            user.setFullName(request.getFullName().trim());
        }
        if (request.getPhoneNumber() != null) {
            user.setPhoneNumber(request.getPhoneNumber().trim());
        }
        if (request.getAddress() != null) {
            user.setAddress(request.getAddress().trim());
        }
        if (request.getDepartment() != null && (user.getRole() == Role.ADMIN || user.getRole() == Role.CLAIM_OFFICER)) {
            user.setDepartment(request.getDepartment().trim());
        }
        return userRepository.save(user);
    }

    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = getProfile(userId);

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password does not match");
        }

        if (!request.getNewPassword().equals(request.getConfirmNewPassword())) {
            throw new BadRequestException("New password and confirm password do not match");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    public Page<User> getOfficers(String search, Pageable pageable) {
        if (search != null && !search.isBlank()) {
            return userRepository.searchByRole(Role.CLAIM_OFFICER, search.trim(), pageable);
        }
        return userRepository.findByRole(Role.CLAIM_OFFICER, pageable);
    }

    public Page<User> getCustomers(String search, Pageable pageable) {
        if (search != null && !search.isBlank()) {
            return userRepository.searchByRole(Role.CUSTOMER, search.trim(), pageable);
        }
        return userRepository.findByRole(Role.CUSTOMER, pageable);
    }

    @Transactional
    public User updateUserStatus(Long userId, String status) {
        User user = getProfile(userId);
        if (user.getRole() == Role.ADMIN) {
            throw new BadRequestException("Cannot modify primary admin status");
        }
        user.setStatus(status.toUpperCase());
        return userRepository.save(user);
    }
}
