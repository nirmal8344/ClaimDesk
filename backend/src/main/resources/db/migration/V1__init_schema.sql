-- Flyway Schema Migration V1: Initial ClaimDesk Database Schema

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role VARCHAR(50) NOT NULL, -- CUSTOMER, CLAIM_OFFICER, ADMIN
    phone_number VARCHAR(50),
    department VARCHAR(100),
    employee_id VARCHAR(50),
    address TEXT,
    avatar_url VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, INACTIVE
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

CREATE TABLE IF NOT EXISTS claim_categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS policies (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    policy_number VARCHAR(100) UNIQUE NOT NULL,
    policy_type VARCHAR(100) NOT NULL,
    provider_company VARCHAR(150) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    coverage_amount NUMERIC(15, 2) NOT NULL,
    premium_amount NUMERIC(15, 2) NOT NULL,
    premium_term VARCHAR(50) DEFAULT 'year',
    coverage_description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, EXPIRED, CANCELLED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_policies_customer ON policies(customer_id);
CREATE INDEX IF NOT EXISTS idx_policies_status ON policies(status);
CREATE INDEX IF NOT EXISTS idx_policies_number ON policies(policy_number);

CREATE TABLE IF NOT EXISTS claims (
    id BIGSERIAL PRIMARY KEY,
    claim_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id BIGINT NOT NULL REFERENCES users(id),
    policy_id BIGINT NOT NULL REFERENCES policies(id),
    claim_type VARCHAR(100) NOT NULL,
    incident_title VARCHAR(255) NOT NULL,
    incident_date DATE NOT NULL,
    incident_location VARCHAR(255) NOT NULL,
    incident_description TEXT NOT NULL,
    estimated_loss NUMERIC(15, 2) NOT NULL,
    requested_amount NUMERIC(15, 2) NOT NULL,
    additional_remarks TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'Submitted',
    priority VARCHAR(50) DEFAULT 'Medium', -- Low, Medium, High
    assigned_officer_id BIGINT REFERENCES users(id),
    assigned_date TIMESTAMP,
    assignment_remarks TEXT,
    rejection_reason TEXT,
    rejection_remarks TEXT,
    rejection_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_claims_customer ON claims(customer_id);
CREATE INDEX IF NOT EXISTS idx_claims_officer ON claims(assigned_officer_id);
CREATE INDEX IF NOT EXISTS idx_claims_status ON claims(status);
CREATE INDEX IF NOT EXISTS idx_claims_number ON claims(claim_number);

CREATE TABLE IF NOT EXISTS claim_documents (
    id BIGSERIAL PRIMARY KEY,
    claim_id BIGINT NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
    document_type VARCHAR(100) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    stored_path VARCHAR(500) NOT NULL,
    file_size BIGINT,
    file_type VARCHAR(100),
    is_photo BOOLEAN DEFAULT FALSE,
    photo_category VARCHAR(100),
    description TEXT,
    uploaded_by_id BIGINT REFERENCES users(id),
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    review_status VARCHAR(50) DEFAULT 'Pending Review', -- Pending Review, Accepted, Rejected, Replacement Required
    officer_remarks TEXT
);

CREATE INDEX IF NOT EXISTS idx_documents_claim ON claim_documents(claim_id);

CREATE TABLE IF NOT EXISTS document_requests (
    id BIGSERIAL PRIMARY KEY,
    claim_id BIGINT NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
    officer_id BIGINT NOT NULL REFERENCES users(id),
    document_type VARCHAR(100) NOT NULL,
    is_mandatory BOOLEAN DEFAULT TRUE,
    remarks TEXT NOT NULL,
    due_date DATE,
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, FULFILLED, CANCELLED
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fulfilled_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_doc_requests_claim ON document_requests(claim_id);

CREATE TABLE IF NOT EXISTS claim_assessments (
    id BIGSERIAL PRIMARY KEY,
    claim_id BIGINT UNIQUE NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
    officer_id BIGINT NOT NULL REFERENCES users(id),
    assessment_date DATE NOT NULL,
    assessed_loss NUMERIC(15, 2) NOT NULL,
    eligible_amount NUMERIC(15, 2) NOT NULL,
    non_eligible_amount NUMERIC(15, 2) NOT NULL,
    remarks TEXT,
    recommendation VARCHAR(50) NOT NULL, -- Approve, Reject
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS claim_decisions (
    id BIGSERIAL PRIMARY KEY,
    claim_id BIGINT UNIQUE NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
    decided_by_id BIGINT NOT NULL REFERENCES users(id),
    decision VARCHAR(50) NOT NULL, -- Approved, Rejected
    approved_amount NUMERIC(15, 2),
    decision_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    remarks TEXT,
    rejection_reason TEXT
);

CREATE TABLE IF NOT EXISTS settlements (
    id BIGSERIAL PRIMARY KEY,
    claim_id BIGINT UNIQUE NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
    approved_amount NUMERIC(15, 2) NOT NULL,
    settlement_amount NUMERIC(15, 2) NOT NULL,
    settlement_date DATE NOT NULL,
    settlement_reference VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending', -- Pending, Processing, Completed
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS claim_timeline_events (
    id BIGSERIAL PRIMARY KEY,
    claim_id BIGINT NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
    event_name VARCHAR(150) NOT NULL,
    user_id BIGINT REFERENCES users(id),
    user_name VARCHAR(150),
    remarks TEXT,
    event_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_timeline_claim ON claim_timeline_events(claim_id);

CREATE TABLE IF NOT EXISTS claim_notes (
    id BIGSERIAL PRIMARY KEY,
    claim_id BIGINT NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id),
    user_name VARCHAR(150),
    note TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notes_claim ON claim_notes(claim_id);

CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- CLAIM, DOCUMENT, ASSIGNMENT, SETTLEMENT, SYSTEM
    link VARCHAR(255),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);

CREATE TABLE IF NOT EXISTS system_settings (
    id BIGSERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'GENERAL'
);

CREATE TABLE IF NOT EXISTS customer_feedback (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL REFERENCES users(id),
    claim_id BIGINT REFERENCES claims(id),
    rating INT NOT NULL,
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
