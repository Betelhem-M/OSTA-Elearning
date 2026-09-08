require("dotenv").config();

const fs = require("fs");
const path = require("path");
const pool = require("./database");

/*
 * Seeds the LOCAL OSTA database with real relational records for testing.
 *
 * Important:
 * - Uses already-registered users; it never creates fake accounts.
 * - Is idempotent by title/name/email lookups, so it can be run repeatedly.
 * - Creates two small, valid PDF files locally so the Books feature has
 *   actual files to read/download, not broken placeholder URLs.
 */

const VIDEO_URL = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";
const DEMO_BOOK_DIR = path.join(__dirname, "../../../private_books");

async function findUser(firstName, lastName, role) {
  const [rows] = await pool.execute(
    `SELECT id, first_name, last_name, email, role, account_type
     FROM users
     WHERE LOWER(first_name)=LOWER(?)
       AND LOWER(last_name)=LOWER(?)
       AND (LOWER(role)=LOWER(?) OR LOWER(account_type)=LOWER(?))
     ORDER BY id
     LIMIT 1`,
    [firstName, lastName, role, role]
  );
  return rows[0] || null;
}

async function findByRole(role) {
  const [rows] = await pool.execute(
    `SELECT id, first_name, last_name, email, role, account_type
     FROM users
     WHERE LOWER(role)=LOWER(?) OR LOWER(account_type)=LOWER(?)
     ORDER BY id
     LIMIT 1`,
    [role, role]
  );
  return rows[0] || null;
}

async function getUserOrFail(firstName, lastName, role, label) {
  const exact = await findUser(firstName, lastName, role);
  if (exact) return exact;

  const fallback = await findByRole(role);
  if (fallback) {
    console.warn(`Could not find ${label} by exact name; using registered ${role}: ${fallback.email}`);
    return fallback;
  }

  throw new Error(`No registered ${role} account exists. Please register the required ${label} account first.`);
}

async function getOrCreateCategory(name, description) {
  const [rows] = await pool.execute("SELECT id FROM categories WHERE name=? LIMIT 1", [name]);
  if (rows[0]) return rows[0].id;
  const [result] = await pool.execute(
    "INSERT INTO categories (name, description) VALUES (?, ?)",
    [name, description]
  );
  return result.insertId;
}

async function getOrCreateCourse(data) {
  const [rows] = await pool.execute(
    "SELECT id FROM courses WHERE title=? LIMIT 1",
    [data.title]
  );
  if (rows[0]) {
    await pool.execute(
      `UPDATE courses SET description=?, long_description=?, instructor_id=?, category_id=?,
       level=?, price=?, thumbnail_color=?, status='published' WHERE id=?`,
      [data.description, data.longDescription, data.instructorId, data.categoryId,
       data.level, data.price, data.thumbnailColor, rows[0].id]
    );
    return rows[0].id;
  }
  const [result] = await pool.execute(
    `INSERT INTO courses
      (title, description, long_description, instructor_id, category_id, level, price, thumbnail_color, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'published')`,
    [data.title, data.description, data.longDescription, data.instructorId, data.categoryId,
     data.level, data.price, data.thumbnailColor]
  );
  return result.insertId;
}

async function getOrCreateSection(courseId, title, order, description) {
  const [rows] = await pool.execute(
    "SELECT id FROM course_sections WHERE course_id=? AND title=? LIMIT 1",
    [courseId, title]
  );
  if (rows[0]) return rows[0].id;
  const [result] = await pool.execute(
    "INSERT INTO course_sections (course_id,title,section_order,description) VALUES (?,?,?,?)",
    [courseId, title, order, description]
  );
  return result.insertId;
}

async function getOrCreateLesson(courseId, sectionId, title, description, content, position, duration) {
  const [rows] = await pool.execute(
    "SELECT id FROM lessons WHERE course_id=? AND title=? LIMIT 1",
    [courseId, title]
  );
  if (rows[0]) return rows[0].id;
  const [result] = await pool.execute(
    `INSERT INTO lessons
      (course_id,section_id,title,description,content,video_url,duration_minutes,position)
     VALUES (?,?,?,?,?,?,?,?)`,
    [courseId, sectionId, title, description, content, VIDEO_URL, duration, position]
  );
  return result.insertId;
}

async function getOrCreateResource(title, description, category, fileUrl) {
  const [rows] = await pool.execute(
    "SELECT id FROM learning_resources WHERE title=? LIMIT 1",
    [title]
  );
  if (rows[0]) return rows[0].id;
  const [result] = await pool.execute(
    `INSERT INTO learning_resources (title,description,category,file_url,download_allowed)
     VALUES (?,?,?,?,1)`,
    [title, description, category, fileUrl]
  );
  return result.insertId;
}

async function ensureEnrollment(userId, courseId) {
  await pool.execute(
    `INSERT INTO enrollments (user_id,course_id,status)
     VALUES (?,?, 'active')
     ON DUPLICATE KEY UPDATE status='active'`,
    [userId, courseId]
  );
}

async function getOrCreateQuiz(courseId, lessonId, title, description) {
  const [rows] = await pool.execute(
    "SELECT id FROM quizzes WHERE course_id=? AND title=? LIMIT 1",
    [courseId, title]
  );
  if (rows[0]) return rows[0].id;
  const [result] = await pool.execute(
    "INSERT INTO quizzes (course_id,lesson_id,title,description) VALUES (?,?,?,?)",
    [courseId, lessonId, title, description]
  );
  return result.insertId;
}

async function getOrCreateQuestion(quizId, prompt, points, options) {
  const [existing] = await pool.execute(
    "SELECT id FROM questions WHERE quiz_id=? AND prompt=? LIMIT 1",
    [quizId, prompt]
  );
  let questionId = existing[0]?.id;
  if (!questionId) {
    const [result] = await pool.execute(
      "INSERT INTO questions (quiz_id,prompt,question_type,points) VALUES (?,?, 'multiple_choice',?)",
      [quizId, prompt, points]
    );
    questionId = result.insertId;
  }

  for (const option of options) {
    const [found] = await pool.execute(
      "SELECT id FROM question_options WHERE question_id=? AND option_text=? LIMIT 1",
      [questionId, option.text]
    );
    if (!found[0]) {
      await pool.execute(
        "INSERT INTO question_options (question_id,option_text,is_correct) VALUES (?,?,?)",
        [questionId, option.text, option.correct ? 1 : 0]
      );
    }
  }
  return questionId;
}

function escapePdfText(text) {
  return String(text).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function makeSimplePdf(title, lines) {
  const allLines = [title, ...lines];
  const commands = ["BT", "/F1 18 Tf", "50 760 Td", `(${escapePdfText(allLines[0])}) Tj`, "/F1 11 Tf"];
  for (let i = 1; i < allLines.length; i += 1) {
    commands.push("0 -24 Td", `(${escapePdfText(allLines[i])}) Tj`);
  }
  commands.push("ET");
  const stream = commands.join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",
    `<< /Length ${Buffer.byteLength(stream, "utf8")} >>\nstream\n${stream}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (let i = 0; i < objects.length; i += 1) {
    offsets.push(Buffer.byteLength(pdf, "utf8"));
    pdf += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
  }
  const xref = Buffer.byteLength(pdf, "utf8");
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objects.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(pdf, "utf8");
}

async function seedBooks(instructorId) {
  fs.mkdirSync(DEMO_BOOK_DIR, { recursive: true });
  const books = [
    {
      title: "Introduction to Web Development",
      author: "OSTA Learning Library",
      description: "A short test reading about HTML, CSS, JavaScript, and modern web development.",
      fileName: "osta-introduction-to-web-development.pdf",
      lines: [
        "HTML provides the structure of a web page.",
        "CSS controls presentation and layout.",
        "JavaScript adds behavior and interaction.",
        "Use this book to test online reading and download access.",
      ],
    },
    {
      title: "Fundamentals of Artificial Intelligence",
      author: "OSTA Innovation Library",
      description: "A short test reading covering AI, machine learning, and responsible innovation.",
      fileName: "osta-fundamentals-of-artificial-intelligence.pdf",
      lines: [
        "Artificial intelligence enables systems to perform tasks requiring intelligent behavior.",
        "Machine learning learns useful patterns from data.",
        "Responsible AI considers fairness, safety, privacy, and human oversight.",
        "Use this book to test the public reading experience.",
      ],
    },
  ];

  for (const book of books) {
    const filePath = path.join(DEMO_BOOK_DIR, book.fileName);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, makeSimplePdf(book.title, book.lines));
    }
    const stats = fs.statSync(filePath);
    const [rows] = await pool.execute("SELECT id FROM books WHERE title=? LIMIT 1", [book.title]);
    if (rows[0]) continue;
    await pool.execute(
      `INSERT INTO books
       (title,description,author,file_name,file_path,mime_type,file_size,uploaded_by,status)
       VALUES (?,?,?,?,?,?,?,?,'published')`,
      [book.title, book.description, book.author, book.fileName, filePath,
       "application/pdf", stats.size, instructorId]
    );
  }
}

async function seed() {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const student = await getUserOrFail("Betel", "", "student", "Betel student");
    const instructor = await getUserOrFail("Betelhem", "", "instructor", "Betelhem instructor");

    const webCategory = await getOrCreateCategory("Web Development", "Frontend, backend, APIs, and modern web applications.");
    const aiCategory = await getOrCreateCategory("Artificial Intelligence", "AI, machine learning, and intelligent systems.");
    const innovationCategory = await getOrCreateCategory("Innovation & Technology", "Innovation, entrepreneurship, and technology skills.");

    const freeCourse1 = await getOrCreateCourse({
      title: "Web Development Fundamentals",
      description: "Learn the foundations of HTML, CSS, JavaScript, and how web applications work.",
      longDescription: "A practical beginner course with video lessons, a quiz, resources, and a small assignment.",
      instructorId: instructor.id,
      categoryId: webCategory,
      level: "Beginner",
      price: 0,
      thumbnailColor: "#1D4ED8",
    });

    const freeCourse2 = await getOrCreateCourse({
      title: "Introduction to Artificial Intelligence",
      description: "Understand AI, machine learning, data, and responsible intelligent systems.",
      longDescription: "An introductory course designed to connect AI concepts with practical examples.",
      instructorId: instructor.id,
      categoryId: aiCategory,
      level: "Beginner",
      price: 0,
      thumbnailColor: "#047857",
    });

    const paidCourse = await getOrCreateCourse({
      title: "Full-Stack JavaScript Project Lab",
      description: "Build a complete JavaScript application from frontend to backend API integration.",
      longDescription: "A project-oriented course covering React, Node.js, Express, API integration, and deployment concepts.",
      instructorId: instructor.id,
      categoryId: webCategory,
      level: "Intermediate",
      price: 499,
      thumbnailColor: "#7C3AED",
    });

    const courses = [freeCourse1, freeCourse2, paidCourse];
    for (const courseId of courses) await ensureEnrollment(student.id, courseId);

    const sections = {};
    sections.web = await getOrCreateSection(freeCourse1, "HTML, CSS & JavaScript Foundations", 1, "The essential building blocks of the web.");
    sections.ai = await getOrCreateSection(freeCourse2, "AI Foundations", 1, "Core concepts and examples of artificial intelligence.");
    sections.full = await getOrCreateSection(paidCourse, "Full-Stack Project Setup", 1, "Connect a React frontend to a Node.js backend.");

    const webLesson1 = await getOrCreateLesson(freeCourse1, sections.web, "How the Web Works", "Learn browsers, servers, HTTP, and web pages.", "A browser requests resources from a server and renders HTML, CSS, and JavaScript.", 1, 8);
    const webLesson2 = await getOrCreateLesson(freeCourse1, sections.web, "HTML and CSS Basics", "Build a structured and styled page.", "HTML describes structure while CSS describes presentation.", 2, 12);
    const aiLesson1 = await getOrCreateLesson(freeCourse2, sections.ai, "What Is Artificial Intelligence?", "A clear introduction to AI and intelligent systems.", "AI is a broad field concerned with systems that perform tasks associated with intelligent behavior.", 1, 10);
    const aiLesson2 = await getOrCreateLesson(freeCourse2, sections.ai, "Machine Learning Basics", "Understand learning from data.", "Machine learning uses data to learn patterns that can support predictions or decisions.", 2, 14);
    const fullLesson1 = await getOrCreateLesson(paidCourse, sections.full, "React to Node.js API Integration", "Connect a frontend to an Express API.", "The frontend sends HTTP requests to backend endpoints and consumes JSON responses.", 1, 18);
    const fullLesson2 = await getOrCreateLesson(paidCourse, sections.full, "Building a Practical API", "Organize routes, controllers, and database operations.", "A clean API separates routing, business logic, and data access.", 2, 20);

    await getOrCreateResource("Web Development Quick Reference", "A concise reference for HTML, CSS, JavaScript, and HTTP concepts.", "Web Development", "https://developer.mozilla.org/en-US/docs/Learn");
    await getOrCreateResource("AI Learning Resources", "Recommended introductory material for artificial intelligence and machine learning.", "Artificial Intelligence", "https://developers.google.com/machine-learning/crash-course");
    await getOrCreateResource("Full-Stack Project Checklist", "A checklist for frontend, backend, API, database, and deployment work.", "Web Development", "https://developer.mozilla.org/en-US/docs/Web/HTTP");

    const quiz = await getOrCreateQuiz(freeCourse1, webLesson2, "Web Development Fundamentals Quiz", "Test your understanding of HTML, CSS, and JavaScript.");
    const q1 = await getOrCreateQuestion(quiz, "Which language primarily defines the structure of a web page?", 1, [
      { text: "HTML", correct: true }, { text: "CSS", correct: false }, { text: "SQL", correct: false }, { text: "JSON", correct: false },
    ]);
    const q2 = await getOrCreateQuestion(quiz, "Which technology is mainly used to style HTML elements?", 1, [
      { text: "CSS", correct: true }, { text: "Node.js", correct: false }, { text: "MySQL", correct: false }, { text: "JWT", correct: false },
    ]);
    const q3 = await getOrCreateQuestion(quiz, "Which technology adds interactive behavior in the browser?", 1, [
      { text: "JavaScript", correct: true }, { text: "CSS only", correct: false }, { text: "SQL only", correct: false }, { text: "SMTP", correct: false },
    ]);

    const assignmentTitle1 = "Build a Responsive Web Page";
    const [a1Rows] = await pool.execute("SELECT id FROM assignments WHERE course_id=? AND title=? LIMIT 1", [freeCourse1, assignmentTitle1]);
    let assignment1 = a1Rows[0]?.id;
    if (!assignment1) {
      const [result] = await pool.execute(
        `INSERT INTO assignments
         (course_id,title,description,points,due_date,status,lesson_id,instructions,allowed_file_types,max_file_size_mb)
         VALUES (?,?,?,?,?,?,?,?,?,?)`,
        [freeCourse1, assignmentTitle1, "Create a responsive page using semantic HTML and CSS.", 100,
         "2026-09-20 23:59:00", "published", webLesson2,
         "Submit your page source as a ZIP or PDF screenshot with a short explanation.", "zip,pdf", 10]
      );
      assignment1 = result.insertId;
    }

    const assignmentTitle2 = "JavaScript DOM Interaction Exercise";
    const [a2Rows] = await pool.execute("SELECT id FROM assignments WHERE course_id=? AND title=? LIMIT 1", [freeCourse1, assignmentTitle2]);
    let assignment2 = a2Rows[0]?.id;
    if (!assignment2) {
      const [result] = await pool.execute(
        `INSERT INTO assignments
         (course_id,title,description,points,due_date,status,lesson_id,instructions,allowed_file_types,max_file_size_mb)
         VALUES (?,?,?,?,?,?,?,?,?,?)`,
        [freeCourse1, assignmentTitle2, "Create a small page that responds to a button click using JavaScript.", 100,
         "2026-09-12 23:59:00", "published", webLesson1,
         "Explain the DOM event and show the resulting interaction.", "pdf,zip", 10]
      );
      assignment2 = result.insertId;
    }

    const [pendingSubmission] = await pool.execute(
      "SELECT id FROM submissions WHERE assignment_id=? AND user_id=? LIMIT 1",
      [assignment1, student.id]
    );
    if (!pendingSubmission[0]) {
      await pool.execute(
        `INSERT INTO submissions (assignment_id,user_id,comment,status,submitted_at)
         VALUES (?,?,?,'submitted',NOW())`,
        [assignment1, student.id, "Here is my responsive web page submission for review."]
      );
    }

    const [gradedSubmission] = await pool.execute(
      "SELECT id FROM submissions WHERE assignment_id=? AND user_id=? LIMIT 1",
      [assignment2, student.id]
    );
    if (!gradedSubmission[0]) {
      await pool.execute(
        `INSERT INTO submissions
         (assignment_id,user_id,comment,score,instructor_comment,graded_at,status,submitted_at)
         VALUES (?,?,?,?,?,NOW(),'graded',DATE_SUB(NOW(), INTERVAL 2 DAY))`,
        [assignment2, student.id, "Completed the DOM interaction exercise.", 88,
         "Good understanding of DOM events. Add a little more explanation around event listeners."]
      );
    }

    const privateQuestionBody = "I understand the first lessons, but I am confused about how a browser request reaches the backend API. Could you explain the flow with a simple example?";
    const [questionRows] = await pool.execute(
      "SELECT id FROM student_questions WHERE student_id=? AND instructor_id=? AND body=? LIMIT 1",
      [student.id, instructor.id, privateQuestionBody]
    );
    let questionId = questionRows[0]?.id;
    if (!questionId) {
      const [result] = await pool.execute(
        "INSERT INTO student_questions (course_id,student_id,instructor_id,body,status) VALUES (?,?,?,?,'answered')",
        [freeCourse1, student.id, instructor.id, privateQuestionBody]
      );
      questionId = result.insertId;
    }
    const replyBody = "Think of it as a chain: the browser sends an HTTP request to the Express route, the controller processes it, the database returns data, and the backend sends JSON back to the browser.";
    const [replyRows] = await pool.execute(
      "SELECT id FROM student_question_replies WHERE question_id=? AND user_id=? AND body=? LIMIT 1",
      [questionId, instructor.id, replyBody]
    );
    if (!replyRows[0]) {
      await pool.execute(
        "INSERT INTO student_question_replies (question_id,user_id,body) VALUES (?,?,?)",
        [questionId, instructor.id, replyBody]
      );
    }

    const communityUsers = await pool.execute("SELECT id, email, first_name FROM users WHERE status='active' ORDER BY id");
    for (const user of communityUsers[0]) {
      const title = `Community introduction from ${user.first_name}`;
      const content = `Hello OSTA community. I am ${user.email}. I am exploring the learning and innovation features of the platform.`;
      const [topicRows] = await pool.execute("SELECT id FROM discussion_topics WHERE user_id=? AND title=? LIMIT 1", [user.id, title]);
      if (!topicRows[0]) {
        await pool.execute(
          "INSERT INTO discussion_topics (user_id,title,category,body,content) VALUES (?,?,?,?,?)",
          [user.id, title, "Community", content, content]
        );
      }
    }

    const competitionData = [
      ["OSTA Web Innovation Challenge", "Build a practical web solution for an education or community problem.", "Innovation", "2026-09-10 08:00:00", "2026-09-30 23:59:00", "50,000 ETB"],
      ["AI for Learning Challenge", "Design an AI-assisted learning idea that improves access, practice, or feedback.", "Artificial Intelligence", "2026-09-15 08:00:00", "2026-10-15 23:59:00", "75,000 ETB"],
    ];
    for (const [title, description, category, start, deadline, prize] of competitionData) {
      const [rows] = await pool.execute("SELECT id FROM competitions WHERE title=? LIMIT 1", [title]);
      if (!rows[0]) {
        await pool.execute(
          `INSERT INTO competitions (title,description,status,start_date,end_date,category,deadline,prize,created_by)
           VALUES (?,?,?,?,?,?,?,?,?)`,
          [title, description, "published", start, deadline, category, deadline, prize, instructor.id]
        );
      }
    }

    const eventData = [
      ["OSTA Backend Training Session", "Training", "Practical Node.js and Express backend training for learners.", "2026-09-12", "09:00:00", 2, "online", "https://meet.google.com/osta-demo", 100],
      ["OSTA Community Football Match", "Football Match", "A friendly community football match and networking activity.", "2026-09-19", "15:00:00", 2, "in-person", "Addis Ababa Community Field", 60],
      ["OSTA Innovation Showcase", "Showcase", "A public showcase of learner projects, ideas, and startups.", "2026-09-26", "10:00:00", 3, "hybrid", "OSTA Innovation Hall", 150],
      ["OSTA Team Planning Meeting", "Meeting", "A project planning and coordination meeting.", "2026-09-29", "14:00:00", 1, "online", "https://meet.google.com/osta-planning", 30],
    ];
    for (const [title, category, description, date, time, duration, mode, location, capacity] of eventData) {
      const [rows] = await pool.execute("SELECT id FROM events WHERE title=? LIMIT 1", [title]);
      if (!rows[0]) {
        await pool.execute(
          `INSERT INTO events
           (instructor_id,title,category,description,event_date,start_time,duration_hours,delivery_mode,location_or_link,capacity,status)
           VALUES (?,?,?,?,?,?,?,?,?,?, 'published')`,
          [instructor.id, title, category, description, date, time, duration, mode, location, capacity]
        );
      }
    }

    const ideaTitle = "Offline-First Learning Access for Rural Communities";
    const [ideaRows] = await pool.execute("SELECT id FROM innovation_ideas WHERE title=? LIMIT 1", [ideaTitle]);
    if (!ideaRows[0]) {
      await pool.execute(
        `INSERT INTO innovation_ideas (user_id,title,description,problem,solution,status,category,votes)
         VALUES (?,?,?,?,?,'published',?,0)`,
        [student.id, ideaTitle,
         "A lightweight learning mode that lets learners download selected lessons and synchronize progress when connectivity returns.",
         "Learners in low-connectivity areas can struggle to maintain continuous access to online learning.",
         "Provide a controlled offline learning package with later synchronization of progress and assessments.",
         "Education Technology"]
      );
    }

    const startupTitle = "EduLink Ethiopia";
    const [startupRows] = await pool.execute("SELECT id FROM startups WHERE name=? LIMIT 1", [startupTitle]);
    if (!startupRows[0]) {
      await pool.execute(
        `INSERT INTO startups (founder_id,name,description,stage,website,category)
         VALUES (?,?,?,?,?,?)`,
        [student.id, startupTitle,
         "A digital platform connecting learners, mentors, instructors, and practical opportunities across Ethiopia.",
         "Growth", "https://example.org/edulink-ethiopia", "EdTech"]
      );
    }

    const [researcherRows] = await pool.execute("SELECT id FROM researchers WHERE user_id=? LIMIT 1", [student.id]);
    let researcherId = researcherRows[0]?.id;
    if (!researcherId) {
      const [result] = await pool.execute(
        `INSERT INTO researchers (user_id,organization,designation,bio,field,affiliation)
         VALUES (?,?,?,?,?,?)`,
        [student.id, "OSTA Research Community", "Student Researcher", "Interested in educational technology and accessible digital learning.", "Educational Technology", "OSTA Learning & Innovation Platform"]
      );
      researcherId = result.insertId;
    }
    const publicationTitle = "Designing Accessible Digital Learning for Low-Connectivity Environments";
    const [publicationRows] = await pool.execute("SELECT id FROM publications WHERE title=? LIMIT 1", [publicationTitle]);
    if (!publicationRows[0]) {
      await pool.execute(
        `INSERT INTO publications (researcher_id,title,abstract,publication_url,status,field,publication_year)
         VALUES (?,?,?,?, 'published',?,?)`,
        [researcherId, publicationTitle,
         "This study explores practical design principles for learning platforms that remain useful when internet connectivity is limited.",
         "https://example.org/osta-research/accessible-learning", "Educational Technology", 2026]
      );
    }

    await seedBooks(instructor.id);

    await connection.commit();

    console.log("\nOSTA real-content seed completed successfully.");
    console.log(`Student: ${student.email}`);
    console.log(`Instructor: ${instructor.email}`);
    console.log(`Courses: 3 (2 free, 1 paid)`);
    console.log("Books: 2");
    console.log("Competitions: 2");
    console.log("Events: 4");
    console.log("Assignments: 1 submitted/pending + 1 graded");
    console.log("Private student/instructor question: ready");
    console.log("Community topics: one for every active registered user");
    console.log("Innovation idea, startup, and publication: published");
    console.log("Quiz: Web Development Fundamentals Quiz with 3 questions");
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

seed()
  .catch((error) => {
    console.error("Real-content seed failed:", error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
