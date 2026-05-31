# Database Schema Reference

## Overview

The Sri Sai Diagnostics system uses 4 main tables in PostgreSQL (via Supabase):

- **patients** - Patient information and demographics
- **tests** - Medical test records
- **reports** - Medical report data
- **bills** - Billing and payment tracking

---

## Table Definitions

### 1. PATIENTS Table

Stores patient information and demographics.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique patient identifier |
| `name` | VARCHAR(255) | NOT NULL | Patient's full name |
| `age` | INTEGER | NOT NULL | Patient's age |
| `gender` | VARCHAR(50) | NOT NULL | Gender (Male/Female/Other) |
| `mobile` | VARCHAR(20) | NOT NULL | Mobile phone number |
| `address` | TEXT | NOT NULL | Patient's address |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation date |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Last update date |

**Indexes:**
- `idx_patients_mobile` - On mobile number for search
- `idx_patients_created_at` - On created_at DESC for sorting

**Example Data:**
```
id: 550e8400-e29b-41d4-a716-446655440000
name: Rajesh Kumar
age: 45
gender: Male
mobile: 9876543210
address: 123 Main Street, Sangareddy
created_at: 2024-05-30 10:00:00
updated_at: 2024-05-30 10:00:00
```

---

### 2. TESTS Table

Records medical tests performed on patients.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique test identifier |
| `patient_id` | UUID | NOT NULL, FOREIGN KEY → patients(id) | Reference to patient |
| `test_name` | VARCHAR(255) | NOT NULL | Type of test (CBC, Sugar, Thyroid, etc.) |
| `test_date` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Date test was performed |
| `results` | TEXT | NULL | Test results/findings |
| `notes` | TEXT | NULL | Additional notes |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation date |

**Indexes:**
- `idx_tests_patient_id` - For filtering by patient
- `idx_tests_test_date` - For sorting by date

**Example Data:**
```
id: 660e8400-e29b-41d4-a716-446655440001
patient_id: 550e8400-e29b-41d4-a716-446655440000
test_name: CBC
test_date: 2024-05-30 11:00:00
results: White Blood Cells: 7.5, Red Blood Cells: 4.8
notes: Normal range
created_at: 2024-05-30 11:15:00
```

---

### 3. REPORTS Table

Stores medical reports and test documentation.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique report identifier |
| `patient_id` | UUID | NOT NULL, FOREIGN KEY → patients(id) | Reference to patient |
| `test_id` | UUID | NULL, FOREIGN KEY → tests(id) | Reference to specific test |
| `report_data` | TEXT | NOT NULL | Report content/data |
| `report_date` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Date report was generated |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation date |

**Indexes:**
- `idx_reports_patient_id` - For filtering by patient
- `idx_reports_test_id` - For filtering by test

**Example Data:**
```
id: 770e8400-e29b-41d4-a716-446655440002
patient_id: 550e8400-e29b-41d4-a716-446655440000
test_id: 660e8400-e29b-41d4-a716-446655440001
report_data: CBC Report - All values within normal range
report_date: 2024-05-30 12:00:00
created_at: 2024-05-30 12:05:00
```

---

### 4. BILLS Table

Manages billing and payment records for services.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique bill identifier |
| `patient_id` | UUID | NOT NULL, FOREIGN KEY → patients(id) | Reference to patient |
| `test_id` | UUID | NULL, FOREIGN KEY → tests(id) | Reference to specific test |
| `amount` | DECIMAL(10, 2) | NOT NULL | Bill amount in currency |
| `status` | VARCHAR(50) | DEFAULT 'pending', CHECK IN ('pending', 'paid', 'cancelled') | Payment status |
| `bill_date` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Date bill was created |
| `payment_date` | TIMESTAMP | NULL | Date payment was received |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation date |

**Indexes:**
- `idx_bills_patient_id` - For filtering by patient
- `idx_bills_status` - For filtering by status

**Status Values:**
- `pending` - Bill awaiting payment
- `paid` - Bill has been paid
- `cancelled` - Bill has been cancelled

**Example Data:**
```
id: 880e8400-e29b-41d4-a716-446655440003
patient_id: 550e8400-e29b-41d4-a716-446655440000
test_id: 660e8400-e29b-41d4-a716-446655440001
amount: 500.00
status: pending
bill_date: 2024-05-30 10:00:00
payment_date: NULL
created_at: 2024-05-30 10:05:00
```

---

## Relationships & Constraints

### Foreign Key Relationships

```
patients (1) ← → (Many) tests
   ↓
patients.id → tests.patient_id
   (ON DELETE CASCADE)

patients (1) ← → (Many) reports
   ↓
patients.id → reports.patient_id
   (ON DELETE CASCADE)

tests (1) ← → (Many) reports
   ↓
tests.id → reports.test_id
   (ON DELETE SET NULL)

patients (1) ← → (Many) bills
   ↓
patients.id → bills.patient_id
   (ON DELETE CASCADE)

tests (1) ← → (Many) bills
   ↓
tests.id → bills.test_id
   (ON DELETE SET NULL)
```

### Cascade Rules

- **ON DELETE CASCADE**: Deleting a patient automatically deletes all their tests and bills
- **ON DELETE SET NULL**: Deleting a test sets the test_id to NULL in reports and bills (keeps billing history)

---

## Row Level Security (RLS) Policies

Each table has RLS enabled with public access policies:

```sql
-- Patients table
CREATE POLICY patients_public ON patients
  FOR ALL USING (true) WITH CHECK (true);

-- Tests table
CREATE POLICY tests_public ON tests
  FOR ALL USING (true) WITH CHECK (true);

-- Reports table
CREATE POLICY reports_public ON reports
  FOR ALL USING (true) WITH CHECK (true);

-- Bills table
CREATE POLICY bills_public ON bills
  FOR ALL USING (true) WITH CHECK (true);
```

**For Production**: Replace with authentication-based policies:

```sql
CREATE POLICY authenticated_access ON patients
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
```

---

## Queries & Examples

### Get All Patients
```sql
SELECT * FROM patients 
ORDER BY created_at DESC;
```

### Search Patient by Name
```sql
SELECT * FROM patients 
WHERE name ILIKE '%search_term%'
ORDER BY created_at DESC;
```

### Get Patient with Tests
```sql
SELECT p.*, t.test_name, t.test_date
FROM patients p
LEFT JOIN tests t ON p.id = t.patient_id
WHERE p.id = 'patient_id'
ORDER BY t.test_date DESC;
```

### Get Patient with Reports
```sql
SELECT p.*, r.report_data, r.report_date
FROM patients p
LEFT JOIN reports r ON p.id = r.patient_id
WHERE p.id = 'patient_id'
ORDER BY r.report_date DESC;
```

### Get Patient Bills Summary
```sql
SELECT 
  p.name,
  COUNT(b.id) as total_bills,
  SUM(CASE WHEN b.status = 'paid' THEN b.amount ELSE 0 END) as paid_amount,
  SUM(CASE WHEN b.status = 'pending' THEN b.amount ELSE 0 END) as pending_amount
FROM patients p
LEFT JOIN bills b ON p.id = b.patient_id
WHERE p.id = 'patient_id'
GROUP BY p.id, p.name;
```

### Get All Pending Bills
```sql
SELECT * FROM bills 
WHERE status = 'pending'
ORDER BY bill_date DESC;
```

### Mark Bill as Paid
```sql
UPDATE bills
SET status = 'paid', payment_date = CURRENT_TIMESTAMP
WHERE id = 'bill_id';
```

---

## Performance Considerations

### Indexes Created
- `patients.mobile` - Fast patient lookup by phone
- `patients.created_at` - Efficient date-based sorting
- `tests.patient_id` - Quick filtering of tests by patient
- `tests.test_date` - Sort tests chronologically
- `reports.patient_id` - Filter reports by patient
- `reports.test_id` - Link reports to tests
- `bills.patient_id` - Filter bills by patient
- `bills.status` - Quick status-based queries

### Query Optimization Tips
1. Always filter by `patient_id` when querying tests, reports, or bills
2. Use the `created_at` and `test_date` indexes for time-based queries
3. Avoid SELECT * without WHERE clauses on large tables
4. Use LIMIT when fetching lists to paginate results

---

## Backup & Maintenance

### Regular Tasks
- **Daily**: Monitor pending bills
- **Weekly**: Back up database
- **Monthly**: Archive old records
- **Quarterly**: Review and optimize queries

### Backup Command (Supabase CLI)
```bash
supabase db dump --local > backup.sql
```

### Restore Command
```bash
psql < backup.sql
```

---

## Migration Path

### Adding New Columns
```sql
ALTER TABLE patients ADD COLUMN email VARCHAR(255);
ALTER TABLE patients ADD COLUMN phone_alternate VARCHAR(20);
```

### Adding New Tables
```sql
CREATE TABLE prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  medication VARCHAR(255) NOT NULL,
  dosage VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Data Validation Rules

### Patients Table
- `name`: Not empty, max 255 characters
- `age`: Integer between 0 and 150
- `gender`: Must be 'Male', 'Female', or 'Other'
- `mobile`: Not empty, typically 10 digits
- `address`: Not empty, max 1000 characters

### Bills Table
- `amount`: Must be greater than 0
- `status`: Must be one of: 'pending', 'paid', 'cancelled'
- `payment_date`: Only set when status = 'paid'

---

*Database Schema Version: 1.0*
*Last Updated: 2024-05-30*
