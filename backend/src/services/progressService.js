const pool = require('../config/database');

/**
 * Recalculates student progress percentage for a course and updates the enrollment record.
 */
async function recalculateProgress(userId, courseId) {
  // 1. Total lessons count for the course
  const [totalRes] = await pool.query(
    `SELECT COUNT(*) as total FROM lessons l JOIN course_sections cs ON l.section_id=cs.id WHERE cs.course_id = ?`,
    [courseId]
  );
  const totalLessons = totalRes[0].total || 0;

  if (totalLessons === 0) {
    return { progressPercentage: 0, completedCount: 0, totalLessons: 0 };
  }

  // 2. Count distinct completed lessons for this student
  const [completedRes] = await pool.query(
    `SELECT COUNT(DISTINCT lesson_id) as completed 
     FROM lesson_progress 
     WHERE user_id = ? AND course_id = ? AND is_completed = 1`,
    [userId, courseId]
  );
  const completedCount = completedRes[0].completed || 0;

  // 3. Compute percentage
  const percentage = Math.min(
    100,
    parseFloat(((completedCount / totalLessons) * 100).toFixed(2))
  );

  const status = percentage >= 100 ? 'completed' : 'active';

  // 4. Update the enrollment table
  await pool.query(
    `UPDATE enrollments 
     SET progress_percentage = ?, 
         completed_lessons_count = ?, 
         total_lessons_count = ?, 
         status = ?, 
         last_accessed_at = NOW() 
     WHERE user_id = ? AND course_id = ?`,
    [percentage, completedCount, totalLessons, status, userId, courseId]
  );

  return {
    progressPercentage: percentage,
    completedCount,
    totalLessons,
    status
  };
}

module.exports = { recalculateProgress };