package com.ufb.notification_service.dto;

import java.util.Map;

public record SendJobMessage(
        String dedupeKey,
        String recipientEmail,
        String templateCode,
        Long ruleId,
        Map<String, String> variables
) {}
