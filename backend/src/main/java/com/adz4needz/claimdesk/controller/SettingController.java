package com.adz4needz.claimdesk.controller;

import com.adz4needz.claimdesk.dto.SystemSettingDto;
import com.adz4needz.claimdesk.entity.ClaimCategory;
import com.adz4needz.claimdesk.service.SystemSettingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class SettingController {

    private final SystemSettingService settingService;

    public SettingController(SystemSettingService settingService) {
        this.settingService = settingService;
    }

    @GetMapping("/settings")
    public ResponseEntity<List<SystemSettingDto>> getSettings() {
        return ResponseEntity.ok(settingService.getAllSettings());
    }

    @PutMapping("/settings")
    public ResponseEntity<SystemSettingDto> updateSetting(@RequestBody Map<String, String> body) {
        String key = body.get("key");
        String value = body.get("value");
        String category = body.get("category");
        return ResponseEntity.ok(settingService.updateSetting(key, value, category));
    }

    @GetMapping("/categories")
    public ResponseEntity<List<ClaimCategory>> getCategories() {
        return ResponseEntity.ok(settingService.getAllCategories());
    }

    @PostMapping("/categories")
    public ResponseEntity<ClaimCategory> addCategory(@RequestBody ClaimCategory category) {
        return ResponseEntity.ok(settingService.addCategory(category));
    }
}
