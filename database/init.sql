-- HL7 LiteBoard Database Schema
-- Create database and user
CREATE USER hl7user WITH ENCRYPTED PASSWORD 'hl7password';
CREATE DATABASE hl7_liteboard OWNER hl7user;

-- Connect to the database
\c hl7_liteboard;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE hl7_liteboard TO hl7user;
GRANT ALL ON SCHEMA public TO hl7user;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Patients table
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id VARCHAR(50) UNIQUE NOT NULL, -- HL7 PID.3
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    middle_name VARCHAR(100),
    date_of_birth DATE,
    gender CHAR(1),
    ssn VARCHAR(11),
    address_line1 VARCHAR(200),
    address_line2 VARCHAR(200),
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    country VARCHAR(50),
    phone_home VARCHAR(20),
    phone_work VARCHAR(20),
    phone_mobile VARCHAR(20),
    email VARCHAR(255),
    marital_status VARCHAR(20),
    race VARCHAR(100),
    ethnicity VARCHAR(100),
    language VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Patient visits table
CREATE TABLE patient_visits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    visit_number VARCHAR(50) UNIQUE NOT NULL, -- HL7 PV1.19
    admission_date TIMESTAMP WITH TIME ZONE,
    discharge_date TIMESTAMP WITH TIME ZONE,
    visit_type VARCHAR(50), -- Inpatient, Outpatient, Emergency, etc.
    patient_class VARCHAR(20), -- HL7 PV1.2
    assigned_location VARCHAR(100), -- HL7 PV1.3
    attending_doctor VARCHAR(200),
    referring_doctor VARCHAR(200),
    room_number VARCHAR(20),
    bed_number VARCHAR(20),
    admission_reason TEXT,
    discharge_disposition VARCHAR(100),
    discharge_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Patient allergies table
CREATE TABLE patient_allergies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    allergen VARCHAR(200) NOT NULL,
    allergen_type VARCHAR(50), -- Drug, Food, Environmental, etc.
    reaction TEXT,
    severity VARCHAR(20), -- Mild, Moderate, Severe, Life-threatening
    onset_date DATE,
    status VARCHAR(20) DEFAULT 'Active', -- Active, Inactive, Resolved
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Patient medications table
CREATE TABLE patient_medications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    medication_name VARCHAR(200) NOT NULL,
    generic_name VARCHAR(200),
    dosage VARCHAR(100),
    route VARCHAR(50), -- Oral, IV, IM, etc.
    frequency VARCHAR(100),
    start_date DATE,
    end_date DATE,
    prescribing_doctor VARCHAR(200),
    pharmacy VARCHAR(200),
    status VARCHAR(20) DEFAULT 'Active', -- Active, Discontinued, Completed
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- HL7 messages log table
CREATE TABLE hl7_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
    message_type VARCHAR(20) NOT NULL, -- ADT, ORU, ORM, etc.
    trigger_event VARCHAR(20), -- A01, A02, A03, etc.
    raw_message TEXT NOT NULL,
    parsed_data JSONB,
    processing_status VARCHAR(20) DEFAULT 'Processed', -- Processed, Error, Pending
    error_message TEXT,
    source_system VARCHAR(100),
    received_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Audit log table
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name VARCHAR(50) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL, -- INSERT, UPDATE, DELETE
    old_values JSONB,
    new_values JSONB,
    changed_by VARCHAR(100),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Users table for authentication
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) DEFAULT 'clinician', -- admin, clinician, viewer
    department VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_patients_patient_id ON patients(patient_id);
CREATE INDEX idx_patients_name ON patients(last_name, first_name);
CREATE INDEX idx_patients_dob ON patients(date_of_birth);

CREATE INDEX idx_visits_patient_id ON patient_visits(patient_id);
CREATE INDEX idx_visits_admission_date ON patient_visits(admission_date);
CREATE INDEX idx_visits_visit_number ON patient_visits(visit_number);

CREATE INDEX idx_allergies_patient_id ON patient_allergies(patient_id);
CREATE INDEX idx_allergies_status ON patient_allergies(status);

CREATE INDEX idx_medications_patient_id ON patient_medications(patient_id);
CREATE INDEX idx_medications_status ON patient_medications(status);

CREATE INDEX idx_hl7_messages_patient_id ON hl7_messages(patient_id);
CREATE INDEX idx_hl7_messages_type ON hl7_messages(message_type);
CREATE INDEX idx_hl7_messages_received_at ON hl7_messages(received_at);

CREATE INDEX idx_audit_log_table_record ON audit_log(table_name, record_id);
CREATE INDEX idx_audit_log_changed_at ON audit_log(changed_at);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);

-- Create update trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patient_visits_updated_at BEFORE UPDATE ON patient_visits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patient_allergies_updated_at BEFORE UPDATE ON patient_allergies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patient_medications_updated_at BEFORE UPDATE ON patient_medications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing
INSERT INTO patients (patient_id, first_name, last_name, date_of_birth, gender, phone_mobile, email) VALUES
('PAT001', 'John', 'Doe', '1980-05-15', 'M', '555-0123', 'john.doe@email.com'),
('PAT002', 'Jane', 'Smith', '1975-09-22', 'F', '555-0456', 'jane.smith@email.com'),
('PAT003', 'Robert', 'Johnson', '1990-12-03', 'M', '555-0789', 'robert.johnson@email.com');

-- Grant all privileges to hl7user
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO hl7user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO hl7user;