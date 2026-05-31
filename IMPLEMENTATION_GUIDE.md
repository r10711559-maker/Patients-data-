# Sri Sai Diagnostics - Patient Management System
## Complete Setup & Implementation Guide

Your patient management system is now ready! Follow these steps to complete the setup.

---

## 📋 What Was Built

A full-stack patient registration and management system with the following features:

✅ **Patient Management**
- Register new patients with complete information
- Search patients by name or patient ID
- Edit and update patient records
- View patient details

✅ **Database Integration**
- Supabase PostgreSQL backend
- Automatic patient ID generation
- Patient search functionality
- Secure data storage

✅ **Billing System**
- Automatic bill creation on patient registration
- Bill status tracking (pending, paid, cancelled)
- Payment date recording

✅ **Test & Report System**
- Store test information for each patient
- Save medical reports
- Link reports to specific tests

✅ **Modern UI**
- Responsive design (mobile & desktop)
- Clean, professional interface
- Real-time form validation
- Toast notifications for user feedback

---

## 🚀 Quick Setup (3 Steps)

### Step 1: Set Up Supabase Tables

Your Supabase integration is already connected with all required environment variables.

**Option A: Using SQL in Supabase Dashboard** (Recommended)

1. Open your Supabase project dashboard
2. Click on "SQL Editor"
3. Click "New Query"
4. Copy all the SQL from below and paste it
5. Click "Run"

**Option B: Import the Migration File**

If your Supabase CLI is set up:
```bash
supabase db push
```

---

## 📋 Database Setup SQL

Copy and execute this SQL in your Supabase SQL Editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

-- Create indexes for performance
CREATE INDEX idx_patients_mobile ON patients(mobile);
CREATE INDEX idx_patients_created_at ON patients(created_at DESC);
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

-- Create public access policies (remove for production with authentication)
CREATE POLICY patients_public ON patients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY tests_public ON tests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY reports_public ON reports FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY bills_public ON bills FOR ALL USING (true) WITH CHECK (true);
```

### Step 2: Verify Environment Variables

Check that these environment variables are set (they should be automatically set by v0):

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Step 3: Test the App

1. The dev server is already running on `http://localhost:3000`
2. Fill out the patient registration form
3. Submit to add a patient
4. See the patient appear in the "Patient Records" list
5. Use the search box to find patients by name or ID
6. Click "Edit" to update patient information

---

## 🎯 Using the Application

### Register a Patient

1. **Fill in the form** on the left side:
   - Patient Name
   - Age
   - Gender
   - Mobile Number
   - Test Name (e.g., "CBC", "Sugar Test", "Thyroid")
   - Address

2. **Click "Register Patient"**
   - Patient is added to database
   - A bill is automatically created
   - Success notification appears
   - Form clears for next patient

### Search Patients

1. Click the search box in "Patient Records"
2. Type patient **name** or **patient ID**
3. Results update in real-time
4. Click "Clear" or delete search text to see all patients

### Edit a Patient

1. Find the patient in the Patient Records list
2. Click the "Edit" button
3. Form changes to show patient's current data
4. Modify any information
5. Click "Update Patient" to save changes
6. Click "Cancel" to discard changes

### View Patient Details

- Each patient card shows:
  - Patient ID
  - Name
  - Age
  - Gender
  - Mobile
  - Address
  - Registration date

---

## 🔧 Technical Architecture

### Frontend Stack
- **Framework**: Next.js 16 with React 19
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Notifications**: Sonner
- **State Management**: React hooks + SWR patterns

### Backend Stack
- **Database**: Supabase (PostgreSQL)
- **Auth**: Public access (configurable)
- **API**: Supabase REST API via client library
- **Type Safety**: TypeScript

### File Structure
```
/app
  - page.tsx                    (Main patient registration page)
  - layout.tsx                  (Root layout)
  - globals.css                 (Global styles)

/lib
  - supabase-client.ts          (Supabase client initialization)
  - db-operations.ts            (Database functions)
  - utils.ts                    (Utility functions)

/components
  - ui/                         (shadcn UI components)

supabase-migration.sql          (Database schema)
SETUP.md                        (Setup instructions)
```

---

## 📦 Key Database Functions

All functions are in `/lib/db-operations.ts`:

### Patient Operations
```typescript
addPatient(patientData)              // Add new patient
getPatients()                        // Get all patients
searchPatients(searchTerm)           // Search by name/ID
getPatientById(patientId)            // Get specific patient
updatePatient(patientId, data)       // Update patient
deletePatient(patientId)             // Delete patient
```

### Test Operations
```typescript
addTest(testData)                    // Add test record
getPatientTests(patientId)           // Get patient's tests
```

### Report Operations
```typescript
addReport(reportData)                // Add report
getPatientReports(patientId)         // Get patient's reports
```

### Billing Operations
```typescript
addBill(billData)                    // Create bill
getPatientBills(patientId)           // Get patient's bills
updateBillStatus(billId, status)     // Update bill status
```

---

## 🔐 Security Considerations

### Current Setup (Development)
- Row Level Security (RLS) is enabled
- Public policies allow all operations (suitable for development)

### For Production
1. **Implement Authentication**
   - Add user authentication (email/password, OAuth, etc.)
   - Use Better Auth or similar solution

2. **Update RLS Policies**
   ```sql
   -- Example: Only authenticated users can access their own data
   CREATE POLICY patient_access ON patients
     FOR ALL
     USING (auth.uid() = user_id)
     WITH CHECK (auth.uid() = user_id);
   ```

3. **Add Authorization**
   - Role-based access (admin, staff, doctor)
   - Restrict operations by role

4. **Data Validation**
   - Server-side input validation
   - SQL injection prevention (already handled by Supabase)
   - Rate limiting

---

## 🚀 Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import the GitHub repository
4. Vercel automatically detects Next.js
5. Set environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Deploy!

### Deploy with Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN pnpm install
RUN pnpm build
CMD ["pnpm", "start"]
```

---

## 📊 Future Enhancements

Potential features to add:

1. **User Authentication**
   - Login/signup system
   - Role-based access control
   - Multi-clinic support

2. **Advanced Features**
   - Appointment scheduling
   - Prescription management
   - SMS/Email notifications
   - PDF report generation
   - Analytics dashboard

3. **Payments Integration**
   - Online payment processing (Stripe)
   - Bill payment tracking
   - Invoice generation

4. **Mobile App**
   - React Native mobile version
   - Offline support
   - Push notifications

---

## 🆘 Troubleshooting

### App shows "Loading patients..." but doesn't load

**Problem**: Supabase database tables not created

**Solution**: Execute the SQL from Step 1 in your Supabase SQL Editor

### "Supabase client not available" error

**Problem**: Environment variables not set

**Solution**: 
1. Check v0 Settings → Vars
2. Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set
3. Restart the dev server

### Can't save/update patient records

**Problem**: Database connection issue or RLS policies blocking access

**Solution**:
1. Check Supabase connection in Settings
2. Verify tables exist in Supabase
3. Check RLS policies are created
4. Look at browser console for error messages

### Search not working

**Problem**: Database indexes not created

**Solution**: Re-run the SQL migration to create indexes

---

## 📞 Support & Documentation

- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **TypeScript Docs**: https://www.typescriptlang.org/docs/
- **Tailwind CSS**: https://tailwindcss.com/docs

---

## ✨ You're All Set!

Your patient management system is ready to use. Start by:

1. Setting up the database tables (copy the SQL above)
2. Register a few test patients
3. Try searching and editing
4. Customize colors and branding as needed

Happy coding! 🎉

---

*Created with v0 and Supabase*
