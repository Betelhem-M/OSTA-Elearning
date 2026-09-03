-- OSTA E-Learning feature additions.
-- Run against the existing OSTA_E_learning database after backing it up.

CREATE TABLE IF NOT EXISTS email_verification_codes (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  code_hash CHAR(64) NOT NULL,
  expires_at DATETIME NOT NULL,
  verified_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_evc_user (user_id), INDEX idx_evc_expiry (expires_at)
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  code_hash CHAR(64) NOT NULL,
  token_hash CHAR(64) NOT NULL,
  expires_at DATETIME NOT NULL,
  used_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_prt_user (user_id), INDEX idx_prt_token (token_hash), INDEX idx_prt_expiry (expires_at)
);

CREATE TABLE IF NOT EXISTS bookmarks (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  content_type VARCHAR(32) NOT NULL,
  content_id BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_bookmark (user_id,content_type,content_id),
  INDEX idx_bookmark_user (user_id)
);

CREATE TABLE IF NOT EXISTS student_questions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  course_id BIGINT UNSIGNED NOT NULL,
  student_id BIGINT UNSIGNED NOT NULL,
  instructor_id BIGINT UNSIGNED NOT NULL,
  body TEXT NOT NULL,
  status ENUM('open','answered','closed') NOT NULL DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_sq_student (student_id), INDEX idx_sq_instructor (instructor_id), INDEX idx_sq_course (course_id)
);

CREATE TABLE IF NOT EXISTS student_question_replies (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  question_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_sqr_question (question_id)
);

CREATE TABLE IF NOT EXISTS notification_links (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  notification_id BIGINT UNSIGNED NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id BIGINT UNSIGNED NOT NULL,
  target_path VARCHAR(500) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_nl_notification (notification_id)
);

-- Add event status only when the existing table does not already have it.
SET @osta_event_status_exists := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME='events' AND COLUMN_NAME='status');
SET @osta_event_status_sql := IF(@osta_event_status_exists=0,'ALTER TABLE events ADD COLUMN status VARCHAR(30) NOT NULL DEFAULT 'draft'','SELECT 1');
PREPARE osta_event_status_stmt FROM @osta_event_status_sql;
EXECUTE osta_event_status_stmt;
DEALLOCATE PREPARE osta_event_status_stmt;
