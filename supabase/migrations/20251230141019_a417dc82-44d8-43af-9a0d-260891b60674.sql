-- Drop old constraint
ALTER TABLE reference_creators DROP CONSTRAINT IF EXISTS reference_creators_priority_check;

-- Add new constraint with both Czech and English values
ALTER TABLE reference_creators ADD CONSTRAINT reference_creators_priority_check 
CHECK (priority IN ('VERY HIGH', 'VELMI VYSOKÁ', 'High', 'Vysoká', 'Medium', 'Střední', 'Low', 'Nízká'));