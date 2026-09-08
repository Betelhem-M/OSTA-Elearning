require("dotenv").config();
const fs = require("fs");
const path = require("path");
const https = require("https");
const pool = require("./database");

const BOOK_DIR = path.join(__dirname, "../../../private_books");

const VIDEO = {
  web: "https://www.youtube.com/watch?v=dX8396ZmSPk",
  javascript: "https://www.youtube.com/watch?v=PkZNo7MFNFg",
  python: "https://www.youtube.com/watch?v=rfscVS0vtbw",
  ml: "https://www.youtube.com/watch?v=hDKCxebp88A",
};

const BOOKS = [
  {
    title: "Introduction to Python Programming",
    author: "Udayan Das, Aubrey Lawson, Chris Mayfield, Narges Norouzi",
    description: "OpenStax introductory Python textbook. Free and openly licensed for noncommercial educational redistribution with attribution.",
    url: "https://assets.openstax.org/oscms-prodcms/media/documents/Introduction_to_Python_Programming-WEB.pdf",
    source: "https://openstax.org/details/books/introduction-python-programming",
    file: "openstax-introduction-to-python-programming.pdf",
  },
  {
    title: "Introduction to Computer Science",
    author: "Jean-Claude Franchitti",
    description: "OpenStax introductory computer science textbook. Free and openly licensed for noncommercial educational redistribution with attribution.",
    url: "https://assets.openstax.org/oscms-prodcms/media/documents/Introduction_To_Computer_Science_-_WEB.pdf",
    source: "https://openstax.org/books/introduction-computer-science/pages/1-introduction",
    file: "openstax-introduction-to-computer-science.pdf",
  },
];

function download(url, destination) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(destination) && fs.statSync(destination).size > 10000) {
      return resolve();
    }
    const file = fs.createWriteStream(destination);
    const request = https.get(url, { headers: { "User-Agent": "OSTA-Elearning-Demo/1.0" } }, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        file.close();
        fs.rmSync(destination, { force: true });
        return download(response.headers.location, destination).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        file.close();
        fs.rmSync(destination, { force: true });
        return reject(new Error(`Download failed with HTTP ${response.statusCode}: ${url}`));
      }
      response.pipe(file);
      file.on("finish", () => file.close(resolve));
    });
    request.on("error", (error) => {
      file.close();
      fs.rmSync(destination, { force: true });
      reject(error);
    });
  });
}

async function findUser({ firstName, role, accountType = role, required = true }) {
  const [rows] = await pool.execute(
    `SELECT id, first_name, last_name, email, role, account_type
     FROM users
     WHERE LOWER(first_name)=LOWER(?)
       AND (LOWER(role)=LOWER(?) OR LOWER(account_type)=LOWER(?))
       AND status='active'
     ORDER BY id
     LIMIT 1`,
    [firstName, role, accountType]
  );
  if (!rows[0] && required) throw new Error(`Registered ${role} account for ${firstName} was not found.`);
  return rows[0] || null;
}

async function findAnyAccount(type) {
  const [rows] = await pool.execute(
    `SELECT id, first_name, last_name, email, role, account_type
     FROM users
     WHERE status='active' AND (LOWER(role)=LOWER(?) OR LOWER(account_type)=LOWER(?))
     ORDER BY id LIMIT 1`,
    [type, type]
  );
  if (!rows[0]) throw new Error(`A registered ${type} account is required for the educational demo seed.`);
  return rows[0];
}

async function category(name, description) {
  const [rows] = await pool.execute("SELECT id FROM categories WHERE name=? LIMIT 1", [name]);
  if (rows[0]) return rows[0].id;
  const [result] = await pool.execute("INSERT INTO categories(name,description) VALUES(?,?)", [name, description]);
  return result.insertId;
}

async function upsertCourse({ title, description, instructorId, categoryId, price, level }) {
  const [rows] = await pool.execute("SELECT id FROM courses WHERE title=? LIMIT 1", [title]);
  if (rows[0]) {
    await pool.execute(
      "UPDATE courses SET instructor_id=?,category_id=?,description=?,long_description=?,price=?,level=?,status='published' WHERE id=?",
      [instructorId, categoryId, description, description, price, level, rows[0].id]
    );
    return rows[0].id;
  }
  const [result] = await pool.execute(
    `INSERT INTO courses(title,description,long_description,instructor_id,category_id,level,price,thumbnail_color,status)
     VALUES(?,?,?,?,?,?,?,?,'published')`,
    [title, description, description, instructorId, categoryId, level, price, price > 0 ? "#7C3AED" : "#1D4ED8"]
  );
  return result.insertId;
}

async function upsertSection(courseId, title, order) {
  const [rows] = await pool.execute("SELECT id FROM course_sections WHERE course_id=? AND title=? LIMIT 1", [courseId, title]);
  if (rows[0]) return rows[0].id;
  const [result] = await pool.execute(
    "INSERT INTO course_sections(course_id,title,section_order,description) VALUES(?,?,?,?)",
    [courseId, title, order, "Real educational content used for the OSTA local demo."]
  );
  return result.insertId;
}

async function upsertLesson({ courseId, sectionId, title, position, minutes, videoUrl, description, resourceUrl }) {
  const [rows] = await pool.execute("SELECT id FROM lessons WHERE course_id=? AND title=? LIMIT 1", [courseId, title]);
  if (rows[0]) {
    await pool.execute(
      "UPDATE lessons SET section_id=?,description=?,content=?,video_url=?,duration_minutes=?,position=?,resource_url=? WHERE id=?",
      [sectionId, description, description, videoUrl, minutes, position, resourceUrl, rows[0].id]
    );
    return rows[0].id;
  }
  const [result] = await pool.execute(
    `INSERT INTO lessons(course_id,section_id,title,description,content,video_url,duration_minutes,position,resource_url)
     VALUES(?,?,?,?,?,?,?,?,?)`,
    [courseId, sectionId, title, description, description, videoUrl, minutes, position, resourceUrl]
  );
  return result.insertId;
}

async function enroll(studentId, courseId) {
  await pool.execute(
    "INSERT INTO enrollments(user_id,course_id,status) VALUES(?,?, 'active') ON DUPLICATE KEY UPDATE status='active'",
    [studentId, courseId]
  );
}

async function resource(title, description, categoryName, url) {
  const [rows] = await pool.execute("SELECT id FROM learning_resources WHERE title=? LIMIT 1", [title]);
  if (rows[0]) {
    await pool.execute("UPDATE learning_resources SET description=?,category=?,file_url=?,download_allowed=1 WHERE id=?", [description, categoryName, url, rows[0].id]);
    return;
  }
  await pool.execute(
    "INSERT INTO learning_resources(title,description,category,file_url,download_allowed) VALUES(?,?,?,?,1)",
    [title, description, categoryName, url]
  );
}

async function ensureQuiz(courseId, lessonId) {
  const title = "Web Development Fundamentals Quiz";
  const [rows] = await pool.execute("SELECT id FROM quizzes WHERE course_id=? AND title=? LIMIT 1", [courseId, title]);
  let quizId = rows[0]?.id;
  if (!quizId) {
    const [result] = await pool.execute("INSERT INTO quizzes(course_id,lesson_id,title,description) VALUES(?,?,?,?)", [courseId, lessonId, title, "A real-content test quiz covering HTML, CSS, and JavaScript basics."]);
    quizId = result.insertId;
  }
  const questions = [
    ["Which language defines the structure of a web page?", ["HTML", "CSS", "SQL", "JSON"], 0],
    ["Which technology is mainly used for web page styling?", ["CSS", "Node.js", "MySQL", "JWT"], 0],
    ["Which technology adds browser interactivity?", ["JavaScript", "SQL", "SMTP", "CSS only"], 0],
  ];
  for (const [prompt, options, correct] of questions) {
    const [questionRows] = await pool.execute("SELECT id FROM questions WHERE quiz_id=? AND prompt=? LIMIT 1", [quizId, prompt]);
    let questionId = questionRows[0]?.id;
    if (!questionId) {
      const [result] = await pool.execute("INSERT INTO questions(quiz_id,prompt,question_type,points) VALUES(?,?, 'multiple_choice',1)", [quizId, prompt]);
      questionId = result.insertId;
    }
    for (let index = 0; index < options.length; index += 1) {
      const [optionRows] = await pool.execute("SELECT id FROM question_options WHERE question_id=? AND option_text=? LIMIT 1", [questionId, options[index]]);
      if (!optionRows[0]) {
        await pool.execute("INSERT INTO question_options(question_id,option_text,is_correct) VALUES(?,?,?)", [questionId, options[index], index === correct ? 1 : 0]);
      }
    }
  }
}

async function ensureAssignments(courseId, lessonId, studentId) {
  const specs = [
    ["Responsive Web Page Assignment", "submitted", null, null],
    ["JavaScript DOM Assignment", "graded", 88, "Good work. The DOM event flow is correctly implemented."],
  ];
  for (const [title, status, score, comment] of specs) {
    const [assignmentRows] = await pool.execute("SELECT id FROM assignments WHERE course_id=? AND title=? LIMIT 1", [courseId, title]);
    let assignmentId = assignmentRows[0]?.id;
    if (!assignmentId) {
      const [result] = await pool.execute(
        `INSERT INTO assignments(course_id,title,description,points,due_date,status,lesson_id,instructions,allowed_file_types,max_file_size_mb)
         VALUES(?,?,?,?,?,?,?,?,?,?)`,
        [courseId, title, `Complete the ${title.toLowerCase()} and submit your work.`, 100, "2026-09-25 23:59:00", "published", lessonId, "Submit your completed work with a short explanation.", "pdf,zip", 10]
      );
      assignmentId = result.insertId;
    }
    const [submissionRows] = await pool.execute("SELECT id FROM submissions WHERE assignment_id=? AND user_id=? LIMIT 1", [assignmentId, studentId]);
    if (!submissionRows[0]) {
      if (status === "graded") {
        await pool.execute(
          "INSERT INTO submissions(assignment_id,user_id,comment,score,instructor_comment,graded_at,status) VALUES(?,?,?,?,?,NOW(),'graded')",
          [assignmentId, studentId, "Completed the DOM exercise.", score, comment]
        );
      } else {
        await pool.execute(
          "INSERT INTO submissions(assignment_id,user_id,comment,status) VALUES(?,?,?,'submitted')",
          [assignmentId, studentId, "Submitted for instructor review."]
        );
      }
    }
  }
}

async function privateQuestion(courseId, studentId, instructorId) {
  const body = "Could you explain how a browser request reaches the backend API? I understand the frontend part but the request flow is still confusing.";
  const reply = "The browser sends an HTTP request to the Express route, the controller processes it, the database returns data, and the backend sends JSON back to the browser.";
  const [rows] = await pool.execute("SELECT id FROM student_questions WHERE student_id=? AND instructor_id=? AND body=? LIMIT 1", [studentId, instructorId, body]);
  let questionId = rows[0]?.id;
  if (!questionId) {
    const [result] = await pool.execute("INSERT INTO student_questions(course_id,student_id,instructor_id,body,status) VALUES(?,?,?,?,'answered')", [courseId, studentId, instructorId, body]);
    questionId = result.insertId;
  }
  const [replyRows] = await pool.execute("SELECT id FROM student_question_replies WHERE question_id=? AND user_id=? AND body=? LIMIT 1", [questionId, instructorId, reply]);
  if (!replyRows[0]) await pool.execute("INSERT INTO student_question_replies(question_id,user_id,body) VALUES(?,?,?)", [questionId, instructorId, reply]);
}

async function community() {
  const [users] = await pool.execute("SELECT id,email FROM users WHERE status='active' ORDER BY id");
  for (const user of users) {
    const title = `Community introduction: ${user.email}`;
    const body = `Hello OSTA community. I am ${user.email}. I am exploring the learning and innovation platform.`;
    const [rows] = await pool.execute("SELECT id FROM discussion_topics WHERE user_id=? AND title=? LIMIT 1", [user.id, title]);
    if (!rows[0]) await pool.execute("INSERT INTO discussion_topics(user_id,title,category,body,content) VALUES(?,?,?,?,?)", [user.id, title, "Community", body, body]);
  }
}

async function competitions(instructorId) {
  const rows = [
    ["OSTA Web Innovation Challenge", "Innovation", "Build a practical web solution for an education problem.", "50,000 ETB"],
    ["AI for Learning Challenge", "Artificial Intelligence", "Design an AI-assisted learning solution for students or educators.", "75,000 ETB"],
  ];
  for (const [title, categoryName, description, prize] of rows) {
    const [existing] = await pool.execute("SELECT id FROM competitions WHERE title=? LIMIT 1", [title]);
    if (!existing[0]) {
      await pool.execute(
        "INSERT INTO competitions(title,description,status,start_date,end_date,category,deadline,prize,created_by) VALUES(?,?, 'published',?,?,?,?,?,?)",
        [title, description, "2026-09-10 08:00:00", "2026-09-30 23:59:00", categoryName, "2026-09-30 23:59:00", prize, instructorId]
      );
    }
  }
}

async function events(instructorId) {
  const rows = [
    ["OSTA Backend Training", "Training", "Practical Node.js and Express training using a small API project.", "2026-09-12", "09:00:00", 2, "online", "https://meet.google.com/osta-demo", 100],
    ["OSTA Community Football Match", "Football Match", "Community football and networking activity.", "2026-09-19", "15:00:00", 2, "in-person", "Addis Ababa Community Field", 60],
    ["OSTA Innovation Showcase", "Showcase", "Public showcase of projects, ideas, startups, and research.", "2026-09-26", "10:00:00", 3, "hybrid", "OSTA Innovation Hall", 150],
    ["OSTA Planning Meeting", "Meeting", "Project planning and coordination meeting.", "2026-09-29", "14:00:00", 1, "online", "https://meet.google.com/osta-planning", 30],
  ];
  for (const event of rows) {
    const [existing] = await pool.execute("SELECT id FROM events WHERE title=? LIMIT 1", [event[0]]);
    if (!existing[0]) {
      await pool.execute(
        "INSERT INTO events(instructor_id,title,category,description,event_date,start_time,duration_hours,delivery_mode,location_or_link,capacity,status) VALUES(?,?,?,?,?,?,?,?,?,?, 'published')",
        [instructorId, ...event]
      );
    }
  }
}

async function books(instructorId) {
  fs.mkdirSync(BOOK_DIR, { recursive: true });
  for (const book of BOOKS) {
    const filePath = path.join(BOOK_DIR, book.file);
    await download(book.url, filePath);
    const size = fs.statSync(filePath).size;
    const [rows] = await pool.execute("SELECT id FROM books WHERE title=? LIMIT 1", [book.title]);
    if (rows[0]) {
      await pool.execute(
        "UPDATE books SET description=?,author=?,file_name=?,file_path=?,mime_type='application/pdf',file_size=?,uploaded_by=?,status='published' WHERE id=?",
        [book.description + ` Source: ${book.source}`, book.author, book.file, filePath, size, instructorId, rows[0].id]
      );
    } else {
      await pool.execute(
        "INSERT INTO books(title,description,author,file_name,file_path,mime_type,file_size,uploaded_by,status) VALUES(?,?,?,?,?,?,?,?,'published')",
        [book.title, book.description + ` Source: ${book.source}`, book.author, book.file, filePath, "application/pdf", size, instructorId]
      );
    }
  }
}

async function innovationAndResearch(entrepreneur, researcher) {
  const idea = "Offline-First Learning Access for Rural Communities";
  const [ideaRows] = await pool.execute("SELECT id FROM innovation_ideas WHERE title=? LIMIT 1", [idea]);
  if (!ideaRows[0]) {
    await pool.execute(
      "INSERT INTO innovation_ideas(user_id,title,description,problem,solution,status,category,votes) VALUES(?,?,?,?,?,'published',?,0)",
      [entrepreneur.id, idea, "A lightweight learning mode that synchronizes progress after connectivity returns.", "Low connectivity can interrupt online learning.", "Allow controlled offline lessons and later synchronization.", "Education Technology"]
    );
  }

  const startup = "EduLink Ethiopia";
  const [startupRows] = await pool.execute("SELECT id FROM startups WHERE name=? LIMIT 1", [startup]);
  if (!startupRows[0]) {
    await pool.execute(
      "INSERT INTO startups(founder_id,name,description,stage,website,category) VALUES(?,?,?,?,?,?)",
      [entrepreneur.id, startup, "A learning and opportunity platform connecting learners, mentors, instructors, and practical opportunities.", "Growth", "https://example.org/edulink-ethiopia", "EdTech"]
    );
  }

  const publication = "Designing Accessible Digital Learning for Low-Connectivity Environments";
  const [publicationRows] = await pool.execute("SELECT id FROM publications WHERE title=? LIMIT 1", [publication]);
  if (!publicationRows[0]) {
    await pool.execute(
      "INSERT INTO publications(researcher_id,title,abstract,publication_url,status,field,publication_year) VALUES(?,?,?,?, 'published',?,?)",
      [researcher.id, publication, "A test publication record about practical design principles for learning platforms in low-connectivity environments.", "https://openstax.org/books/introduction-computer-science/pages/1-introduction", "Educational Technology", 2026]
    );
  }
}

async function main() {
  const student = await findUser({ firstName: "Betel", role: "student" });
  const instructor = await findUser({ firstName: "Betelhem", role: "instructor" });
  const entrepreneur = await findAnyAccount("entrepreneur");
  const researcher = await findAnyAccount("researcher");

  const webCategory = await category("Web Development", "HTML, CSS, JavaScript, and practical web development.");
  const aiCategory = await category("Artificial Intelligence", "Artificial intelligence, machine learning, and responsible AI.");
  const pythonCategory = await category("Python", "Python programming and problem solving.");

  const webCourse = await upsertCourse({
    title: "Web Development Fundamentals",
    description: "A beginner-friendly web development course using real freeCodeCamp educational video material.",
    instructorId: instructor.id,
    categoryId: webCategory,
    price: 0,
    level: "Beginner",
  });
  const webSection = await upsertSection(webCourse, "HTML, CSS & JavaScript Foundations", 1);
  const htmlLesson = await upsertLesson({ courseId: webCourse, sectionId: webSection, title: "HTML and CSS Basics", position: 1, minutes: 134, videoUrl: VIDEO.web, description: "Learn the structure and styling foundations of modern web pages with freeCodeCamp's full HTML/CSS course.", resourceUrl: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content" });
  const jsLesson = await upsertLesson({ courseId: webCourse, sectionId: webSection, title: "JavaScript Fundamentals", position: 2, minutes: 134, videoUrl: VIDEO.javascript, description: "Learn JavaScript variables, functions, arrays, objects, conditions, and modern syntax from a freeCodeCamp beginner course.", resourceUrl: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide" });
  await ensureQuiz(webCourse, jsLesson);
  await ensureAssignments(webCourse, jsLesson, student.id);
  await enroll(student.id, webCourse);

  const aiCourse = await upsertCourse({
    title: "Introduction to Artificial Intelligence",
    description: "A free beginner AI course using real machine-learning education material and open resources.",
    instructorId: instructor.id,
    categoryId: aiCategory,
    price: 0,
    level: "Beginner",
  });
  const aiSection = await upsertSection(aiCourse, "AI & Machine Learning Foundations", 1);
  await upsertLesson({ courseId: aiCourse, sectionId: aiSection, title: "Machine Learning Fundamentals", position: 1, minutes: 138, videoUrl: VIDEO.ml, description: "Explore supervised and unsupervised learning and practical machine-learning workflows.", resourceUrl: "https://ocw.mit.edu/" });
  await upsertLesson({ courseId: aiCourse, sectionId: aiSection, title: "Python for AI", position: 2, minutes: 260, videoUrl: VIDEO.python, description: "Build the Python foundation needed to work with data and AI projects.", resourceUrl: "https://openstax.org/books/introduction-python-programming/pages/1-introduction" });
  await enroll(student.id, aiCourse);

  const paidCourse = await upsertCourse({
    title: "Full-Stack JavaScript Project Lab",
    description: "A project-oriented paid course covering frontend JavaScript and the path toward backend API integration.",
    instructorId: instructor.id,
    categoryId: webCategory,
    price: 499,
    level: "Intermediate",
  });
  const paidSection = await upsertSection(paidCourse, "Frontend to Backend", 1);
  await upsertLesson({ courseId: paidCourse, sectionId: paidSection, title: "JavaScript Application Architecture", position: 1, minutes: 134, videoUrl: VIDEO.javascript, description: "Study JavaScript application structure and reusable modules before connecting a backend.", resourceUrl: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules" });
  await upsertLesson({ courseId: paidCourse, sectionId: paidSection, title: "Building a Practical API", position: 2, minutes: 120, videoUrl: VIDEO.web, description: "Use the course material as a foundation for connecting a frontend to an API service.", resourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTTP" });
  await enroll(student.id, paidCourse);

  await resource("MDN Web Development Learning Path", "Free web development reference and tutorials.", "Web Development", "https://developer.mozilla.org/en-US/docs/Learn_web_development");
  await resource("MIT Introduction to CS and Programming Using Python", "Free MIT OpenCourseWare course with lecture videos, notes, problem sets, and assignments.", "Python", "https://ocw.mit.edu/courses/6-100l-introduction-to-cs-and-programming-using-python-fall-2022/");
  await resource("OpenStax Introduction to Python Programming", "Free OpenStax textbook with web and PDF versions.", "Python", "https://openstax.org/books/introduction-python-programming/pages/1-introduction");
  await resource("OpenStax Introduction to Computer Science", "Free OpenStax computer science textbook.", "Computer Science", "https://openstax.org/books/introduction-computer-science/pages/1-introduction");

  await privateQuestion(webCourse, student.id, instructor.id);
  await community();
  await competitions(instructor.id);
  await events(instructor.id);
  await books(instructor.id);
  await innovationAndResearch(entrepreneur, researcher);

  console.log("Real educational demo content seeded successfully.");
  console.log(`Courses: ${webCourse}, ${aiCourse}, ${paidCourse}`);
  console.log(`Student: ${student.email}`);
  console.log(`Instructor: ${instructor.email}`);
  console.log(`Entrepreneur: ${entrepreneur.email}`);
  console.log(`Researcher: ${researcher.email}`);
}

main().catch((error) => {
  console.error("Educational content seed failed:", error);
  process.exitCode = 1;
});
