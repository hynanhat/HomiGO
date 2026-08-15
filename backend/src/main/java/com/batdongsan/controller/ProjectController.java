package com.batdongsan.controller;

import com.batdongsan.dto.ApiResponse;
import com.batdongsan.dto.PageReq;
import com.batdongsan.dto.project.ProjectDetailRes;
import com.batdongsan.dto.project.ProjectFilter;
import com.batdongsan.dto.project.ProjectSummaryRes;
import com.batdongsan.service.ProjectService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/projects")
public class ProjectController {
    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ProjectSummaryRes>>> getProjects(
            @Valid @ModelAttribute ProjectFilter filter,
            @Valid @ModelAttribute PageReq pageReq) {
        return ResponseEntity.ok(ApiResponse.success(projectService.getProjects(filter,
                PageRequest.of(pageReq.getPage(), pageReq.getSize()))));
    }

    @GetMapping("/{slug}")
    public ResponseEntity<ApiResponse<ProjectDetailRes>> getProject(
            @PathVariable String slug,
            @Valid @ModelAttribute PageReq pageReq) {
        return ResponseEntity.ok(ApiResponse.success(projectService.getProject(slug,
                PageRequest.of(pageReq.getPage(), pageReq.getSize()))));
    }
}
