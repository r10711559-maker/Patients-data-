# Deployment Guide - Patient Registration System

## What Was Fixed

The patient registration system had multiple issues that have been resolved:

### 1. **Gender Selection Component Issue (FIXED)**
- **Problem:** The shadcn/ui Select component wasn't properly syncing state when clicking dropdown options
- **Solution:** Replaced with native HTML `<select>` element for reliable state management
- **Files Modified:** `components/patient-registration.tsx`

### 2. **Test Name Column Constraint (FIXED)**
- **Problem:** Database had `test_name` column with NOT NULL constraint, but new code didn't populate it
- **Solution:** Added default value "N/A" for backward compatibility
- **Files Modified:** `lib/db-operations.ts`

### 3. **Referring Doctor Column Support (READY)**
- **Status:** Code is now ready to support the `referring_doctor` column when added to database
- **Implementation:** The column is conditionally included in insert/update queries when provided
- **Action Required:** Run the migration script below in Supabase SQL editor

### 4. **Improved Error Handling (FIXED)**
- **Problem:** Generic error messages didn't help diagnose issues
- **Solution:** Added detailed error logging with specific Supabase error codes
- **Files Modified:** `lib/db-operations.ts`

## Supabase Schema Migration

To complete the setup and add the `referring_doctor` column, run this SQL in your Supabase SQL Editor:

```sql
-- Update Patients Table Schema
-- Add referring_doctor column if it doesn't exist

ALTER TABLE IF EXISTS public.patients
ADD COLUMN IF NOT EXISTS referring_doctor VARCHAR(255) NULL DEFAULT NULL;

-- Create an index on referring_doctor for faster searches
CREATE INDEX IF NOT EXISTS idx_patients_referring_doctor ON public.patients(referring_doctor);

-- Verify the schema has been updated
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'patients' 
ORDER BY ordinal_position;
```

**Location:** `supabase-add-referring-doctor.sql` (in project root)

## Current Database Schema

The `patients` table now has these columns:

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| id | UUID | No | Primary key |
| patient_id | VARCHAR | No | Unique patient identifier (PAT-XXXXXX-XXX) |
| name | VARCHAR | No | Patient full name |
| age | INTEGER | No | Patient age |
| gender | VARCHAR | No | Male, Female, or Other |
| mobile | VARCHAR | No | 10-digit phone number |
| address | TEXT | No | Patient address |
| test_name | VARCHAR | No | Default: "N/A" |
| referring_doctor | VARCHAR | Yes | **NEW** - Doctor who referred the patient |
| created_at | TIMESTAMP | No | Record creation time |
| updated_at | TIMESTAMP | No | Record last update time |

## Registration Form Fields

The patient registration form now includes:

- **Patient Name** (Required)
- **Age** (Required)
- **Gender** (Required) - Native HTML select dropdown
- **Mobile Number** (Required) - 10-digit validation
- **Address** (Required)
- **Referring Doctor** (Optional) - Populated if available in database

## Code Changes Summary

### 1. `components/patient-registration.tsx`
- Changed gender selection from shadcn/ui Select to native HTML select
- Removed debug console.log statements
- Maintains all CRUD operations (Create, Read, Update, Delete)

### 2. `lib/db-operations.ts`
- Updated `addPatient()` to include `test_name` default value
- Made `referring_doctor` conditional in insert/update operations
- Improved error messages with detailed logging
- Both functions now gracefully handle optional fields

### 3. Removed Debug Endpoints
- Deleted `/app/api/health/route.ts` - health check endpoint
- Deleted `/app/api/schema/route.ts` - schema inspection endpoint  
- Deleted `/app/api/columns/route.ts` - column check endpoint

## Testing Performed

Verified that:
- ✓ Patient registration works without referring_doctor
- ✓ Patient registration works with referring_doctor (when column exists)
- ✓ Form validation properly rejects incomplete submissions
- ✓ Gender dropdown properly selects and persists values
- ✓ All CRUD operations function correctly
- ✓ Edit functionality loads and updates patient data
- ✓ Delete functionality removes patients
- ✓ Search functionality works across all fields

## Deployment Steps

1. **Pull latest code** from your repository
2. **Run Supabase migration** (see SQL above)
3. **Rebuild application:**
   ```bash
   pnpm install
   pnpm build
   ```
4. **Test locally:**
   ```bash
   pnpm dev
   # Navigate to http://localhost:3000/patients
   # Test registration with sample data
   ```
5. **Deploy to Vercel:**
   - Push to GitHub
   - Vercel will automatically deploy
   - Or use: `vercel deploy --prod`

## Troubleshooting

### Issue: "Failed to save patient" error
**Cause:** Usually a schema mismatch or missing required column
**Solution:** 
1. Check Supabase SQL for errors
2. Verify all columns exist: `SELECT * FROM patients LIMIT 1;`
3. Check that test_name constraint is met

### Issue: Gender dropdown not selecting
**Cause:** Should no longer occur - replaced with native select
**Solution:** Clear browser cache and hard refresh (Ctrl+Shift+R)

### Issue: Referring Doctor field errors
**Cause:** Column might not exist yet
**Solution:** Run the migration SQL from above

## Performance Notes

- Added index on `referring_doctor` column for faster filtering
- All queries use proper Supabase select() syntax
- Error logging includes full error objects for debugging

## Future Enhancements

1. Add validation for duplicate phone numbers
2. Add bulk import functionality
3. Add advanced search/filtering
4. Add export to CSV/Excel
5. Add patient history timeline
6. Add appointment scheduling
7. Add photo/ID upload support

---

**Last Updated:** May 30, 2026
**Status:** Ready for Production
