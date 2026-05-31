-- Drop existing patients table and related tables to rebuild with new schema
DROP TABLE IF EXISTS bills CASCADE;
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS tests CASCADE;
DROP TABLE IF EXISTS patients CASCADE;

-- Create patients table with new schema
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  age INTEGER NOT NULL,
  gender VARCHAR(50) NOT NULL,
  mobile VARCHAR(20) NOT NULL UNIQUE,
  address TEXT NOT NULL,
  test_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create tests table (linked to patients)
CREATE TABLE tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  test_name VARCHAR(255) NOT NULL,
  test_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  results TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create reports table
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  test_id UUID REFERENCES tests(id) ON DELETE SET NULL,
  report_data TEXT NOT NULL,
  report_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create bills table
CREATE TABLE bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  test_id UUID REFERENCES tests(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  bill_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  payment_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_patients_patient_id ON patients(patient_id);
CREATE INDEX idx_patients_mobile ON patients(mobile);
CREATE INDEX idx_patients_created_at ON patients(created_at DESC);
CREATE INDEX idx_patients_name ON patients(name);
CREATE INDEX idx_tests_patient_id ON tests(patient_id);
CREATE INDEX idx_tests_test_date ON tests(test_date DESC);
CREATE INDEX idx_reports_patient_id ON reports(patient_id);
CREATE INDEX idx_reports_test_id ON reports(test_id);
CREATE INDEX idx_bills_patient_id ON bills(patient_id);
CREATE INDEX idx_bills_status ON bills(status);

-- Enable Row Level Security
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (remove these when adding authentication)
CREATE POLICY patients_public_policy ON patients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY tests_public_policy ON tests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY reports_public_policy ON reports FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY bills_public_policy ON bills FOR ALL USING (true) WITH CHECK (true);
