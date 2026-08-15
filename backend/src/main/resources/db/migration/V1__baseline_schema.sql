CREATE TABLE users (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(255),
    role ENUM('USER', 'SELLER', 'ADMIN') NOT NULL DEFAULT 'USER',
    status ENUM('ACTIVE', 'BANNED') NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME(6),
    CONSTRAINT pk_users PRIMARY KEY (id),
    CONSTRAINT uk_users_email UNIQUE (email)
) ENGINE=InnoDB;

CREATE TABLE provinces (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    CONSTRAINT pk_provinces PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE districts (
    id BIGINT NOT NULL AUTO_INCREMENT,
    province_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    CONSTRAINT pk_districts PRIMARY KEY (id),
    CONSTRAINT fk_districts_province FOREIGN KEY (province_id) REFERENCES provinces (id)
) ENGINE=InnoDB;

CREATE TABLE categories (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    transaction_type ENUM('BUY', 'RENT') NOT NULL,
    CONSTRAINT pk_categories PRIMARY KEY (id),
    CONSTRAINT uk_categories_slug UNIQUE (slug)
) ENGINE=InnoDB;

CREATE TABLE projects (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    investor VARCHAR(255),
    district_id BIGINT,
    status VARCHAR(255),
    price_range VARCHAR(255),
    CONSTRAINT pk_projects PRIMARY KEY (id),
    CONSTRAINT fk_projects_district FOREIGN KEY (district_id) REFERENCES districts (id)
) ENGINE=InnoDB;

CREATE TABLE listings (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    district_id BIGINT NOT NULL,
    project_id BIGINT,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(38, 2) NOT NULL,
    area DOUBLE NOT NULL,
    status ENUM('PENDING', 'ACTIVE', 'REJECTED', 'EXPIRED', 'INACTIVE') NOT NULL DEFAULT 'PENDING',
    created_at DATETIME(6),
    expires_at DATETIME(6),
    CONSTRAINT pk_listings PRIMARY KEY (id),
    CONSTRAINT fk_listings_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_listings_category FOREIGN KEY (category_id) REFERENCES categories (id),
    CONSTRAINT fk_listings_district FOREIGN KEY (district_id) REFERENCES districts (id),
    CONSTRAINT fk_listings_project FOREIGN KEY (project_id) REFERENCES projects (id)
) ENGINE=InnoDB;

CREATE TABLE listing_images (
    id BIGINT NOT NULL AUTO_INCREMENT,
    listing_id BIGINT NOT NULL,
    url VARCHAR(255) NOT NULL,
    sort_order INT,
    CONSTRAINT pk_listing_images PRIMARY KEY (id),
    CONSTRAINT fk_listing_images_listing FOREIGN KEY (listing_id) REFERENCES listings (id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE saved_listings (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    listing_id BIGINT NOT NULL,
    created_at DATETIME(6),
    CONSTRAINT pk_saved_listings PRIMARY KEY (id),
    CONSTRAINT uk_saved_listing_user_listing UNIQUE (user_id, listing_id),
    CONSTRAINT fk_saved_listings_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_saved_listings_listing FOREIGN KEY (listing_id) REFERENCES listings (id) ON DELETE CASCADE
) ENGINE=InnoDB;
