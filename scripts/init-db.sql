-- ========================================================
-- B2B E-commerce Prototype - PostgreSQL Initialization
-- Enforcing Separation of Concerns via isolated schemas
-- ========================================================

-- 1. Create separate schemas for PD and CA services
CREATE SCHEMA IF NOT EXISTS category_schema;
CREATE SCHEMA IF NOT EXISTS product_schema;

-- 2. Category Schema (Owned by CA Service)
CREATE TABLE IF NOT EXISTS category_schema.categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    sort_order INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'ACTIVE', -- 'ACTIVE' or 'INACTIVE'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Product Schema (Owned by PD Service)
-- Note: Decoupled architecture - category_id is stored as a reference
-- without cross-schema foreign key constraint to maintain microservice autonomy.
CREATE TABLE IF NOT EXISTS product_schema.products (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    sku VARCHAR(100),
    description TEXT,
    category_id VARCHAR(50) NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Initial Mock Data for Categories (CA Service)
INSERT INTO category_schema.categories (id, name, sort_order, status)
VALUES 
    ('cat-001', 'Hardware & IoT', 1, 'ACTIVE'),
    ('cat-002', 'Cloud Solutions', 2, 'ACTIVE'),
    ('cat-003', 'Enterprise Software', 3, 'ACTIVE'),
    ('cat-004', 'Supply Chain & Logistics', 4, 'ACTIVE'),
    ('cat-005', 'Cybersecurity & Network Defense', 5, 'ACTIVE'),
    ('cat-006', 'AI & Data Analytics Platform', 6, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- Initial Mock Data for Products (PD Service)
INSERT INTO product_schema.products (id, name, price, sku, description, category_id, image_url)
VALUES 
    ('prod-001', 'Enterprise ERP Suite', 14500.00, 'EP-ERP-001', 'Comprehensive enterprise resource planning software for large scale B2B businesses.', 'cat-003', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&auto=format&fit=crop&q=80'),
    ('prod-002', 'Global Supply Chain Pro', 8200.00, 'EP-ERP-002', 'Intelligent inventory and freight tracking logistics automation platform.', 'cat-004', 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&auto=format&fit=crop&q=80'),
    ('prod-003', 'Industrial IoT Sensor Kit', 350.00, 'EP-ERP-003', 'Ruggedized wireless vibration and thermal sensors for manufacturing factories.', 'cat-001', 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&auto=format&fit=crop&q=80'),
    ('prod-004', 'Hybrid Cloud Gateway Box', 1299.99, 'EP-ERP-004', 'Edge computing appliance for seamless on-premise to cloud data synchronization.', 'cat-002', 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&auto=format&fit=crop&q=80'),
    ('prod-005', 'Next-Gen AI Edge Accelerator', 3200.00, 'EP-AI-101', 'High-performance TPU accelerator board for real-time edge computer vision inference.', 'cat-006', 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=500&auto=format&fit=crop&q=80'),
    ('prod-006', 'Zero-Trust Enterprise Firewall Gateway', 6800.00, 'EP-SEC-202', 'Hardware security appliance featuring deep packet inspection and automated intrusion prevention.', 'cat-005', 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500&auto=format&fit=crop&q=80'),
    ('prod-007', 'Industrial SCADA Monitoring Controller', 1450.00, 'EP-IOT-303', 'DIN-rail mountable PLC and telemetry controller for automated factory machinery.', 'cat-001', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=80'),
    ('prod-008', 'Smart Automated Forklift Fleet Manager', 19500.00, 'EP-LOG-404', 'Centralized telemetry hub for autonomous guided vehicles and warehouse logistics robotics.', 'cat-004', 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=500&auto=format&fit=crop&q=80'),
    ('prod-009', 'Distributed Cloud Kubernetes Engine Box', 9800.00, 'EP-CLD-505', 'Plug-and-play bare metal Kubernetes cluster appliance with built-in zero-downtime failover.', 'cat-002', 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=500&auto=format&fit=crop&q=80'),
    ('prod-010', 'Automated Threat Detection & SIEM Software', 12400.00, 'EP-SEC-606', 'Enterprise SIEM security platform with machine learning-driven anomaly detection.', 'cat-005', 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=500&auto=format&fit=crop&q=80'),
    ('prod-011', 'B2B Multi-Vendor Billing & Invoicing Engine', 5200.00, 'EP-ERP-707', 'Automated recurring billing, tax calculation, and multi-currency settlement gateway.', 'cat-003', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&auto=format&fit=crop&q=80'),
    ('prod-012', 'IoT Environmental Air & Gas Sensor Node', 490.00, 'EP-IOT-808', 'Industrial hazardous gas and particulate matter monitor with LoRaWAN wireless connectivity.', 'cat-001', 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop&q=80'),
    ('prod-013', 'High-Speed Cold Storage Archive Appliance', 15300.00, 'EP-CLD-909', 'Petabyte-scale on-premise object storage appliance compatible with S3 API protocol.', 'cat-002', 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500&auto=format&fit=crop&q=80'),
    ('prod-014', 'Real-Time GPS Fleet Telematics Tracker', 280.00, 'EP-LOG-010', 'Ruggedized 4G LTE vehicle tracking unit with OBD-II diagnostic telemetry sensors.', 'cat-004', 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=500&auto=format&fit=crop&q=80')
ON CONFLICT (id) DO NOTHING;
