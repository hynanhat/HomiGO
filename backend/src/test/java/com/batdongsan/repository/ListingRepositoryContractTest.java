package com.batdongsan.repository;

import com.batdongsan.entity.ListingStatus;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;

import java.lang.reflect.Method;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ListingRepositoryContractTest {

    @Test
    void sellerPageFetchesToOneDtoAssociationsButKeepsImagesBatchLoaded() throws Exception {
        Method method = ListingRepository.class.getMethod("findByUserId", Long.class, Pageable.class);
        EntityGraph graph = method.getAnnotation(EntityGraph.class);

        assertNotNull(graph);
        List<String> paths = List.of(graph.attributePaths());
        assertTrue(paths.containsAll(List.of("user", "category", "district", "district.province", "ward", "project")));
        assertFalse(paths.contains("images"));
    }

    @Test
    void adminModerationPageFetchesSellerInThePageQuery() throws Exception {
        Method method = ListingRepository.class.getMethod("findByStatus", ListingStatus.class, Pageable.class);
        EntityGraph graph = method.getAnnotation(EntityGraph.class);

        assertNotNull(graph);
        assertTrue(List.of(graph.attributePaths()).contains("user"));
    }
}
