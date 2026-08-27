-- =============================================================================
-- TechKıyas Enterprise Price Aggregation & Store Integration Database Schema
-- Compatible with PostgreSQL 14+ / Supabase
-- =============================================================================

-- 1. STORES (Mağazalar)
CREATE TABLE IF NOT EXISTS stores (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    slug VARCHAR(64) UNIQUE NOT NULL,
    domain VARCHAR(128) NOT NULL,
    logo_url TEXT,
    enabled BOOLEAN DEFAULT TRUE,
    supports_api BOOLEAN DEFAULT FALSE,
    reliability_score DECIMAL(3,2) DEFAULT 4.50,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. PRODUCTS (Kanonik Ürünler)
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(128) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(128) NOT NULL,
    model VARCHAR(128),
    category_id VARCHAR(64) NOT NULL,
    barcode VARCHAR(64),
    ean VARCHAR(64),
    gtin VARCHAR(64),
    sku VARCHAR(64),
    description TEXT,
    image_url TEXT,
    priority VARCHAR(16) DEFAULT 'NORMAL' CHECK (priority IN ('HIGH_PRIORITY', 'NORMAL', 'LOW_PRIORITY')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. STORE PRODUCTS (Mağaza İlan Eşleştirmeleri)
CREATE TABLE IF NOT EXISTS store_products (
    id VARCHAR(128) PRIMARY KEY,
    product_id VARCHAR(128) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    store_id VARCHAR(64) NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    store_product_id VARCHAR(128) NOT NULL,
    store_sku VARCHAR(128),
    barcode VARCHAR(64),
    url TEXT NOT NULL,
    title VARCHAR(255) NOT NULL,
    image_url TEXT,
    match_confidence DECIMAL(5,2) DEFAULT 100.00,
    match_status VARCHAR(32) DEFAULT 'MATCHED' CHECK (match_status IN ('MATCHED', 'MATCH_REVIEW_REQUIRED', 'REJECTED')),
    active BOOLEAN DEFAULT TRUE,
    last_checked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(store_id, store_product_id)
);

-- 4. PRICES (Güncel Canlı Fiyatlar)
CREATE TABLE IF NOT EXISTS prices (
    id VARCHAR(128) PRIMARY KEY,
    product_id VARCHAR(128) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    store_id VARCHAR(64) NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    store_product_id VARCHAR(128) NOT NULL,
    price DECIMAL(12,2) NOT NULL CHECK (price >= 0),
    shipping_price DECIMAL(10,2) DEFAULT NULL,
    total_price DECIMAL(12,2) NOT NULL CHECK (total_price >= 0),
    currency VARCHAR(8) DEFAULT 'TRY',
    stock_status VARCHAR(32) DEFAULT 'IN_STOCK' CHECK (stock_status IN ('IN_STOCK', 'OUT_OF_STOCK', 'UNKNOWN', 'PREORDER')),
    seller_name VARCHAR(128) DEFAULT 'Resmi Satıcı',
    url TEXT NOT NULL,
    is_anomaly BOOLEAN DEFAULT FALSE,
    checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, store_id, seller_name)
);

-- 5. PRICE HISTORY (Fiyat Değişim Geçmişi)
CREATE TABLE IF NOT EXISTS price_history (
    id BIGSERIAL PRIMARY KEY,
    product_id VARCHAR(128) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    store_id VARCHAR(64) NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    store_product_id VARCHAR(128),
    old_price DECIMAL(12,2),
    price DECIMAL(12,2) NOT NULL,
    shipping_price DECIMAL(10,2),
    total_price DECIMAL(12,2) NOT NULL,
    difference DECIMAL(12,2) DEFAULT 0.00,
    percentage_difference DECIMAL(6,2) DEFAULT 0.00,
    stock_status VARCHAR(32) DEFAULT 'IN_STOCK',
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. PRICE UPDATE JOBS (Kuyruk & Güncelleme Görevleri)
CREATE TABLE IF NOT EXISTS price_update_jobs (
    id VARCHAR(128) PRIMARY KEY,
    product_id VARCHAR(128) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    store_id VARCHAR(64) REFERENCES stores(id) ON DELETE SET NULL,
    priority VARCHAR(16) DEFAULT 'NORMAL',
    status VARCHAR(32) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'RETRYING')),
    attempts INT DEFAULT 0,
    max_attempts INT DEFAULT 3,
    error_message TEXT,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- PERFORMANCE INDEXES (Yüksek Performans & 10.000+ Ürün Hızlı Sorguları)
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_ean ON products(ean);
CREATE INDEX IF NOT EXISTS idx_products_gtin ON products(gtin);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_priority ON products(priority);

CREATE INDEX IF NOT EXISTS idx_store_products_product_id ON store_products(product_id);
CREATE INDEX IF NOT EXISTS idx_store_products_store_id ON store_products(store_id);
CREATE INDEX IF NOT EXISTS idx_store_products_barcode ON store_products(barcode);

CREATE INDEX IF NOT EXISTS idx_prices_product_id ON prices(product_id);
CREATE INDEX IF NOT EXISTS idx_prices_store_id ON prices(store_id);
CREATE INDEX IF NOT EXISTS idx_prices_total_price ON prices(total_price);
CREATE INDEX IF NOT EXISTS idx_prices_checked_at ON prices(checked_at);
CREATE INDEX IF NOT EXISTS idx_prices_is_anomaly ON prices(is_anomaly);

CREATE INDEX IF NOT EXISTS idx_price_history_product_id ON price_history(product_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_price_history_store_id ON price_history(store_id);

CREATE INDEX IF NOT EXISTS idx_price_update_jobs_status ON price_update_jobs(status, priority, created_at);
