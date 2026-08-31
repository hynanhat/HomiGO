package com.batdongsan.dto.admin;

import com.batdongsan.dto.ListingRes;
import com.batdongsan.entity.Listing;
import com.batdongsan.entity.ListingStatusHistory;
import java.util.List;

public class AdminListingDetailRes {
    private final ListingRes listing;
    private final AdminListingSellerRes seller;
    private final List<AdminListingHistoryRes> history;

    public AdminListingDetailRes(Listing listing, List<ListingStatusHistory> histories) {
        this.listing = new ListingRes(listing);
        this.seller = new AdminListingSellerRes(listing.getUser());
        this.history = histories.stream().map(AdminListingHistoryRes::new).toList();
    }

    public ListingRes getListing() { return listing; }
    public AdminListingSellerRes getSeller() { return seller; }
    public List<AdminListingHistoryRes> getHistory() { return history; }
}
