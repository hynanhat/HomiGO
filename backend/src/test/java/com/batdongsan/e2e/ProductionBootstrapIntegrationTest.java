package com.batdongsan.e2e;

import static org.assertj.core.api.Assertions.assertThat;

import com.batdongsan.entity.User;
import com.batdongsan.entity.UserRole;
import com.batdongsan.entity.UserStatus;
import com.batdongsan.repository.*;
import com.batdongsan.service.AdministrativeDatasetService;
import com.batdongsan.service.AdministrativeDatasetValidator;
import com.batdongsan.service.ProductionCategoryCatalogService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class ProductionBootstrapIntegrationTest {
    @Autowired private AdministrativeDatasetService datasets;
    @Autowired private ProductionCategoryCatalogService categoryCatalog;
    @Autowired private AdministrativeProvinceRepository provinces;
    @Autowired private CommuneUnitRepository communes;
    @Autowired private CategoryRepository categories;
    @Autowired private UserRepository users;
    @Autowired private ListingRepository listings;
    @Autowired private ProjectRepository projects;

    @Test
    void bootstrapsOnlyOfficialReferencesAndIsIdempotent() {
        User admin = new User();
        admin.setName("Production Operator");
        admin.setEmail("operator@homigo.test");
        admin.setPasswordHash("not-used-in-service-test");
        admin.setRole(UserRole.ADMIN);
        admin.setStatus(UserStatus.ACTIVE);
        users.save(admin);
        long userCountBefore = users.count();

        var validated = datasets.validateBundled(
                AdministrativeDatasetValidator.BUNDLED_VERSION, admin.getEmail());
        assertThat(validated.status()).isEqualTo("VALIDATED");
        var active = datasets.activate(
                AdministrativeDatasetValidator.BUNDLED_VERSION, admin.getEmail());
        assertThat(active.status()).isEqualTo("ACTIVE");
        datasets.activate(AdministrativeDatasetValidator.BUNDLED_VERSION, admin.getEmail());

        assertThat(provinces.count()).isEqualTo(34);
        assertThat(communes.count()).isEqualTo(3321);
        assertThat(communes.findAll()).anySatisfy(unit -> {
            assertThat(unit.getOfficialCode()).isEqualTo("23938");
            assertThat(unit.getOfficialName()).isEqualTo("Xã Ia Mơ");
        });

        var firstCategories = categoryCatalog.initialize(ProductionCategoryCatalogService.VERSION);
        var secondCategories = categoryCatalog.initialize(ProductionCategoryCatalogService.VERSION);
        assertThat(firstCategories.created()).isEqualTo(16);
        assertThat(secondCategories.created()).isZero();
        assertThat(secondCategories.unchanged()).isEqualTo(16);
        assertThat(categories.count()).isEqualTo(16);
        assertThat(categories.findAll())
                .filteredOn(category -> category.getTransactionType() == com.batdongsan.entity.TransactionType.BUY)
                .hasSize(8);
        assertThat(categories.findAll())
                .filteredOn(category -> category.getTransactionType() == com.batdongsan.entity.TransactionType.RENT)
                .hasSize(8);

        assertThat(users.count()).isEqualTo(userCountBefore);
        assertThat(listings.count()).isZero();
        assertThat(projects.count()).isZero();
    }
}
