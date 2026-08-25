package com.batdongsan.dto;

import com.batdongsan.entity.ListingImage;

public class ListingImageRes {
    private final Long id;
    private final String url;
    private final String contentType;
    private final Long sizeBytes;
    private final Integer sortOrder;

    public ListingImageRes(ListingImage image) {
        id = image.getId();
        url = image.getUrl();
        contentType = image.getContentType();
        sizeBytes = image.getSizeBytes();
        sortOrder = image.getSortOrder();
    }

    public Long getId() { return id; }
    public String getUrl() { return url; }
    public String getContentType() { return contentType; }
    public Long getSizeBytes() { return sizeBytes; }
    public Integer getSortOrder() { return sortOrder; }
}
