-- Sri Sai Aarav Diagnostics Management System
-- Complete Database Schema Migration
-- Created: May 30, 2024

-- Drop existing tables if they exist (for fresh setup)
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS bill_items CASCADE;
DROP TABLE IF EXISTS bills CASCADE;
DROP TABLE IF EXISTS tests CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================================================
-- 1. USERS TABLE - For staff/admin access
-- ============================================================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'staff', 'doctor')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 2. PATIENTS TABLE - Main patient records
-- ============================================================================
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  age INTEGER NOT NULL,
  gender VARCHAR(50) NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
  mobile VARCHAR(20) NOT NULL UNIQUE,
  address TEXT NOT NULL,
  referring_doctor VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 3. TESTS TABLE - Available diagnostic tests
-- ============================================================================
CREATE TABLE tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  category VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  sample_type VARCHAR(100),
  turnaround_time VARCHAR(100),
  is_default BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 4. BILLS TABLE - Patient billing records
-- ============================================================================
CREATE TABLE bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_number VARCHAR(50) UNIQUE NOT NULL,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
  discount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  payment_method VARCHAR(100),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 5. BILL_ITEMS TABLE - Tests associated with each bill
-- ============================================================================
CREATE TABLE bill_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id UUID NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
  test_id UUID NOT NULL REFERENCES tests(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL DEFAULT 1,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 6. REPORTS TABLE - Lab reports for patients
-- ============================================================================
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_number VARCHAR(50) UNIQUE NOT NULL,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  bill_id UUID REFERENCES bills(id) ON DELETE SET NULL,
  pdf_url TEXT,
  pdf_filename VARCHAR(255),
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'reviewed')),
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES - For performance optimization
-- ============================================================================
CREATE INDEX idx_patients_patient_id ON patients(patient_id);
CREATE INDEX idx_patients_mobile ON patients(mobile);
CREATE INDEX idx_patients_created_at ON patients(created_at DESC);
CREATE INDEX idx_patients_name ON patients(name);

CREATE INDEX idx_tests_name ON tests(name);
CREATE INDEX idx_tests_category ON tests(category);
CREATE INDEX idx_tests_is_default ON tests(is_default);

CREATE INDEX idx_bills_patient_id ON bills(patient_id);
CREATE INDEX idx_bills_status ON bills(status);
CREATE INDEX idx_bills_created_at ON bills(created_at DESC);
CREATE INDEX idx_bills_bill_number ON bills(bill_number);

CREATE INDEX idx_bill_items_bill_id ON bill_items(bill_id);
CREATE INDEX idx_bill_items_test_id ON bill_items(test_id);

CREATE INDEX idx_reports_patient_id ON reports(patient_id);
CREATE INDEX idx_reports_bill_id ON reports(bill_id);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY - Enable RLS on all tables
-- ============================================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE bill_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES - Allow public access (configure later for auth)
-- ============================================================================
CREATE POLICY users_public_policy ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY patients_public_policy ON patients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY tests_public_policy ON tests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY bills_public_policy ON bills FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY bill_items_public_policy ON bill_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY reports_public_policy ON reports FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- DEFAULT TEST DATA - Pre-populated tests
-- ============================================================================
INSERT INTO tests (name, category, price, sample_type, turnaround_time, is_default) VALUES
('CBC', 'Hematology', 300, 'Blood', '24 hours', true),
('ESR', 'Hematology', 150, 'Blood', '24 hours', true),
('RBS', 'Biochemistry', 100, 'Blood', '24 hours', true),
('FBS', 'Biochemistry', 120, 'Blood', '24 hours', true),
('PPBS', 'Biochemistry', 120, 'Blood', '24 hours', true),
('HbA1c', 'Biochemistry', 250, 'Blood', '24 hours', true),
('LFT', 'Biochemistry', 400, 'Blood', '24 hours', true),
('KFT', 'Biochemistry', 350, 'Blood', '24 hours', true),
('Lipid Profile', 'Biochemistry', 500, 'Blood', '24 hours', true),
('Thyroid Profile', 'Immunology', 800, 'Blood', '48 hours', true),
('Vitamin D', 'Immunology', 600, 'Blood', '48 hours', true),
('Vitamin B12', 'Immunology', 600, 'Blood', '48 hours', true),
('Urine Routine', 'Urinalysis', 150, 'Urine', '24 hours', true),
('Pregnancy Test', 'Immunology', 200, 'Urine/Blood', '24 hours', true);
