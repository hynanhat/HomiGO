package com.batdongsan.repository.specification;

import com.batdongsan.dto.ListingFilter;
import com.batdongsan.entity.*;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;
import java.time.LocalDateTime;
import java.util.*;

public final class ListingSpecifications {
    private ListingSpecifications() {}

    public static Specification<Listing> from(ListingFilter filter,LocalDateTime now){
        return Specification.allOf(publiclyVisible(now),matches(filter));
    }

    public static Specification<Listing> publiclyVisible(LocalDateTime now){return (root,query,cb)->cb.and(
            cb.equal(root.get("status"),ListingStatus.ACTIVE),
            cb.or(cb.isNull(root.get("expiresAt")),cb.greaterThan(root.get("expiresAt"),now)));}

    public static Specification<Listing> matches(ListingFilter f){return (root,query,cb)->{
        List<Predicate> predicates=new ArrayList<>();
        if(hasText(f.getKeyword())){String pattern="%"+escape(f.getKeyword().trim().toLowerCase(Locale.ROOT))+"%";
            predicates.add(cb.or(cb.like(cb.lower(root.get("title")),pattern,'\\'),
                    cb.like(cb.lower(root.get("description")),pattern,'\\'),
                    cb.like(cb.lower(root.get("address")),pattern,'\\')));}
        if(hasText(f.getTransactionType()))predicates.add(cb.equal(root.join("category").get("transactionType"),
                TransactionType.valueOf(f.getTransactionType().trim().toUpperCase(Locale.ROOT))));
        if(f.getProvinceId()!=null)predicates.add(cb.equal(root.join("district").join("province").get("id"),f.getProvinceId()));
        if(f.getDistrictId()!=null)predicates.add(cb.equal(root.join("district").get("id"),f.getDistrictId()));
        if(f.getWardId()!=null)predicates.add(cb.equal(root.join("ward",JoinType.LEFT).get("id"),f.getWardId()));
        if(f.getCategoryId()!=null)predicates.add(cb.equal(root.join("category").get("id"),f.getCategoryId()));
        if(f.getProjectId()!=null)predicates.add(cb.equal(root.join("project",JoinType.LEFT).get("id"),f.getProjectId()));
        if(f.getMinPrice()!=null)predicates.add(cb.greaterThanOrEqualTo(root.get("price"),f.getMinPrice()));
        if(f.getMaxPrice()!=null)predicates.add(cb.lessThanOrEqualTo(root.get("price"),f.getMaxPrice()));
        if(f.getMinArea()!=null)predicates.add(cb.greaterThanOrEqualTo(root.get("area"),f.getMinArea()));
        if(f.getMaxArea()!=null)predicates.add(cb.lessThanOrEqualTo(root.get("area"),f.getMaxArea()));
        if(f.getBedrooms()!=null)predicates.add(cb.equal(root.get("bedrooms"),f.getBedrooms()));
        if(f.getMinLat()!=null){predicates.add(cb.between(root.get("latitude"),f.getMinLat(),f.getMaxLat()));
            predicates.add(cb.between(root.get("longitude"),f.getMinLng(),f.getMaxLng()));}
        return cb.and(predicates.toArray(Predicate[]::new));};}

    private static boolean hasText(String value){return value!=null&&!value.isBlank();}
    private static String escape(String value){return value.replace("\\","\\\\").replace("%","\\%").replace("_","\\_");}
}
