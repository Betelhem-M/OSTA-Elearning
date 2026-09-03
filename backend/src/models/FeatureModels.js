const pool = require("../config/database");

const Bookmark = {
  async list(userId, { type = null, q = null } = {}) {
    const [rows] = await pool.execute(
      `SELECT id, user_id, content_type, content_id, created_at
       FROM bookmarks WHERE user_id = ?
       ${type ? "AND content_type = ?" : ""}
       ORDER BY created_at DESC, id DESC`,
      type ? [userId, type] : [userId]
    );
    if (!rows.length) return [];
    const byType = new Map();
    for (const row of rows) {
      if (!byType.has(row.content_type)) byType.set(row.content_type, []);
      byType.get(row.content_type).push(row.content_id);
    }
    const result=[];
    for (const [contentType, ids] of byType) {
      if (!['course','event','book','resource'].includes(contentType)) continue;
      const placeholders=ids.map(()=>'?').join(',');
      let sql;
      if (contentType==='course') sql=`SELECT id,title,description,category_id,price FROM courses WHERE id IN (${placeholders})`;
      else if (contentType==='event') sql=`SELECT id,title,description,category,event_date,start_time,location_or_link AS location FROM events WHERE id IN (${placeholders})`;
      else sql=`SELECT id,title,description,category,file_url,download_allowed FROM learning_resources WHERE id IN (${placeholders})`;
      try {
        const [items]=await pool.execute(sql, ids);
        for (const item of items) {
          const mark=rows.find(x=>x.content_type===contentType && Number(x.content_id)===Number(item.id));
          result.push({...item, bookmark_id:mark?.id, content_type:contentType, bookmarked_at:mark?.created_at});
        }
      } catch (e) { if (!/learning_resources/.test(e.message)) throw e; }
    }
    if (q) {
      const needle=String(q).toLowerCase();
      return result.filter(x=>`${x.title||''} ${x.description||''}`.toLowerCase().includes(needle));
    }
    return result;
  },
  async add(userId, contentType, contentId) {
    const [result]=await pool.execute(`INSERT INTO bookmarks (user_id,content_type,content_id) VALUES (?,?,?)`,[userId,contentType,contentId]);
    return result.insertId;
  },
  async remove(userId, contentType, contentId) {
    const [result]=await pool.execute(`DELETE FROM bookmarks WHERE user_id=? AND content_type=? AND content_id=?`,[userId,contentType,contentId]);
    return result.affectedRows>0;
  },
  async exists(userId, contentType, contentId) {
    const [[row]]=await pool.execute(`SELECT id FROM bookmarks WHERE user_id=? AND content_type=? AND content_id=? LIMIT 1`,[userId,contentType,contentId]);
    return Boolean(row);
  }
};

const PrivateQuestion = {
  async listForStudent(userId) {
    const [rows]=await pool.execute(`SELECT q.*, CONCAT(i.first_name,' ',i.last_name) instructor_name, c.title course_title FROM student_questions q JOIN users i ON q.instructor_id=i.id JOIN courses c ON q.course_id=c.id WHERE q.student_id=? ORDER BY q.created_at DESC`,[userId]);
    for (const q of rows) { const [replies]=await pool.execute(`SELECT r.*, CONCAT(u.first_name,' ',u.last_name) author_name FROM student_question_replies r JOIN users u ON r.user_id=u.id WHERE r.question_id=? ORDER BY r.created_at ASC`,[q.id]); q.replies=replies; }
    return rows;
  },
  async listForInstructor(userId) {
    const [rows]=await pool.execute(`SELECT q.*, CONCAT(s.first_name,' ',s.last_name) student_name, s.email student_email, c.title course_title FROM student_questions q JOIN users s ON q.student_id=s.id JOIN courses c ON q.course_id=c.id WHERE q.instructor_id=? ORDER BY q.created_at DESC`,[userId]);
    for (const q of rows) { const [replies]=await pool.execute(`SELECT r.*, CONCAT(u.first_name,' ',u.last_name) author_name FROM student_question_replies r JOIN users u ON r.user_id=u.id WHERE r.question_id=? ORDER BY r.created_at ASC`,[q.id]); q.replies=replies; }
    return rows;
  },
  async create({studentId, courseId, body}) {
    const [[course]]=await pool.execute(`SELECT instructor_id,title FROM courses WHERE id=? LIMIT 1`,[courseId]);
    if (!course?.instructor_id) return null;
    const [result]=await pool.execute(`INSERT INTO student_questions (course_id,student_id,instructor_id,body) VALUES (?,?,?,?)`,[courseId,studentId,course.instructor_id,body]);
    return {id:result.insertId,instructorId:course.instructor_id,courseTitle:course.title};
  },
  async getAuthorized(id,userId,role) {
    const [rows]=await pool.execute(`SELECT * FROM student_questions WHERE id=? AND (student_id=? OR instructor_id=?) LIMIT 1`,[id,userId,userId]);
    return rows[0]||null;
  },
  async reply(questionId,userId,body) {
    const q=await this.getAuthorized(questionId,userId,''); if (!q) return null;
    const [result]=await pool.execute(`INSERT INTO student_question_replies (question_id,user_id,body) VALUES (?,?,?)`,[questionId,userId,body]);
    return result.insertId;
  }
};

module.exports={Bookmark,PrivateQuestion};
