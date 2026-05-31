# Quick Reference Card

## 🚀 Super Quick Start (5 Minutes)

### Step 1: Set Up Database (2 min)
1. Open your Supabase dashboard
2. Click "SQL Editor" → "New Query"
3. Paste the content from `supabase-migration.sql`
4. Click "Run"

### Step 2: Test the App (2 min)
1. Visit `http://localhost:3000`
2. Fill the registration form
3. Click "Register Patient"
4. See the patient in the list!

### Step 3: Try Features (1 min)
- **Search**: Type in the search box
- **Edit**: Click the "Edit" button on a patient
- **View**: Scroll to see all patient details

---

## 📋 File Locations

| File | Purpose |
|------|---------|
| `app/page.tsx` | Main registration & patient list page |
| `lib/supabase-client.ts` | Supabase connection setup |
| `lib/db-operations.ts` | Database query functions |
| `supabase-migration.sql` | Database schema SQL |
| `IMPLEMENTATION_GUIDE.md` | Complete setup instructions |
| `DATABASE_SCHEMA.md` | Table definitions & queries |

---

## 🎯 Main Features

✅ Register patients
✅ View patient list
✅ Search patients (by name or ID)
✅ Edit patient records
✅ Auto-create billing records
✅ Store tests & reports

---

## 🔧 Database Functions

```typescript
// Get all patients
const patients = await getPatients()

// Search patients
const results = await searchPatients("John")

// Add new patient
const newPatient = await addPatient({
  name: "John Doe",
  age: 30,
  gender: "Male",
  mobile: "1234567890",
  address: "123 Main St"
})

// Update patient
await updatePatient(patientId, {
  name: "John Smith"
})

// Create bill
await addBill({
  patient_id: patientId,
  amount: 500,
  status: "pending"
})
```

---

## 🎨 UI Components

### Registration Form
- Patient Name (text)
- Age (number)
- Gender (dropdown)
- Mobile Number (tel)
- Test Name (text)
- Address (textarea)
- Register button

### Patient List
- Search box
- Patient cards with:
  - ID
  - Name
  - Age, Gender, Mobile
  - Address
  - Registration date
  - Edit button

---

## 🔑 Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

Check in v0 Settings → Vars

---

## 📊 Database Tables

| Table | Columns | Purpose |
|-------|---------|---------|
| `patients` | id, name, age, gender, mobile, address, dates | Patient info |
| `tests` | id, patient_id, test_name, results, dates | Medical tests |
| `reports` | id, patient_id, test_id, report_data, dates | Test reports |
| `bills` | id, patient_id, amount, status, payment_date | Billing records |

---

## ⚡ Common Tasks

### Register a Patient
1. Fill form → Click "Register Patient"
2. Bill auto-created
3. Appears in list

### Find a Patient
1. Use search box
2. Type name or ID
3. Results update instantly

### Update Patient Info
1. Click "Edit" button
2. Modify fields
3. Click "Update Patient"

### View Patient Bills
```typescript
const bills = await getPatientBills(patientId)
```

---

## 🆘 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| App won't load | Check Supabase env vars in Settings |
| "Loading patients..." | Create tables with the SQL migration |
| Can't save patient | Verify Supabase connection & RLS policies |
| Search not working | Ensure database indexes exist |

---

## 📞 Need Help?

1. Check `IMPLEMENTATION_GUIDE.md` for detailed instructions
2. See `DATABASE_SCHEMA.md` for table info
3. Review browser console for error messages
4. Visit Supabase docs: https://supabase.com/docs

---

## ✨ Next Steps After Setup

- [ ] Create test patients
- [ ] Test search functionality
- [ ] Test patient editing
- [ ] Add real patient data
- [ ] Customize colors/branding
- [ ] Deploy to production
- [ ] Set up authentication
- [ ] Add more features

---

**Ready to use!** 🎉

Start with: `supabase-migration.sql` → Register patients → Explore!

---

*Quick Reference for Sri Sai Diagnostics*
*Patient Management System - v1.0*
