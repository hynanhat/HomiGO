package com.batdongsan.repository.specification;

import com.batdongsan.dto.project.ProjectFilter;
import com.batdongsan.entity.Project;
import org.springframework.data.jpa.domain.Specification;
import java.util.Locale;

public final class ProjectSpecifications {
    private ProjectSpecifications() {}

    public static Specification<Project> from(ProjectFilter filter) {
        return Specification.where(keyword(filter.getKeyword()))
                .and(province(filter.getProvinceCode()))
                .and(commune(filter.getCommuneCode()))
                .and(status(filter.getStatus()));
    }

    private static Specification<Project> keyword(String keyword) {
        return (root, query, cb) -> {
            if (keyword == null || keyword.isBlank()) return cb.conjunction();
            String pattern = "%" + escape(keyword.trim().toLowerCase(Locale.ROOT)) + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("name")), pattern, '\\'),
                    cb.like(cb.lower(root.get("investor")), pattern, '\\'),
                    cb.like(cb.lower(root.get("address")), pattern, '\\'));
        };
    }

    private static Specification<Project> province(String provinceCode) {
        return (root, query, cb) -> provinceCode == null
                ? cb.conjunction()
                : cb.equal(root.get("administrativeProvince").get("officialCode"), provinceCode);
    }

    private static Specification<Project> commune(String communeCode) {
        return (root, query, cb) -> communeCode == null
                ? cb.conjunction()
                : cb.equal(root.get("communeUnit").get("officialCode"), communeCode);
    }

    private static Specification<Project> status(String status) {
        return (root, query, cb) -> status == null
                ? cb.conjunction() : cb.equal(root.get("status"), status);
    }

    private static String escape(String value) {
        return value.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
    }
}
