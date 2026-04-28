USE routeguard_db;
DROP TABLE IF EXISTS shipments;
CREATE TABLE shipments (
    id VARCHAR(15) PRIMARY KEY,
    origin VARCHAR(100),
    destination VARCHAR(100),
    cargo_type VARCHAR(100),
    start_lat DECIMAL(10, 8),
    start_lng DECIMAL(10, 8),
    end_lat DECIMAL(10, 8),
    end_lng DECIMAL(10, 8),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);