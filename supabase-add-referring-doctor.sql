-- Update Patients Table Schema
-- Add referring_doctor column if it doesn't exist
-- This migration adds support for tracking referring doctors for each patient

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
