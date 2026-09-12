-- Run this once on the Railway MySQL/MariaDB database.
-- Safe for the current courses table because the new columns are nullable/defaulted.

ALTER TABLE courses
  ADD COLUMN duration VARCHAR(50) NULL AFTER level,
  ADD COLUMN estimated_hours DECIMAL(6,2) NOT NULL DEFAULT 0.00 AFTER duration;

-- Optional: verify the new columns.
DESCRIBE courses;
