package com.adz4needz.claimdesk.service;

import com.adz4needz.claimdesk.dto.CustomerFeedbackDto;
import com.adz4needz.claimdesk.dto.SystemSettingDto;
import com.adz4needz.claimdesk.entity.Claim;
import com.adz4needz.claimdesk.entity.ClaimCategory;
import com.adz4needz.claimdesk.entity.CustomerFeedback;
import com.adz4needz.claimdesk.entity.SystemSetting;
import com.adz4needz.claimdesk.entity.User;
import com.adz4needz.claimdesk.exception.ResourceNotFoundException;
import com.adz4needz.claimdesk.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SystemSettingService {

    private final SystemSettingRepository settingRepository;
    private final ClaimCategoryRepository categoryRepository;
    private final CustomerFeedbackRepository feedbackRepository;
    private final UserRepository userRepository;
    private final ClaimRepository claimRepository;

    public SystemSettingService(SystemSettingRepository settingRepository,
                                ClaimCategoryRepository categoryRepository,
                                CustomerFeedbackRepository feedbackRepository,
                                UserRepository userRepository,
                                ClaimRepository claimRepository) {
        this.settingRepository = settingRepository;
        this.categoryRepository = categoryRepository;
        this.feedbackRepository = feedbackRepository;
        this.userRepository = userRepository;
        this.claimRepository = claimRepository;
    }

    public List<SystemSettingDto> getAllSettings() {
        return settingRepository.findAll().stream()
                .map(SystemSettingDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public SystemSettingDto updateSetting(String key, String value, String category) {
        SystemSetting setting = settingRepository.findBySettingKey(key)
                .orElse(new SystemSetting(key, value, category != null ? category : "GENERAL"));
        setting.setSettingValue(value);
        if (category != null) {
            setting.setCategory(category);
        }
        SystemSetting saved = settingRepository.save(setting);
        return SystemSettingDto.fromEntity(saved);
    }

    public List<ClaimCategory> getAllCategories() {
        return categoryRepository.findAll();
    }

    @Transactional
    public ClaimCategory addCategory(ClaimCategory cat) {
        return categoryRepository.save(cat);
    }

    @Transactional
    public CustomerFeedbackDto submitFeedback(Long customerId, CustomerFeedbackDto dto) {
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        Claim claim = null;
        if (dto.getClaimId() != null) {
            claim = claimRepository.findById(dto.getClaimId()).orElse(null);
        }

        CustomerFeedback feedback = new CustomerFeedback();
        feedback.setCustomer(customer);
        feedback.setClaim(claim);
        feedback.setRating(dto.getRating());
        feedback.setComments(dto.getComments());

        CustomerFeedback saved = feedbackRepository.save(feedback);
        return CustomerFeedbackDto.fromEntity(saved);
    }

    public List<CustomerFeedbackDto> getFeedbackForCustomer(Long customerId) {
        return feedbackRepository.findByCustomerIdOrderByCreatedAtDesc(customerId).stream()
                .map(CustomerFeedbackDto::fromEntity)
                .collect(Collectors.toList());
    }
}
