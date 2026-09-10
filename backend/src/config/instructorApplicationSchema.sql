-- OSTA instructor application workflow
-- Creates the 40th application table used for admin approval.

CREATE TABLE IF NOT EXISTS instructor_applications (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  professional_title VARCHAR(200) NOT NULL,
  specialization VARCHAR(200) NOT NULL,
  education TEXT NOT NULL,
  experience TEXT NOT NULL,
  skills TEXT NOT NULL,
  teaching_statement TEXT NOT NULL,
  cv_file_path VARCHAR(1000) NOT NULL,
  cv_original_name VARCHAR(255) NOT NULL,
  cv_mime_type VARCHAR(100) DEFAULT NULL,
  cv_file_size BIGINT UNSIGNED NOT NULL DEFAULT 0,
  status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  admin_note TEXT DEFAULT NULL,
  reviewed_by BIGINT UNSIGNED DEFAULT NULL,
  reviewed_at DATETIME DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_instructor_application_user (user_id),
  KEY idx_instructor_app_status (status),
  KEY idx_instructor_app_reviewer (reviewed_by),
  CONSTRAINT fk_instructor_app_user
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_instructor_app_reviewer
    FOREIGN KEY (reviewed_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
