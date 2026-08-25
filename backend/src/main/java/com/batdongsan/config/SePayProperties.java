package com.batdongsan.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "payment.sepay")
public class SePayProperties {
    private String merchantId = "";
    private String secretKey = "";
    private String environment = "sandbox";
    private String checkoutUrl = "https://pay-sandbox.sepay.vn/v1/checkout/init";
    private String frontendBaseUrl = "http://localhost:5173";

    public boolean isConfigured() {
        return merchantId != null && !merchantId.isBlank()
                && secretKey != null && !secretKey.isBlank();
    }

    public String getMerchantId() { return merchantId; }
    public void setMerchantId(String merchantId) { this.merchantId = merchantId; }
    public String getSecretKey() { return secretKey; }
    public void setSecretKey(String secretKey) { this.secretKey = secretKey; }
    public String getEnvironment() { return environment; }
    public void setEnvironment(String environment) { this.environment = environment; }
    public String getCheckoutUrl() { return checkoutUrl; }
    public void setCheckoutUrl(String checkoutUrl) { this.checkoutUrl = checkoutUrl; }
    public String getFrontendBaseUrl() { return frontendBaseUrl; }
    public void setFrontendBaseUrl(String frontendBaseUrl) { this.frontendBaseUrl = frontendBaseUrl; }
}
