package com.batdongsan.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {
    private final String uploadResourceLocation;

    public WebMvcConfig(@Value("${file.upload-dir:uploads}") String uploadDir) {
        String location = Paths.get(uploadDir).toAbsolutePath().normalize().toUri().toString();
        uploadResourceLocation = location.endsWith("/") ? location : location + "/";
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(uploadResourceLocation);
    }
}
