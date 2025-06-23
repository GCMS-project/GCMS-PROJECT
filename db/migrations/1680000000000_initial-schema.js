/* eslint-disable camelcase */
exports.shorthands = undefined;

exports.up = (pgm) => {
  // Enable UUID extension
  pgm.sql('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

  // Create ENUMs
  pgm.createType('user_role', ['admin', 'customer', 'picker', 'dumpsite_officer', 'tender_officer']);
  pgm.createType('pickup_status', ['pending', 'assigned', 'in_progress', 'completed', 'cancelled', 'verified']);
  pgm.createType('bid_status', ['pending', 'accepted', 'rejected', 'expired']);
  pgm.createType('tender_status', ['open', 'closed', 'awarded', 'cancelled']);
  pgm.createType('payment_status', ['pending', 'paid', 'failed', 'refunded']);
  pgm.createType('verification_level', ['requester', 'picker', 'dumpsite_officer']);
  pgm.createType('notification_type', ['pickup_request', 'bid_update', 'payment', 'verification', 'system']);

  // Users table
  pgm.createTable('users', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    email: { type: 'varchar(255)', notNull: true, unique: true },
    phone: { type: 'varchar(20)', unique: true },
    password_hash: { type: 'varchar(255)', notNull: true },
    first_name: { type: 'varchar(100)', notNull: true },
    last_name: { type: 'varchar(100)', notNull: true },
    role: { type: 'user_role', notNull: true, default: 'customer' },
    is_active: { type: 'boolean', default: true },
    is_verified: { type: 'boolean', default: false },
    verification_token: { type: 'varchar(255)' },
    reset_token: { type: 'varchar(255)' },
    reset_token_expires: { type: 'timestamp' },
    last_login: { type: 'timestamp' },
    profile_image_url: { type: 'varchar(500)' },
    address: { type: 'text' },
    latitude: { type: 'decimal(10,8)' },
    longitude: { type: 'decimal(11,8)' },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    created_by: { type: 'uuid' },
    updated_by: { type: 'uuid' },
    deleted_at: { type: 'timestamp' },
    ip_address: { type: 'inet' },
  });

  // Roles table
  pgm.createTable('roles', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    name: { type: 'user_role', notNull: true, unique: true },
    description: { type: 'text' },
    permissions: { type: 'jsonb', default: '{}' },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    created_by: { type: 'uuid' },
    updated_by: { type: 'uuid' },
  });

  // Dump sites table
  pgm.createTable('dump_sites', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    name: { type: 'varchar(255)', notNull: true },
    description: { type: 'text' },
    address: { type: 'text', notNull: true },
    latitude: { type: 'decimal(10,8)', notNull: true },
    longitude: { type: 'decimal(11,8)', notNull: true },
    capacity_tonnes: { type: 'decimal(10,2)' },
    current_usage_tonnes: { type: 'decimal(10,2)', default: 0 },
    is_active: { type: 'boolean', default: true },
    operating_hours: { type: 'jsonb' },
    contact_person: { type: 'varchar(255)' },
    contact_phone: { type: 'varchar(20)' },
    contact_email: { type: 'varchar(255)' },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    created_by: { type: 'uuid' },
    updated_by: { type: 'uuid' },
    deleted_at: { type: 'timestamp' },
  });

  // Pickup requests table
  pgm.createTable('pickup_requests', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    requester_id: { type: 'uuid', notNull: true, references: 'users' },
    assigned_picker_id: { type: 'uuid', references: 'users' },
    dump_site_id: { type: 'uuid', notNull: true, references: 'dump_sites' },
    pickup_location_address: { type: 'text', notNull: true },
    pickup_latitude: { type: 'decimal(10,8)', notNull: true },
    pickup_longitude: { type: 'decimal(11,8)', notNull: true },
    waste_type: { type: 'varchar(100)', notNull: true },
    waste_quantity_kg: { type: 'decimal(8,2)', notNull: true },
    estimated_pickup_time: { type: 'timestamp' },
    actual_pickup_time: { type: 'timestamp' },
    status: { type: 'pickup_status', default: 'pending' },
    priority: { type: 'integer', default: 1 },
    special_instructions: { type: 'text' },
    photos: { type: 'jsonb', default: '[]' },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    created_by: { type: 'uuid' },
    updated_by: { type: 'uuid' },
    deleted_at: { type: 'timestamp' },
  });

  // Dump verifications table
  pgm.createTable('dump_verifications', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    pickup_request_id: { type: 'uuid', notNull: true, references: 'pickup_requests' },
    verifier_id: { type: 'uuid', notNull: true, references: 'users' },
    verification_level: { type: 'verification_level', notNull: true },
    is_verified: { type: 'boolean', default: false },
    verification_notes: { type: 'text' },
    verification_photos: { type: 'jsonb', default: '[]' },
    verified_at: { type: 'timestamp' },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    created_by: { type: 'uuid' },
    updated_by: { type: 'uuid' },
  });

  // Tenders table
  pgm.createTable('tenders', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    title: { type: 'varchar(255)', notNull: true },
    description: { type: 'text', notNull: true },
    pickup_request_id: { type: 'uuid', notNull: true, references: 'pickup_requests' },
    base_price: { type: 'decimal(10,2)', notNull: true },
    max_price: { type: 'decimal(10,2)' },
    status: { type: 'tender_status', default: 'open' },
    open_date: { type: 'timestamp', notNull: true },
    close_date: { type: 'timestamp', notNull: true },
    awarded_to: { type: 'uuid', references: 'users' },
    awarded_at: { type: 'timestamp' },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    created_by: { type: 'uuid' },
    updated_by: { type: 'uuid' },
    deleted_at: { type: 'timestamp' },
  });

  // Bids table
  pgm.createTable('bids', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    tender_id: { type: 'uuid', notNull: true, references: 'tenders' },
    bidder_id: { type: 'uuid', notNull: true, references: 'users' },
    bid_amount: { type: 'decimal(10,2)', notNull: true },
    status: { type: 'bid_status', default: 'pending' },
    bid_notes: { type: 'text' },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    created_by: { type: 'uuid' },
    updated_by: { type: 'uuid' },
  });

  // Payments table
  pgm.createTable('payments', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    pickup_request_id: { type: 'uuid', notNull: true, references: 'pickup_requests' },
    payer_id: { type: 'uuid', notNull: true, references: 'users' },
    payee_id: { type: 'uuid', notNull: true, references: 'users' },
    amount: { type: 'decimal(10,2)', notNull: true },
    currency: { type: 'varchar(3)', default: 'TZS' },
    payment_method: { type: 'varchar(50)' },
    transaction_id: { type: 'varchar(255)' },
    status: { type: 'payment_status', default: 'pending' },
    payment_date: { type: 'timestamp' },
    refunded_at: { type: 'timestamp' },
    refund_amount: { type: 'decimal(10,2)' },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    created_by: { type: 'uuid' },
    updated_by: { type: 'uuid' },
  });

  // Notifications table
  pgm.createTable('notifications', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    user_id: { type: 'uuid', notNull: true, references: 'users' },
    title: { type: 'varchar(255)', notNull: true },
    message: { type: 'text', notNull: true },
    type: { type: 'notification_type', notNull: true },
    is_read: { type: 'boolean', default: false },
    read_at: { type: 'timestamp' },
    data: { type: 'jsonb', default: '{}' },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    created_by: { type: 'uuid' },
    updated_by: { type: 'uuid' },
  });

  // Audit logs table
  pgm.createTable('audit_logs', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    user_id: { type: 'uuid', references: 'users' },
    action: { type: 'varchar(100)', notNull: true },
    table_name: { type: 'varchar(100)', notNull: true },
    record_id: { type: 'uuid' },
    old_values: { type: 'jsonb' },
    new_values: { type: 'jsonb' },
    ip_address: { type: 'inet' },
    user_agent: { type: 'text' },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  // Create indexes for performance
  pgm.createIndex('users', 'email');
  pgm.createIndex('users', 'phone');
  pgm.createIndex('users', 'role');
  pgm.createIndex('pickup_requests', 'requester_id');
  pgm.createIndex('pickup_requests', 'status');
  pgm.createIndex('pickup_requests', 'assigned_picker_id');
  pgm.createIndex('dump_verifications', 'pickup_request_id');
  pgm.createIndex('tenders', 'status');
  pgm.createIndex('bids', 'tender_id');
  pgm.createIndex('bids', 'bidder_id');
  pgm.createIndex('payments', 'pickup_request_id');
  pgm.createIndex('notifications', 'user_id');
  pgm.createIndex('notifications', 'is_read');
  pgm.createIndex('audit_logs', 'user_id');
  pgm.createIndex('audit_logs', 'created_at');

  // Create audit trigger function
  pgm.sql(`
    CREATE OR REPLACE FUNCTION update_audit_columns()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        NEW.updated_by = COALESCE(NEW.updated_by, current_setting('app.current_user_id', true));
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // Create audit triggers
  pgm.sql('CREATE TRIGGER update_users_audit_columns BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_audit_columns();');
  pgm.sql('CREATE TRIGGER update_roles_audit_columns BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION update_audit_columns();');
  pgm.sql('CREATE TRIGGER update_dump_sites_audit_columns BEFORE UPDATE ON dump_sites FOR EACH ROW EXECUTE FUNCTION update_audit_columns();');
  pgm.sql('CREATE TRIGGER update_pickup_requests_audit_columns BEFORE UPDATE ON pickup_requests FOR EACH ROW EXECUTE FUNCTION update_audit_columns();');
  pgm.sql('CREATE TRIGGER update_dump_verifications_audit_columns BEFORE UPDATE ON dump_verifications FOR EACH ROW EXECUTE FUNCTION update_audit_columns();');
  pgm.sql('CREATE TRIGGER update_tenders_audit_columns BEFORE UPDATE ON tenders FOR EACH ROW EXECUTE FUNCTION update_audit_columns();');
  pgm.sql('CREATE TRIGGER update_bids_audit_columns BEFORE UPDATE ON bids FOR EACH ROW EXECUTE FUNCTION update_audit_columns();');
  pgm.sql('CREATE TRIGGER update_payments_audit_columns BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_audit_columns();');
  pgm.sql('CREATE TRIGGER update_notifications_audit_columns BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION update_audit_columns();');

  // Create audit log trigger function
  pgm.sql(`
    CREATE OR REPLACE FUNCTION audit_trigger_function()
    RETURNS TRIGGER AS $$
    BEGIN
        IF TG_OP = 'INSERT' THEN
            INSERT INTO audit_logs (user_id, action, table_name, record_id, new_values, ip_address)
            VALUES (
                COALESCE(current_setting('app.current_user_id', true)::UUID, NULL),
                'INSERT',
                TG_TABLE_NAME,
                NEW.id,
                to_jsonb(NEW),
                inet_client_addr()
            );
            RETURN NEW;
        ELSIF TG_OP = 'UPDATE' THEN
            INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values, new_values, ip_address)
            VALUES (
                COALESCE(current_setting('app.current_user_id', true)::UUID, NULL),
                'UPDATE',
                TG_TABLE_NAME,
                NEW.id,
                to_jsonb(OLD),
                to_jsonb(NEW),
                inet_client_addr()
            );
            RETURN NEW;
        ELSIF TG_OP = 'DELETE' THEN
            INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values, ip_address)
            VALUES (
                COALESCE(current_setting('app.current_user_id', true)::UUID, NULL),
                'DELETE',
                TG_TABLE_NAME,
                OLD.id,
                to_jsonb(OLD),
                inet_client_addr()
            );
            RETURN OLD;
        END IF;
        RETURN NULL;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // Create audit triggers for all tables
  pgm.sql('CREATE TRIGGER audit_users_trigger AFTER INSERT OR UPDATE OR DELETE ON users FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();');
  pgm.sql('CREATE TRIGGER audit_pickup_requests_trigger AFTER INSERT OR UPDATE OR DELETE ON pickup_requests FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();');
  pgm.sql('CREATE TRIGGER audit_dump_verifications_trigger AFTER INSERT OR UPDATE OR DELETE ON dump_verifications FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();');
  pgm.sql('CREATE TRIGGER audit_tenders_trigger AFTER INSERT OR UPDATE OR DELETE ON tenders FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();');
  pgm.sql('CREATE TRIGGER audit_bids_trigger AFTER INSERT OR UPDATE OR DELETE ON bids FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();');
  pgm.sql('CREATE TRIGGER audit_payments_trigger AFTER INSERT OR UPDATE OR DELETE ON payments FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();');

  // Create constraints
  pgm.sql('ALTER TABLE pickup_requests ADD CONSTRAINT check_waste_quantity_positive CHECK (waste_quantity_kg > 0);');
  pgm.sql('ALTER TABLE bids ADD CONSTRAINT check_bid_amount_positive CHECK (bid_amount > 0);');
  pgm.sql('ALTER TABLE payments ADD CONSTRAINT check_payment_amount_positive CHECK (amount > 0);');
  pgm.sql('ALTER TABLE tenders ADD CONSTRAINT check_tender_dates CHECK (close_date > open_date);');

  // Create views for common queries
  pgm.sql(`
    CREATE VIEW active_pickups AS
    SELECT 
        pr.*,
        u.first_name as requester_first_name,
        u.last_name as requester_last_name,
        u.email as requester_email,
        u.phone as requester_phone,
        p.first_name as picker_first_name,
        p.last_name as picker_last_name,
        ds.name as dump_site_name,
        ds.address as dump_site_address
    FROM pickup_requests pr
    JOIN users u ON pr.requester_id = u.id
    LEFT JOIN users p ON pr.assigned_picker_id = p.id
    JOIN dump_sites ds ON pr.dump_site_id = ds.id
    WHERE pr.deleted_at IS NULL;
  `);

  pgm.sql(`
    CREATE VIEW pending_verifications AS
    SELECT 
        dv.*,
        pr.waste_type,
        pr.waste_quantity_kg,
        u.first_name as verifier_first_name,
        u.last_name as verifier_last_name
    FROM dump_verifications dv
    JOIN pickup_requests pr ON dv.pickup_request_id = pr.id
    JOIN users u ON dv.verifier_id = u.id
    WHERE dv.is_verified = false;
  `);

  // Insert default roles
  pgm.sql(`
    INSERT INTO roles (name, description, permissions) VALUES
    ('admin', 'System Administrator', '{"all": true}'),
    ('customer', 'Garbage Collection Customer', '{"pickup": ["create", "read", "update"], "payment": ["create", "read"]}'),
    ('picker', 'Garbage Collection Picker', '{"pickup": ["read", "update"], "verification": ["create"]}'),
    ('dumpsite_officer', 'Dump Site Officer', '{"verification": ["create", "read"], "dump_site": ["read", "update"]}'),
    ('tender_officer', 'Tender Management Officer', '{"tender": ["create", "read", "update"], "bid": ["read", "update"]}')
    ON CONFLICT (name) DO NOTHING;
  `);

  // Insert default admin user (password: admin123)
  pgm.sql(`
    INSERT INTO users (email, phone, password_hash, first_name, last_name, role, is_verified) VALUES
    ('admin@gcms.com', '+255123456789', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK2O', 'System', 'Administrator', 'admin', true)
    ON CONFLICT (email) DO NOTHING;
  `);

  // Insert sample dump sites
  pgm.sql(`
    INSERT INTO dump_sites (name, description, address, latitude, longitude, capacity_tonnes, contact_person, contact_phone) VALUES
    ('Dar es Salaam Central Dump', 'Main waste disposal site for Dar es Salaam', 'Pugu Road, Dar es Salaam', -6.8235, 39.2695, 1000.00, 'John Mwambene', '+255123456789'),
    ('Mwanza Regional Dump', 'Regional waste disposal site for Mwanza', 'Mwanza Road, Mwanza', -2.5167, 32.9000, 500.00, 'Sarah Kimaro', '+255987654321'),
    ('Arusha Municipal Dump', 'Municipal waste disposal site for Arusha', 'Arusha Road, Arusha', -3.3731, 36.6823, 300.00, 'Michael Nyerere', '+255555123456')
    ON CONFLICT DO NOTHING;
  `);
};

exports.down = (pgm) => {
  // Drop views
  pgm.sql('DROP VIEW IF EXISTS pending_verifications;');
  pgm.sql('DROP VIEW IF EXISTS active_pickups;');

  // Drop triggers
  pgm.sql('DROP TRIGGER IF EXISTS audit_payments_trigger ON payments;');
  pgm.sql('DROP TRIGGER IF EXISTS audit_bids_trigger ON bids;');
  pgm.sql('DROP TRIGGER IF EXISTS audit_tenders_trigger ON tenders;');
  pgm.sql('DROP TRIGGER IF EXISTS audit_dump_verifications_trigger ON dump_verifications;');
  pgm.sql('DROP TRIGGER IF EXISTS audit_pickup_requests_trigger ON pickup_requests;');
  pgm.sql('DROP TRIGGER IF EXISTS audit_users_trigger ON users;');

  pgm.sql('DROP TRIGGER IF EXISTS update_notifications_audit_columns ON notifications;');
  pgm.sql('DROP TRIGGER IF EXISTS update_payments_audit_columns ON payments;');
  pgm.sql('DROP TRIGGER IF EXISTS update_bids_audit_columns ON bids;');
  pgm.sql('DROP TRIGGER IF EXISTS update_tenders_audit_columns ON tenders;');
  pgm.sql('DROP TRIGGER IF EXISTS update_dump_verifications_audit_columns ON dump_verifications;');
  pgm.sql('DROP TRIGGER IF EXISTS update_pickup_requests_audit_columns ON pickup_requests;');
  pgm.sql('DROP TRIGGER IF EXISTS update_dump_sites_audit_columns ON dump_sites;');
  pgm.sql('DROP TRIGGER IF EXISTS update_roles_audit_columns ON roles;');
  pgm.sql('DROP TRIGGER IF EXISTS update_users_audit_columns ON users;');

  // Drop functions
  pgm.sql('DROP FUNCTION IF EXISTS audit_trigger_function();');
  pgm.sql('DROP FUNCTION IF EXISTS update_audit_columns();');

  // Drop tables
  pgm.dropTable('audit_logs');
  pgm.dropTable('notifications');
  pgm.dropTable('payments');
  pgm.dropTable('bids');
  pgm.dropTable('tenders');
  pgm.dropTable('dump_verifications');
  pgm.dropTable('pickup_requests');
  pgm.dropTable('dump_sites');
  pgm.dropTable('roles');
  pgm.dropTable('users');

  // Drop types
  pgm.dropType('notification_type');
  pgm.dropType('verification_level');
  pgm.dropType('payment_status');
  pgm.dropType('tender_status');
  pgm.dropType('bid_status');
  pgm.dropType('pickup_status');
  pgm.dropType('user_role');

  // Drop extension
  pgm.sql('DROP EXTENSION IF EXISTS "uuid-ossp";');
}; 