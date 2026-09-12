-- Course metadata migration
-- Adds the fields used by the instructor course form and public course details.
-- Safe to run more than once on MariaDB because IF NOT EXISTS is used.

ALTER TABLE courses
  ADD COLUMN IF NOT EXISTS language VARCHAR(50) NOT NULL DEFAULT 'English' AFTER level,
  ADD COLUMN IF NOT EXISTS duration VARCHAR(50) NOT NULL DEFAULT 'Self-paced' AFTER language,
  ADD COLUMN IF NOT EXISTS estimated_hours DECIMAL(6,2) NOT NULL DEFAULT 0.00 AFTER duration;

-- Give existing courses sensible metadata so older rows remain valid.
UPDATE courses
SET
  language = CASE
    WHEN language IS NULL OR TRIM(language) = '' THEN 'English'
    ELSE language
  END,
  duration = CASE
    WHEN duration IS NULL OR TRIM(duration) = '' THEN 'Self-paced'
    ELSE duration
  END,
  estimated_hours = CASE
    WHEN estimated_hours IS NULL OR estimated_hours <= 0 THEN 1.00
    ELSE estimated_hours
  END;
