package com.batdongsan.dto.project;

import com.batdongsan.dto.ListingRes;
import com.batdongsan.dto.PageResponse;
import com.batdongsan.entity.Project;
import org.springframework.data.domain.Page;

public class ProjectDetailRes extends ProjectSummaryRes {
    private final PageResponse<ListingRes> listings;

    public ProjectDetailRes(Project project, Page<ListingRes> listings) {
        super(project);
        this.listings = PageResponse.from(listings);
    }

    public PageResponse<ListingRes> getListings() { return listings; }
}
