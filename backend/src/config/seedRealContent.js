require("dotenv").config();
const fs = require("fs");
const path = require("path");
const pool = require("./database");

const VIDEO = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";
const BOOK_DIR = path.join(__dirname, "../../../private_books");

async function user(firstName, role) {
  const [rows] = await pool.execute(
    `SELECT id,first_name,last_name,email FROM users
     WHERE LOWER(first_name)=LOWER(?)
       AND (LOWER(role)=LOWER(?) OR LOWER(account_type)=LOWER(?))
     ORDER BY id LIMIT 1`,
    [firstName, role, role]
  );
  if (!rows[0]) throw new Error(`Registered ${role} account for ${firstName} was not found.`);
  return rows[0];
}

async function category(name, description) {
  const [r] = await pool.execute("SELECT id FROM categories WHERE name=? LIMIT 1", [name]);
  if (r[0]) return r[0].id;
  const [x] = await pool.execute("INSERT INTO categories(name,description) VALUES(?,?)", [name, description]);
  return x.insertId;
}

async function course(title, description, instructorId, categoryId, price, level) {
  const [r] = await pool.execute("SELECT id FROM courses WHERE title=? LIMIT 1", [title]);
  if (r[0]) {
    await pool.execute("UPDATE courses SET instructor_id=?,category_id=?,description=?,price=?,level=?,status='published' WHERE id=?", [instructorId, categoryId, description, price, level, r[0].id]);
    return r[0].id;
  }
  const [x] = await pool.execute(
    `INSERT INTO courses(title,description,long_description,instructor_id,category_id,level,price,thumbnail_color,status)
     VALUES(?,?,?,?,?,?,?,?,'published')`,
    [title, description, description, instructorId, categoryId, level, price, price ? "#7C3AED" : "#1D4ED8"]
  );
  return x.insertId;
}

async function section(courseId, title, order) {
  const [r] = await pool.execute("SELECT id FROM course_sections WHERE course_id=? AND title=? LIMIT 1", [courseId, title]);
  if (r[0]) return r[0].id;
  const [x] = await pool.execute("INSERT INTO course_sections(course_id,title,section_order,description) VALUES(?,?,?,?)", [courseId, title, order, "Practical learning section with video lessons and activities."]);
  return x.insertId;
}

async function lesson(courseId, sectionId, title, position, minutes) {
  const [r] = await pool.execute("SELECT id FROM lessons WHERE course_id=? AND title=? LIMIT 1", [courseId, title]);
  if (r[0]) return r[0].id;
  const [x] = await pool.execute(
    `INSERT INTO lessons(course_id,section_id,title,description,content,video_url,duration_minutes,position)
     VALUES(?,?,?,?,?,?,?,?)`,
    [courseId, sectionId, title, `Video lesson: ${title}`, `This lesson explains ${title.toLowerCase()} with practical examples for OSTA learners.`, VIDEO, minutes, position]
  );
  return x.insertId;
}

async function enroll(userId, courseId) {
  await pool.execute("INSERT INTO enrollments(user_id,course_id,status) VALUES(?,?, 'active') ON DUPLICATE KEY UPDATE status='active'", [userId, courseId]);
}

async function resource(title, categoryName, url) {
  const [r] = await pool.execute("SELECT id FROM learning_resources WHERE title=? LIMIT 1", [title]);
  if (!r[0]) await pool.execute("INSERT INTO learning_resources(title,description,category,file_url,download_allowed) VALUES(?,?,?,?,1)", [title, `Learning resource for ${categoryName}.`, categoryName, url]);
}

async function quiz(courseId, lessonId) {
  const title = "Web Development Fundamentals Quiz";
  const [r] = await pool.execute("SELECT id FROM quizzes WHERE course_id=? AND title=? LIMIT 1", [courseId, title]);
  let quizId = r[0]?.id;
  if (!quizId) {
    const [x] = await pool.execute("INSERT INTO quizzes(course_id,lesson_id,title,description) VALUES(?,?,?,?)", [courseId, lessonId, title, "A short quiz on HTML, CSS, and JavaScript."]);
    quizId = x.insertId;
  }
  const questions = [
    ["Which language defines the structure of a web page?", ["HTML","CSS","SQL","JSON"], 0],
    ["Which technology is mainly used for web page styling?", ["CSS","Node.js","MySQL","JWT"], 0],
    ["Which technology adds browser interactivity?", ["JavaScript","SQL","SMTP","CSS only"], 0],
  ];
  for (const [prompt, options, correct] of questions) {
    const [qr] = await pool.execute("SELECT id FROM questions WHERE quiz_id=? AND prompt=? LIMIT 1", [quizId, prompt]);
    let qid = qr[0]?.id;
    if (!qid) {
      const [qx] = await pool.execute("INSERT INTO questions(quiz_id,prompt,question_type,points) VALUES(?,?, 'multiple_choice',1)", [quizId, prompt]);
      qid = qx.insertId;
    }
    for (let i=0;i<options.length;i++) {
      const [or] = await pool.execute("SELECT id FROM question_options WHERE question_id=? AND option_text=? LIMIT 1", [qid, options[i]]);
      if (!or[0]) await pool.execute("INSERT INTO question_options(question_id,option_text,is_correct) VALUES(?,?,?)", [qid, options[i], i===correct ? 1 : 0]);
    }
  }
}

async function assignment(courseId, lessonId, studentId) {
  const specs = [
    ["Responsive Web Page Assignment", "pending", null, null],
    ["JavaScript DOM Assignment", "graded", 88, "Good work. The DOM event flow is correctly implemented."]
  ];
  for (const [title,status,score,comment] of specs) {
    const [ar] = await pool.execute("SELECT id FROM assignments WHERE course_id=? AND title=? LIMIT 1", [courseId,title]);
    let aid=ar[0]?.id;
    if(!aid){
      const [ax]=await pool.execute(`INSERT INTO assignments(course_id,title,description,points,due_date,status,lesson_id,instructions,allowed_file_types,max_file_size_mb) VALUES(?,?,?,?,?,?,?,?,?,?)`,[courseId,title,`Complete the ${title.toLowerCase()} and submit your work.`,100,"2026-09-25 23:59:00","published",lessonId,"Submit your completed work with a short explanation.","pdf,zip",10]);
      aid=ax.insertId;
    }
    const [sr]=await pool.execute("SELECT id FROM submissions WHERE assignment_id=? AND user_id=? LIMIT 1",[aid,studentId]);
    if(!sr[0] && status==="pending") await pool.execute("INSERT INTO submissions(assignment_id,user_id,comment,status) VALUES(?,?,?,'submitted')",[aid,studentId,"Submitted for instructor review."]);
    if(!sr[0] && status==="graded") await pool.execute("INSERT INTO submissions(assignment_id,user_id,comment,score,instructor_comment,graded_at,status) VALUES(?,?,?,?,?,NOW(),'graded')",[aid,studentId,"Completed the DOM exercise.",score,comment]);
  }
}

async function privateTalk(courseId, studentId, instructorId) {
  const body="Could you explain how a browser request reaches the backend API? I understand the frontend part but the request flow is still confusing.";
  const reply="The browser sends an HTTP request to the Express route, the controller processes it, the database returns data, and the backend sends JSON back to the browser.";
  const [r]=await pool.execute("SELECT id FROM student_questions WHERE student_id=? AND instructor_id=? AND body=? LIMIT 1",[studentId,instructorId,body]);
  let id=r[0]?.id;
  if(!id){const [x]=await pool.execute("INSERT INTO student_questions(course_id,student_id,instructor_id,body,status) VALUES(?,?,?,?,'answered')",[courseId,studentId,instructorId,body]);id=x.insertId;}
  const [rr]=await pool.execute("SELECT id FROM student_question_replies WHERE question_id=? AND user_id=? AND body=? LIMIT 1",[id,instructorId,reply]);
  if(!rr[0]) await pool.execute("INSERT INTO student_question_replies(question_id,user_id,body) VALUES(?,?,?)",[id,instructorId,reply]);
}

async function community() {
  const [users]=await pool.execute("SELECT id,email,first_name FROM users WHERE status='active' ORDER BY id");
  for(const u of users){
    const title=`Community introduction: ${u.email}`;
    const content=`Hello OSTA community. I am ${u.email}. I am exploring the learning and innovation platform.`;
    const [r]=await pool.execute("SELECT id FROM discussion_topics WHERE user_id=? AND title=? LIMIT 1",[u.id,title]);
    if(!r[0]) await pool.execute("INSERT INTO discussion_topics(user_id,title,category,body,content) VALUES(?,?,?,?,?)",[u.id,title,"Community",content,content]);
  }
}

async function competitions(instructorId){
  const rows=[
    ["OSTA Web Innovation Challenge","Innovation","Build a practical web solution for an education problem.","50,000 ETB"],
    ["AI for Learning Challenge","Artificial Intelligence","Design an AI-assisted learning solution.","75,000 ETB"]
  ];
  for(const [title,cat,desc,prize] of rows){
    const [r]=await pool.execute("SELECT id FROM competitions WHERE title=? LIMIT 1",[title]);
    if(!r[0]) await pool.execute("INSERT INTO competitions(title,description,status,start_date,end_date,category,deadline,prize,created_by) VALUES(?,?, 'published',?,?,?,?,?,?)",[title,desc,"2026-09-10 08:00:00","2026-09-30 23:59:00",cat,"2026-09-30 23:59:00",prize,instructorId]);
  }
}

async function events(instructorId){
  const rows=[
    ["OSTA Backend Training","Training","Practical Node.js and Express training.","2026-09-12","09:00:00",2,"online","https://meet.google.com/osta-demo",100],
    ["OSTA Community Football Match","Football Match","Community football and networking activity.","2026-09-19","15:00:00",2,"in-person","Addis Ababa Community Field",60],
    ["OSTA Innovation Showcase","Showcase","Public showcase of projects, ideas, and startups.","2026-09-26","10:00:00",3,"hybrid","OSTA Innovation Hall",150],
    ["OSTA Planning Meeting","Meeting","Project planning and coordination meeting.","2026-09-29","14:00:00",1,"online","https://meet.google.com/osta-planning",30]
  ];
  for(const e of rows){const [r]=await pool.execute("SELECT id FROM events WHERE title=? LIMIT 1",[e[0]]);if(!r[0])await pool.execute("INSERT INTO events(instructor_id,title,category,description,event_date,start_time,duration_hours,delivery_mode,location_or_link,capacity,status) VALUES(?,?,?,?,?,?,?,?,?,?, 'published')",[instructorId,...e]);}
}

function pdf(title, lines){
  const esc=s=>String(s).replace(/\\/g,"\\\\").replace(/\(/g,"\\(").replace(/\)/g,"\\)");
  const text=["BT","/F1 18 Tf","50 760 Td",`(${esc(title)}) Tj`,"/F1 11 Tf",...lines.flatMap(x=>["0 -24 Td",`(${esc(x)}) Tj`]),"ET"].join("\n");
  const objs=["<< /Type /Catalog /Pages 2 0 R >>","<< /Type /Pages /Kids [3 0 R] /Count 1 >>","<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",`<< /Length ${Buffer.byteLength(text)} >>\nstream\n${text}\nendstream`,"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"];
  let out="%PDF-1.4\n",offs=[0]; for(let i=0;i<objs.length;i++){offs.push(Buffer.byteLength(out));out+=`${i+1} 0 obj\n${objs[i]}\nendobj\n`;} const x=Buffer.byteLength(out);out+=`xref\n0 6\n0000000000 65535 f \n`;for(let i=1;i<6;i++)out+=`${String(offs[i]).padStart(10,"0")} 00000 n \n`;out+=`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${x}\n%%EOF\n`;return Buffer.from(out);
}

async function books(instructorId){
  fs.mkdirSync(BOOK_DIR,{recursive:true});
  const rows=[
    ["Introduction to Web Development","OSTA Learning Library","HTML, CSS, and JavaScript foundations.",["HTML provides structure.","CSS controls presentation.","JavaScript adds interaction."]],
    ["Fundamentals of Artificial Intelligence","OSTA Innovation Library","An introduction to AI and machine learning.",["AI enables intelligent behavior.","Machine learning learns patterns from data.","Responsible AI considers safety and fairness."]]
  ];
  for(const [title,author,desc,lines] of rows){const file=title.toLowerCase().replace(/[^a-z0-9]+/g,"-")+".pdf",filePath=path.join(BOOK_DIR,file);if(!fs.existsSync(filePath))fs.writeFileSync(filePath,pdf(title,lines));const [r]=await pool.execute("SELECT id FROM books WHERE title=? LIMIT 1",[title]);if(!r[0]){const size=fs.statSync(filePath).size;await pool.execute("INSERT INTO books(title,description,author,file_name,file_path,mime_type,file_size,uploaded_by,status) VALUES(?,?,?,?,?,?,?,?,'published')",[title,desc,author,file,filePath,"application/pdf",size,instructorId]);}}
}

async function innovation(studentId){
  const idea="Offline-First Learning Access for Rural Communities";
  const [ir]=await pool.execute("SELECT id FROM innovation_ideas WHERE title=? LIMIT 1",[idea]);
  if(!ir[0])await pool.execute("INSERT INTO innovation_ideas(user_id,title,description,problem,solution,status,category,votes) VALUES(?,?,?,?,?,'published',?,0)",[studentId,idea,"A lightweight learning mode that synchronizes progress after connectivity returns.","Low connectivity can interrupt online learning.","Allow controlled offline lessons and later synchronization.","Education Technology"]);
  const startup="EduLink Ethiopia";
  const [sr]=await pool.execute("SELECT id FROM startups WHERE name=? LIMIT 1",[startup]);
  if(!sr[0])await pool.execute("INSERT INTO startups(founder_id,name,description,stage,website,category) VALUES(?,?,?,?,?,?)",[studentId,startup,"A platform connecting learners, mentors, instructors, and practical opportunities.","Growth","https://example.org/edulink-ethiopia","EdTech"]);
  const [rr]=await pool.execute("SELECT id FROM researchers WHERE user_id=? LIMIT 1",[studentId]);let rid=rr[0]?.id;if(!rid){const [x]=await pool.execute("INSERT INTO researchers(user_id,organization,designation,bio,field,affiliation) VALUES(?,?,?,?,?,?)",[studentId,"OSTA Research Community","Student Researcher","Interested in accessible educational technology.","Educational Technology","OSTA Learning & Innovation Platform"]);rid=x.insertId;}
  const pub="Designing Accessible Digital Learning for Low-Connectivity Environments";const [pr]=await pool.execute("SELECT id FROM publications WHERE title=? LIMIT 1",[pub]);if(!pr[0])await pool.execute("INSERT INTO publications(researcher_id,title,abstract,publication_url,status,field,publication_year) VALUES(?,?,?,?, 'published',?,?)",[rid,pub,"Practical design principles for learning platforms in low-connectivity environments.","https://example.org/osta-research/accessible-learning","Educational Technology",2026]);
}

async function main(){
  const student=await user("Betel","student");
  const instructor=await user("Betelhem","instructor");
  const web=await category("Web Development","Frontend, backend, APIs, and web applications.");
  const ai=await category("Artificial Intelligence","AI and machine learning.");
  const c1=await course("Web Development Fundamentals","Learn HTML, CSS, JavaScript, and web fundamentals.",instructor.id,web,0,"Beginner");
  const c2=await course("Introduction to Artificial Intelligence","Understand AI, machine learning, and responsible intelligent systems.",instructor.id,ai,0,"Beginner");
  const c3=await course("Full-Stack JavaScript Project Lab","Build a JavaScript application from React frontend to Node.js backend.",instructor.id,web,499,"Intermediate");
  await enroll(student.id,c1);await enroll(student.id,c2);await enroll(student.id,c3);
  const s1=await section(c1,"HTML, CSS & JavaScript Foundations",1);const s2=await section(c2,"AI Foundations",1);const s3=await section(c3,"Full-Stack Project Setup",1);
  const l1=await lesson(c1,s1,"How the Web Works",1,8);const l2=await lesson(c1,s1,"HTML and CSS Basics",2,12);await lesson(c2,s2,"What Is Artificial Intelligence?",1,10);await lesson(c2,s2,"Machine Learning Basics",2,14);await lesson(c3,s3,"React to Node.js API Integration",1,18);await lesson(c3,s3,"Building a Practical API",2,20);
  await resource("Web Development Quick Reference","Web Development","https://developer.mozilla.org/en-US/docs/Learn");await resource("AI Learning Resources","Artificial Intelligence","https://developers.google.com/machine-learning/crash-course");await resource("HTTP and API Reference","Web Development","https://developer.mozilla.org/en-US/docs/Web/HTTP");
  await quiz(c1,l2);await assignment(c1,l1,student.id);await privateTalk(c1,student.id,instructor.id);await community();await competitions(instructor.id);await events(instructor.id);await innovation(student.id);await books(instructor.id);
  console.log("\nOSTA real database content is ready.");console.log(`Student: ${student.email}`);console.log(`Instructor: ${instructor.email}`);console.log("3 courses / 2 free + 1 paid / lessons + video + resources + quiz / assignments / private Q&A / community / 2 competitions / 4 events / 2 books / idea / startup / research");
}

main().catch(e=>{console.error("Seed failed:",e);process.exitCode=1;}).finally(()=>pool.end());
