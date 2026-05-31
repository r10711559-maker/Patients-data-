# Sri Sai Diagnostics - Patient Management System

A modern patient registration and management system for diagnostic clinics, built with Next.js and Supabase.

## Features

✅ **Patient Registration** - Add new patient records with complete information
✅ **Patient Search** - Search patients by name or patient ID
✅ **Edit Patients** - Update existing patient information
✅ **Billing Management** - Automatic bill creation for registered patients
✅ **Test Records** - Store and manage patient test information
✅ **Reports** - Save patient medical reports
✅ **Database Integration** - Full Supabase backend integration

## Database Setup

### Tables Required:

1. **patients** - Stores patient information
2. **tests** - Records patient tests
3. **reports** - Stores patient reports
4. **bills** - Manages patient billing

### Setup Instructions:

#### Option 1: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Open the SQL Editor
3. Copy the contents of `supabase-migration.sql`
4. Paste it into the SQL editor and execute

#### Option 2: Using Supabase CLI

```bash
supabase db push
```

### Manual Setup via SQL:

Execute the following SQL in your Supabase SQL Editor:

```sql
-- Create patients table
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  age INTEGER NOT NULL,
  gender VARCHAR(50) NOT NULL,
  mobile VARCHAR(20) NOT NULL,
  address TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create tests table
CREATE TABLE IF NOT EXISTS tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  test_name VARCHAR(255) NOT NULL,
  test_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  results TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  test_id UUID REFERENCES tests(id) ON DELETE SET NULL,
  report_data TEXT NOT NULL,
  report_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create bills table
CREATE TABLE IF NOT EXISTS bills (
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
CREATE INDEX IF NOT EXISTS idx_patients_mobile ON patients(mobile);
CREATE INDEX IF NOT EXISTS idx_patients_created_at ON patients(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tests_patient_id ON tests(patient_id);
CREATE INDEX IF NOT EXISTS idx_tests_test_date ON tests(test_date DESC);
CREATE INDEX IF NOT EXISTS idx_reports_patient_id ON reports(patient_id);
CREATE INDEX IF NOT EXISTS idx_reports_test_id ON reports(test_id);
CREATE INDEX IF NOT EXISTS idx_bills_patient_id ON bills(patient_id);
CREATE INDEX IF NOT EXISTS idx_bills_status ON bills(status);
```

## Environment Variables

Make sure these environment variables are set in your `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

These are automatically set up by v0 when Supabase integration is connected.

## Features & Functionality

### 1. Patient Registration
- Fill out the registration form with patient details
- System automatically creates a billing record
- Patient ID is auto-generated and stored

### 2. Patient Search
- Search by patient name (case-insensitive)
- Search by patient ID (exact match)
- Real-time search results

### 3. Edit Patient Records
- Click "Edit" button on any patient record
- Modify patient information
- Changes are saved to the database

### 4. Billing System
- Automatic bill creation when patient registers
- Set custom billing amounts
- Track payment status (pending, paid, cancelled)

### 5. Test & Report Management
- Store test information for patients
- Upload medical reports
- Link reports to specific tests

## Tech Stack

- **Frontend**: Next.js 16 with React 19
- **Styling**: Tailwind CSS v4
- **Database**: Supabase (PostgreSQL)
- **Notifications**: Sonner (Toast notifications)
- **Type Safety**: TypeScript

## Getting Started

1. **Install dependencies**:
```bash
pnpm install
```

2. **Set up Supabase database** using the migration file

3. **Configure environment variables**:
   - Ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set

4. **Run development server**:
```bash
pnpm dev
```

5. **Open browser**: Visit `http://localhost:3000`

## API Routes & Database Functions

### Patient Operations
- `addPatient(patientData)` - Add new patient
- `getPatients()` - Fetch all patients
- `searchPatients(searchTerm)` - Search patients by name or ID
- `updatePatient(patientId, patientData)` - Update patient information
- `getPatientById(patientId)` - Get specific patient details

### Test Operations
- `addTest(testData)` - Add test record
- `getPatientTests(patientId)` - Get patient's tests

### Report Operations
- `addReport(reportData)` - Add medical report
- `getPatientReports(patientId)` - Get patient's reports

### Billing Operations
- `addBill(billData)` - Create billing record
- `getPatientBills(patientId)` - Get patient's bills
- `updateBillStatus(billId, status)` - Update bill payment status

## Future Enhancements

- User authentication and authorization
- Appointment scheduling
- Payment gateway integration
- PDF report generation
- Email notifications
- Analytics dashboard
- Multi-clinic support

## Security Considerations

- Enable Row Level Security (RLS) for production
- Implement user authentication
- Add role-based access control
- Validate all inputs on backend
- Use proper error handling

## License

This project is open source and available for use by Sri Sai Diagnostics.

## Support

For issues or questions, please contact the development team.
