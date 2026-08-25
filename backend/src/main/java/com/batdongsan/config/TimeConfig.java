package com.batdongsan.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Clock;
import java.time.ZoneId;
import java.util.TimeZone;

@Configuration
public class TimeConfig {
    private final ZoneId businessZone;

    public TimeConfig(@Value("${app.business-zone:Asia/Ho_Chi_Minh}") String businessZone) {
        this.businessZone = ZoneId.of(businessZone);
        TimeZone.setDefault(TimeZone.getTimeZone(this.businessZone));
    }

    @Bean
    public ZoneId businessZone() {
        return businessZone;
    }

    @Bean
    public Clock businessClock() {
        return Clock.system(businessZone);
    }
}
