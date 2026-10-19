package com.adz4needz.claimdesk.dto;

import com.adz4needz.claimdesk.entity.SystemSetting;

public class SystemSettingDto {

    private Long id;
    private String settingKey;
    private String settingValue;
    private String category;

    public SystemSettingDto() {}

    public static SystemSettingDto fromEntity(SystemSetting s) {
        SystemSettingDto dto = new SystemSettingDto();
        dto.setId(s.getId());
        dto.setSettingKey(s.getSettingKey());
        dto.setSettingValue(s.getSettingValue());
        dto.setCategory(s.getCategory());
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSettingKey() { return settingKey; }
    public void setSettingKey(String settingKey) { this.settingKey = settingKey; }

    public String getSettingValue() { return settingValue; }
    public void setSettingValue(String settingValue) { this.settingValue = settingValue; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
}
