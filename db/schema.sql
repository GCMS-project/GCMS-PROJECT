-- Bootstrap schema for Garbage Collection Management System
-- Direct SQL execution to create complete database schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUMs for system states
CREATE TYPE user_role AS ENUM ('admin', 'customer', 'picker', 'dumpsite_officer', 'tender_officer');
CREATE TYPE pickup_status AS ENUM ('pending', 'assigned', 'in_progress', 'completed', 'cancelled', 'verified');
CREATE TYPE bid_status AS ENUM ('pending', 'accepted', 'rejected', 'expired');
CREATE TYPE tender_status AS ENUM ('open', 'closed', 'awarded', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
CREATE TYPE verification_level AS ENUM ('requester', 'picker', 'dumpsite_officer');
CREATE TYPE notification_type AS ENUM ('pickup_request', 'bid_update', 'payment', 'verification', 'system');

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role user_role NOT NULL DEFAULT 'customer',
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    verification_token VARCHAR(255),
    reset_token VARCHAR(255),
    reset_token_expires TIMESTAMP,
    last_login TIMESTAMP,
    profile_image_url VARCHAR(500),
    address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    deleted_at TIMESTAMP,
    ip_address INET
);

-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name user_role UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID
);

-- Create dump_sites table
CREATE TABLE IF NOT EXISTS dump_sites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    capacity_tonnes DECIMAL(10, 2),
    current_usage_tonnes DECIMAL(10, 2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    operating_hours JSONB,
    contact_person VARCHAR(255),
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    deleted_at TIMESTAMP
);

-- Create pickup_requests table
CREATE TABLE IF NOT EXISTS pickup_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requester_id UUID NOT NULL REFERENCES users(id),
    assigned_picker_id UUID REFERENCES users(id),
    dump_site_id UUID NOT NULL REFERENCES dump_sites(id),
    pickup_location_address TEXT NOT NULL,
    pickup_latitude DECIMAL(10, 8) NOT NULL,
    pickup_longitude DECIMAL(11, 8) NOT NULL,
    waste_type VARCHAR(100) NOT NULL,
    waste_quantity_kg DECIMAL(8, 2) NOT NULL,
    estimated_pickup_time TIMESTAMP,
    actual_pickup_time TIMESTAMP,
    status pickup_status DEFAULT 'pending',
    priority INTEGER DEFAULT 1,
    special_instructions TEXT,
    photos JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    deleted_at TIMESTAMP
);

-- Create dump_verifications table
CREATE TABLE IF NOT EXISTS dump_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pickup_request_id UUID NOT NULL REFERENCES pickup_requests(id),
    verifier_id UUID NOT NULL REFERENCES users(id),
    verification_level verification_level NOT NULL,
    is_verified BOOLEAN DEFAULT false,
    verification_notes TEXT,
    verification_photos JSONB DEFAULT '[]',
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID
);

-- Create tenders table
CREATE TABLE IF NOT EXISTS tenders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    pickup_request_id UUID NOT NULL REFERENCES pickup_requests(id),
    base_price DECIMAL(10, 2) NOT NULL,
    max_price DECIMAL(10, 2),
    status tender_status DEFAULT 'open',
    open_date TIMESTAMP NOT NULL,
    close_date TIMESTAMP NOT NULL,
    awarded_to UUID REFERENCES users(id),
    awarded_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    deleted_at TIMESTAMP
);

-- Create bids table
CREATE TABLE IF NOT EXISTS bids (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tender_id UUID NOT NULL REFERENCES tenders(id),
    bidder_id UUID NOT NULL REFERENCES users(id),
    bid_amount DECIMAL(10, 2) NOT NULL,
    status bid_status DEFAULT 'pending',
    bid_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pickup_request_id UUID NOT NULL REFERENCES pickup_requests(id),
    payer_id UUID NOT NULL REFERENCES users(id),
    payee_id UUID NOT NULL REFERENCES users(id),
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'TZS',
    payment_method VARCHAR(50),
    transaction_id VARCHAR(255),
    status payment_status DEFAULT 'pending',
    payment_date TIMESTAMP,
    refunded_at TIMESTAMP,
    refund_amount DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type notification_type NOT NULL,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    data JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_pickup_requests_requester_id ON pickup_requests(requester_id);
CREATE INDEX idx_pickup_requests_status ON pickup_requests(status);
CREATE INDEX idx_pickup_requests_assigned_picker_id ON pickup_requests(assigned_picker_id);
CREATE INDEX idx_dump_verifications_pickup_request_id ON dump_verifications(pickup_request_id);
CREATE INDEX idx_tenders_status ON tenders(status);
CREATE INDEX idx_bids_tender_id ON bids(tender_id);
CREATE INDEX idx_bids_bidder_id ON bids(bidder_id);
CREATE INDEX idx_payments_pickup_request_id ON payments(pickup_request_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Insert default roles
INSERT INTO roles (name, description, permissions) VALUES
('admin', 'System Administrator', '{"all": true}'),
('customer', 'Garbage Collection Customer', '{"pickup": ["create", "read", "update"], "payment": ["create", "read"]}'),
('picker', 'Garbage Collection Picker', '{"pickup": ["read", "update"], "verification": ["create"]}'),
('dumpsite_officer', 'Dump Site Officer', '{"verification": ["create", "read"], "dump_site": ["read", "update"]}'),
('tender_officer', 'Tender Management Officer', '{"tender": ["create", "read", "update"], "bid": ["read", "update"]}')
ON CONFLICT (name) DO NOTHING;

-- Insert default admin user (password: admin123)
INSERT INTO users (email, phone, password_hash, first_name, last_name, role, is_verified) VALUES
('admin@gcms.com', '+255123456789', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK2O', 'System', 'Administrator', 'admin', true)
ON CONFLICT (email) DO NOTHING;

-- Insert sample dump sites
INSERT INTO dump_sites (name, description, address, latitude, longitude, capacity_tonnes, contact_person, contact_phone) VALUES
('Dar es Salaam Central Dump', 'Main waste disposal site for Dar es Salaam', 'Pugu Road, Dar es Salaam', -6.8235, 39.2695, 1000.00, 'John Mwambene', '+255123456789'),
('Mwanza Regional Dump', 'Regional waste disposal site for Mwanza', 'Mwanza Road, Mwanza', -2.5167, 32.9000, 500.00, 'Sarah Kimaro', '+255987654321'),
('Arusha Municipal Dump', 'Municipal waste disposal site for Arusha', 'Arusha Road, Arusha', -3.3731, 36.6823, 300.00, 'Michael Nyerere', '+255555123456')
ON CONFLICT DO NOTHING;
