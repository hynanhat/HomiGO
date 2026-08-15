CREATE INDEX idx_districts_province ON districts (province_id);
CREATE INDEX idx_projects_district_status ON projects (district_id, status);

CREATE INDEX idx_listings_status_created_at ON listings (status, created_at);
CREATE INDEX idx_listings_district_status ON listings (district_id, status);
CREATE INDEX idx_listings_category_status ON listings (category_id, status);
CREATE INDEX idx_listings_project_status ON listings (project_id, status);
CREATE INDEX idx_listings_user_status ON listings (user_id, status);
CREATE INDEX idx_listings_price ON listings (price);
CREATE INDEX idx_listings_area ON listings (area);
CREATE INDEX idx_listings_expires_at ON listings (expires_at);

CREATE INDEX idx_listing_images_listing_sort ON listing_images (listing_id, sort_order);
CREATE INDEX idx_saved_listings_user_created_at ON saved_listings (user_id, created_at);
