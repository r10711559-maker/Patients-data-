-- Fix Patients Table Schema
-- Add missing referring_doctor column if it doesn't exist
ALTER TABLE patients
ADD COLUMN IF NOT EXISTS referring_doctor VARCHAR(255);

-- The test_name column is no longer used but can be kept for backward compatibility
-- If you want to remove it, uncomment the line below:
-- ALTER TABLE patients DROP COLUMN IF EXISTS test_name;

-- Verify the migration
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'patients' ORDER BY ordinal_position;
