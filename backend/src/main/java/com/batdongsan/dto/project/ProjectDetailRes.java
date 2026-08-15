package com.batdongsan.dto.project;

import com.batdongsan.dto.ListingRes;
import com.batdongsan.dto.PageResponse;
import com.batdongsan.entity.Project;
import org.springframework.data.domain.Page;

public class ProjectDetailRes extends ProjectSummaryRes {
    private final String description;
    private final Double latitude;
    private final Double longitude;
    private final PageResponse<ListingRes> listings;

    public ProjectDetailRes(Project project, Page<ListingRes> listings) {
        super(project);
        description = project.getDescription();
        latitude = project.getLatitude();
        longitude = project.getLongitude();
        this.listings = PageResponse.from(listings);
    }

    public String getDescription() { return description; }
    public Double getLatitude() { return latitude; }
    public Double getLongitude() { return longitude; }
    public PageResponse<ListingRes> getListings() { return listings; }
}
