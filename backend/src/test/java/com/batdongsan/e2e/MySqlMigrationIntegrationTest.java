package com.batdongsan.e2e;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.MigrationVersion;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@Testcontainers(disabledWithoutDocker = true)
class MySqlMigrationIntegrationTest {
    @Container
    static final MySQLContainer<?> MYSQL = new MySQLContainer<>("mysql:8.4")
            .withDatabaseName("homigo_test")
            .withUsername("homigo")
            .withPassword("homigo_test_password");

    private JdbcTemplate jdbcTemplate;

    @BeforeEach
    void resetToV9() {
        Flyway flyway = flyway("9");
        flyway.clean();
        flyway.migrate();
        jdbcTemplate = new JdbcTemplate(new DriverManagerDataSource(
                MYSQL.getJdbcUrl(), MYSQL.getUsername(), MYSQL.getPassword()));
    }

    @Test
    void v10BuildsCleanTwoLevelSchemaWhenBusinessTablesAreEmpty() {
        flyway("10").migrate();

        Integer migrations = jdbcTemplate.queryForObject(
                "select count(*) from flyway_schema_history where success = 1", Integer.class);
        assertThat(migrations).isEqualTo(10);

        assertThat(tableExists("administrative_dataset_releases")).isTrue();
        assertThat(tableExists("administrative_catalog_state")).isTrue();
        assertThat(tableExists("administrative_provinces")).isTrue();
        assertThat(tableExists("commune_units")).isTrue();
        assertThat(tableExists("provinces")).isFalse();
        assertThat(tableExists("districts")).isFalse();
        assertThat(tableExists("wards")).isFalse();

        assertThat(columnExists("listings", "district_id")).isFalse();
        assertThat(columnExists("listings", "ward_id")).isFalse();
        assertThat(columnExists("projects", "district_id")).isFalse();
        assertThat(columnExists("projects", "ward_id")).isFalse();
        assertThat(columnExists("listings", "administrative_province_id")).isTrue();
        assertThat(columnExists("listings", "commune_unit_id")).isTrue();
        assertThat(columnExists("projects", "administrative_province_id")).isTrue();
        assertThat(columnExists("projects", "commune_unit_id")).isTrue();
        assertThat(columnIsNullable("listings", "administrative_province_id")).isFalse();
        assertThat(columnIsNullable("listings", "commune_unit_id")).isFalse();
        assertThat(columnIsNullable("projects", "administrative_province_id")).isFalse();
        assertThat(columnIsNullable("projects", "commune_unit_id")).isFalse();

        assertThat(constraintExists("fk_listings_current_location")).isTrue();
        assertThat(constraintExists("fk_projects_current_location")).isTrue();
        assertThat(indexExists("listings", "idx_listings_current_province_status")).isTrue();
        assertThat(indexExists("projects", "idx_projects_current_commune_status")).isTrue();
    }

    @Test
    void v10StopsBeforeDdlWhenAListingExists() {
        long districtId = insertLegacyLocation();
        jdbcTemplate.update("""
                insert into users (name, email, password_hash, role, status)
                values ('Operator', 'operator@example.test', 'not-used', 'ADMIN', 'ACTIVE')
                """);
        jdbcTemplate.update("""
                insert into categories (name, slug, transaction_type)
                values ('Căn hộ bán', 'can-ho-ban', 'BUY')
                """);
        jdbcTemplate.update("""
                insert into listings (
                    user_id, category_id, district_id, public_code, title, description,
                    price, area, address, contact_name, contact_phone, status)
                values (1, 1, ?, 'HMG-000000000001', 'Tin cũ', 'Dữ liệu chặn cutover',
                    1000000, 50, 'Địa chỉ cũ', 'Operator', '0900000000', 'DRAFT')
                """, districtId);

        assertCutoverIsRejectedWithoutSchemaChanges();
    }

    @Test
    void v10StopsBeforeDdlWhenAProjectExists() {
        long districtId = insertLegacyLocation();
        jdbcTemplate.update("""
                insert into projects (
                    name, slug, investor, district_id, address, status, description,
                    created_at, updated_at)
                values ('Dự án cũ', 'du-an-cu', 'Chủ đầu tư', ?, 'Địa chỉ cũ',
                    'PLANNING', 'Dữ liệu chặn cutover', current_timestamp(6), current_timestamp(6))
                """, districtId);

        assertCutoverIsRejectedWithoutSchemaChanges();
    }

    @Test
    void v11AddsRemovalAuditAndIdempotentImageUploads() {
        flyway("11").migrate();

        Integer migrations = jdbcTemplate.queryForObject(
                "select count(*) from flyway_schema_history where success = 1", Integer.class);
        assertThat(migrations).isEqualTo(11);
        assertThat(columnExists("listings", "removal_reason")).isTrue();
        assertThat(columnExists("listings", "removed_by")).isTrue();
        assertThat(columnExists("listings", "removed_at")).isTrue();
        assertThat(columnExists("listing_images", "client_upload_id")).isTrue();
        assertThat(constraintExists("fk_listings_removed_by")).isTrue();
        assertThat(indexExists("listing_images", "uk_listing_images_client_upload")).isTrue();
        assertThat(columnType("listings", "status")).contains("REMOVED");
        assertThat(columnType("listing_status_history", "to_status")).contains("REMOVED");
        assertThat(columnType("notifications", "type")).contains("LISTING_REMOVED");
        assertThat(columnCharacterMaximumLength("listings", "rejection_reason")).isEqualTo(1000L);
        assertThat(columnCharacterMaximumLength("listing_status_history", "reason")).isEqualTo(1000L);
    }

    private long insertLegacyLocation() {
        jdbcTemplate.update("insert into provinces (name) values ('Tỉnh cũ')");
        Long provinceId = jdbcTemplate.queryForObject("select max(id) from provinces", Long.class);
        jdbcTemplate.update("insert into districts (province_id, name) values (?, 'Huyện cũ')", provinceId);
        return jdbcTemplate.queryForObject("select max(id) from districts", Long.class);
    }

    private void assertCutoverIsRejectedWithoutSchemaChanges() {
        assertThatThrownBy(() -> flyway("10").migrate())
                .hasMessageContaining("homigo_clean_cutover_requires_empty_listings_and_projects");

        assertThat(tableExists("provinces")).isTrue();
        assertThat(tableExists("districts")).isTrue();
        assertThat(tableExists("wards")).isTrue();
        assertThat(tableExists("administrative_dataset_releases")).isFalse();
        assertThat(columnExists("listings", "district_id")).isTrue();
        assertThat(columnExists("projects", "district_id")).isTrue();
    }

    private Flyway flyway(String target) {
        return Flyway.configure()
                .dataSource(MYSQL.getJdbcUrl(), MYSQL.getUsername(), MYSQL.getPassword())
                .locations("classpath:db/migration")
                .target(MigrationVersion.fromVersion(target))
                .cleanDisabled(false)
                .load();
    }

    private boolean tableExists(String tableName) {
        Integer count = jdbcTemplate.queryForObject("""
                select count(*) from information_schema.tables
                where table_schema = database() and table_name = ?
                """, Integer.class, tableName);
        return count != null && count == 1;
    }

    private boolean columnExists(String tableName, String columnName) {
        Integer count = jdbcTemplate.queryForObject("""
                select count(*) from information_schema.columns
                where table_schema = database() and table_name = ? and column_name = ?
                """, Integer.class, tableName, columnName);
        return count != null && count == 1;
    }

    private boolean columnIsNullable(String tableName, String columnName) {
        String nullable = jdbcTemplate.queryForObject("""
                select is_nullable from information_schema.columns
                where table_schema = database() and table_name = ? and column_name = ?
                """, String.class, tableName, columnName);
        return "YES".equals(nullable);
    }

    private String columnType(String tableName, String columnName) {
        return jdbcTemplate.queryForObject("""
                select column_type from information_schema.columns
                where table_schema = database() and table_name = ? and column_name = ?
                """, String.class, tableName, columnName);
    }

    private Long columnCharacterMaximumLength(String tableName, String columnName) {
        return jdbcTemplate.queryForObject("""
                select character_maximum_length from information_schema.columns
                where table_schema = database() and table_name = ? and column_name = ?
                """, Long.class, tableName, columnName);
    }

    private boolean constraintExists(String constraintName) {
        Integer count = jdbcTemplate.queryForObject("""
                select count(*) from information_schema.table_constraints
                where constraint_schema = database() and constraint_name = ?
                """, Integer.class, constraintName);
        return count != null && count == 1;
    }

    private boolean indexExists(String tableName, String indexName) {
        Integer count = jdbcTemplate.queryForObject("""
                select count(*) from information_schema.statistics
                where table_schema = database() and table_name = ? and index_name = ?
                """, Integer.class, tableName, indexName);
        return count != null && count > 0;
    }
}
