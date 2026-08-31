package com.batdongsan.service;

import com.batdongsan.dto.ListingFilter;
import com.batdongsan.dto.ListingRes;
import com.batdongsan.dto.project.ProjectDetailRes;
import com.batdongsan.dto.project.ProjectFilter;
import com.batdongsan.dto.project.ProjectSummaryRes;
import com.batdongsan.dto.project.ProjectReq;
import com.batdongsan.entity.Project;
import com.batdongsan.exception.ConflictException;
import com.batdongsan.exception.ResourceNotFoundException;
import com.batdongsan.repository.ListingRepository;
import com.batdongsan.repository.ProjectRepository;
import com.batdongsan.repository.specification.ListingSpecifications;
import com.batdongsan.repository.specification.ProjectSpecifications;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class ProjectService {
    private final ProjectRepository projects;
    private final ListingRepository listings;
    private final LocationService locationService;

    public ProjectService(ProjectRepository projects, ListingRepository listings,
                          LocationService locationService) {
        this.projects = projects;
        this.listings = listings;
        this.locationService = locationService;
    }

    @Transactional(readOnly = true)
    public Page<ProjectSummaryRes> getProjects(ProjectFilter filter, Pageable pageable) {
        Pageable sorted = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(),
                Sort.by(Sort.Order.desc("updatedAt"), Sort.Order.asc("id")));
        return projects.findAll(ProjectSpecifications.from(filter), sorted).map(ProjectSummaryRes::new);
    }

    @Transactional(readOnly = true)
    public ProjectDetailRes getProject(String slug, Pageable listingPageable) {
        Project project = projects.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy dự án."));
        ListingFilter filter = new ListingFilter();
        filter.setProjectId(project.getId());
        Pageable sorted = PageRequest.of(listingPageable.getPageNumber(), listingPageable.getPageSize(),
                filter.toSort());
        Page<ListingRes> projectListings = listings
                .findAll(ListingSpecifications.from(filter, LocalDateTime.now()), sorted)
                .map(ListingRes::new);
        return new ProjectDetailRes(project, projectListings);
    }

    @Transactional
    public ProjectSummaryRes createProject(ProjectReq request) {
        if (projects.existsBySlug(request.getSlug())) throw new ConflictException("Slug dự án đã tồn tại.");
        Project project = new Project();
        project.setCreatedAt(LocalDateTime.now());
        apply(project, request);
        return new ProjectSummaryRes(projects.save(project));
    }

    @Transactional
    public ProjectSummaryRes updateProject(Long id, ProjectReq request) {
        Project project = projects.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy dự án."));
        if (projects.existsBySlugAndIdNot(request.getSlug(), id))
            throw new ConflictException("Slug dự án đã tồn tại.");
        apply(project, request);
        return new ProjectSummaryRes(projects.save(project));
    }

    @Transactional
    public void deleteProject(Long id) {
        Project project = projects.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy dự án."));
        projects.delete(project);
        projects.flush();
    }

    private void apply(Project project, ProjectReq request) {
        LocationService.CurrentAddress currentAddress = locationService.resolveActiveAddress(
                request.getProvinceCode(), request.getCommuneCode());
        project.setName(request.getName().trim());
        project.setSlug(request.getSlug().trim());
        project.setInvestor(request.getInvestor().trim());
        project.setAdministrativeProvince(currentAddress.province());
        project.setCommuneUnit(currentAddress.communeUnit());
        project.setAddress(request.getAddress().trim());
        project.setLatitude(request.getLatitude());
        project.setLongitude(request.getLongitude());
        project.setStatus(request.getStatus());
        project.setDescription(request.getDescription().trim());
        project.setPriceFrom(request.getPriceFrom());
        project.setPriceTo(request.getPriceTo());
        project.setUpdatedAt(LocalDateTime.now());
    }
}
