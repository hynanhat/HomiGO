package com.batdongsan.controller;

import com.batdongsan.dto.ApiResponse;
import com.batdongsan.dto.ai.AiDescriptionDraftRes;
import com.batdongsan.dto.ai.AiDescriptionGenerateReq;
import com.batdongsan.dto.ai.AiDescriptionQuotaRes;
import com.batdongsan.service.ai.AiDescriptionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/seller/ai-description")
public class AiDescriptionController {
    private final AiDescriptionService aiDescriptionService;

    public AiDescriptionController(AiDescriptionService aiDescriptionService) {
        this.aiDescriptionService = aiDescriptionService;
    }

    @GetMapping("/quota")
    public ResponseEntity<ApiResponse<AiDescriptionQuotaRes>> quota(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(
                aiDescriptionService.getQuota(authentication.getName())));
    }

    @PostMapping("/drafts")
    public ResponseEntity<ApiResponse<AiDescriptionDraftRes>> generate(
            @Valid @RequestBody AiDescriptionGenerateReq request,
            Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(
                aiDescriptionService.generate(authentication.getName(), request)));
    }
}
