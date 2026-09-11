require("dotenv").config();
const pool = require("./database");

// These are real, publicly accessible educational videos. OSTA stores the source URL;
// it does not claim ownership of the third-party video content.
const VIDEOS = {
  internet: "https://www.youtube.com/watch?v=Dxcc6ycZ73M",
  http: "https://www.youtube.com/watch?v=kBXQZMmiA4s",
  ml: "https://www.youtube.com/watch?v=OeU5m6vRyCk",
  bias: "https://www.youtube.com/watch?v=x2mRoFNm22g",
  python: "https://www.youtube.com/watch?v=rfscVS0vtbw",
};

const COURSES = [
  {
    title: "Digital Innovation & Technology Foundations",
    price: 0,
    level: "Beginner",
    category: "Innovation & Technology",
    description:
      "A practical introduction to digital innovation, the Internet, artificial intelligence, cybersecurity, technology research, and responsible innovation. Learners move from core concepts to a practical technology solution project.",
    longDescription:
      "This free foundation course introduces learners to digital innovation and modern technology through real educational resources. It covers the Internet, HTTP and HTML, artificial intelligence, machine learning, training data and bias, cybersecurity, research, ideation, prototyping, and responsible technology. Learners complete quizzes and two assessed assignments and finish with a practical innovation project. Third-party video lessons are clearly attributed to their original publishers.",
    sourceNote: "Third-party videos: Code.org. Course activities and assessment are OSTA educational content.",
    sections: [
      {
        title: "Section 1 — Understanding Digital Innovation",
        description: "Define digital innovation, connect technology with social needs, and recognize different forms of innovation.",
        lessons: [
          ["1.1 What Is Digital Innovation?", "Digital innovation applies digital technologies to create or significantly improve products, services, processes, or ways of solving problems.", VIDEOS.ml, 18],
          ["1.2 Technology and Society", "Explore how technology changes education, health, government, business, communication, and everyday life, including benefits and risks.", VIDEOS.internet, 20],
          ["1.3 Types of Innovation", "Compare product, process, service, and business-model innovation and identify examples from real digital services.", VIDEOS.internet, 17],
        ],
        quiz: [
          ["Which statement best describes digital innovation?", ["Using digital technology to create or substantially improve a solution", "Replacing every human activity with a computer", "Only creating mobile applications", "Only inventing new computer hardware"], 0],
          ["Which is an example of a digital service?", ["Online banking", "A wooden desk", "A paper notebook", "A mechanical key"], 0],
          ["Why should an innovation begin with a problem or need?", ["It helps ensure the solution creates meaningful value", "It guarantees the technology will make money", "It removes the need for testing", "It means users are no longer needed"], 0],
        ],
      },
      {
        title: "Section 2 — How the Internet Works",
        description: "Understand clients, servers, packets, IP addressing, DNS, HTTP, HTML, and basic web communication.",
        lessons: [
          ["2.1 What Is the Internet?", "Learn how interconnected networks exchange data using packets and communication protocols.", VIDEOS.internet, 25],
          ["2.2 HTTP and HTML", "Understand the browser-server request/response model and the roles of HTTP and HTML.", VIDEOS.http, 22],
          ["2.3 From Domain Name to Web Page", "Trace a simplified path from a domain name through DNS and HTTP to a rendered web page.", VIDEOS.http, 20],
        ],
        quiz: [
          ["What does DNS primarily do?", ["Maps domain names to network addresses", "Encrypts every database record", "Creates HTML pages", "Stores browser passwords"], 0],
          ["What is HTTP used for?", ["Communication between web clients and servers", "Formatting a spreadsheet", "Compressing a hard drive", "Creating a Wi-Fi password"], 0],
          ["What is HTML primarily used for?", ["Structuring web-page content", "Training machine-learning models", "Managing SQL transactions", "Encrypting network packets"], 0],
        ],
      },
      {
        title: "Section 3 — Artificial Intelligence",
        description: "Introduce machine learning, training data, bias, neural networks, computer vision, and generative AI concepts.",
        lessons: [
          ["3.1 What Is Machine Learning?", "Machine learning enables systems to learn patterns from data and use those patterns to make predictions or decisions.", VIDEOS.ml, 20],
          ["3.2 Training Data and Bias", "Understand why the quality and representativeness of training data can affect model behavior and outcomes.", VIDEOS.bias, 18],
          ["3.3 AI in Everyday Applications", "Connect AI concepts to recommendation systems, image recognition, language tools, and other common applications.", VIDEOS.ml, 20],
        ],
        quiz: [
          ["What is training data used for in supervised machine learning?", ["Providing examples from which a model can learn relationships", "Replacing the computer operating system", "Encrypting a web server", "Creating physical network cables"], 0],
          ["Why can biased training data be a problem?", ["It can lead a model to learn and reproduce systematic patterns that are unfair or inaccurate", "It always makes a model faster", "It removes the need for evaluation", "It guarantees perfect predictions"], 0],
          ["Which task is a common AI application?", ["Image classification", "Changing a monitor cable", "Formatting a USB drive", "Printing a paper document"], 0],
        ],
      },
      {
        title: "Section 4 — Cybersecurity and Responsible Technology",
        description: "Build awareness of account security, encryption, privacy, data protection, and responsible technology use.",
        lessons: [
          ["4.1 Cybersecurity Fundamentals", "Identify common security risks and the importance of protecting accounts, devices, applications, and data.", VIDEOS.http, 20],
          ["4.2 Encryption and Secure Communication", "Explain at a high level how encryption protects information while it is being transmitted or stored.", VIDEOS.http, 21],
          ["4.3 Responsible Technology", "Consider privacy, safety, fairness, accessibility, and human impact when designing or deploying technology.", VIDEOS.bias, 18],
        ],
        quiz: [
          ["Which practice improves account security?", ["Using strong unique passwords and multi-factor authentication", "Sharing passwords publicly", "Reusing one password everywhere", "Disabling security updates"], 0],
          ["What is encryption intended to provide?", ["Protection of information by transforming it into a form that unauthorized parties should not be able to read", "A faster CPU", "A larger monitor", "A new database table"], 0],
          ["Why should privacy be considered in system design?", ["Technology can collect and process information about real people", "Privacy only matters for paper documents", "Privacy prevents all innovation", "Privacy removes the need for security"], 0],
        ],
      },
      {
        title: "Section 5 — Research and Ideation",
        description: "Move from a real problem to evidence, user needs, a problem statement, and a technology idea.",
        lessons: [
          ["5.1 Finding a Real Problem", "Identify a concrete problem in education, health, agriculture, business, government, transport, or another community domain.", VIDEOS.internet, 18],
          ["5.2 Researching Existing Solutions", "Compare existing solutions, their users, strengths, limitations, and evidence before proposing something new.", VIDEOS.bias, 18],
          ["5.3 From Problem Statement to Idea", "Turn research findings into a focused problem statement and an initial digital solution concept.", VIDEOS.ml, 20],
        ],
        quiz: [
          ["What is the purpose of a problem statement?", ["To clearly define the problem, affected users, and context", "To describe the final source code", "To guarantee funding", "To replace user research"], 0],
          ["Why investigate existing solutions?", ["To learn what already works and where meaningful gaps remain", "To avoid talking to users", "To guarantee a competitor will fail", "To remove the need for evidence"], 0],
          ["Which sequence is most useful for innovation work?", ["Problem → users → evidence → solution idea", "Solution → users → ignore evidence → problem", "Code → launch → discover problem", "Logo → payment → research"], 0],
        ],
      },
      {
        title: "Section 6 — Prototype and Final Innovation Project",
        description: "Turn an idea into a testable prototype, gather feedback, and present a responsible technology solution.",
        lessons: [
          ["6.1 Defining Requirements", "Translate user needs into functional and non-functional requirements that can guide implementation.", VIDEOS.http, 20],
          ["6.2 Creating and Testing a Prototype", "Create a low- or high-fidelity prototype, test important assumptions, and record user feedback.", VIDEOS.ml, 22],
          ["6.3 Presenting an Innovation", "Present the problem, evidence, solution, technology, impact, limitations, and next steps clearly.", VIDEOS.bias, 18],
        ],
        quiz: [
          ["What is the main purpose of a prototype?", ["To test important assumptions and communicate a proposed solution", "To guarantee the final product is bug-free", "To replace all research", "To avoid collecting feedback"], 0],
          ["Which is a functional requirement?", ["The system allows a learner to submit an assignment", "The interface should feel trustworthy", "The page should look professional", "The system should be easy to learn"], 0],
          ["What should a final innovation presentation include?", ["The problem, evidence, proposed solution, impact, and limitations", "Only the project logo", "Only source code", "Only the price"], 0],
        ],
      },
    ],
    assignments: [
      {
        title: "Assignment 1 — Problem Discovery",
        description: "Identify one real problem affecting a community or organization and research it before proposing a technology solution.",
        instructions: "Submit a PDF containing: problem title; problem description; affected users; evidence; current solution; limitations; proposed technology solution; and expected benefits. Recommended length: 500–800 words.",
        points: 100,
        fileTypes: "pdf,doc,docx",
        lessonSection: 5,
      },
      {
        title: "Assignment 2 — Final Innovation Project",
        description: "Design a practical digital solution for a real problem and present the solution as a small innovation project.",
        instructions: "Submit a PDF plus optional prototype URL. Include problem statement, user research, proposed solution, core features, system diagram, prototype/screenshots, technology stack, implementation plan, risks, ethical considerations, and expected impact.",
        points: 100,
        fileTypes: "pdf,doc,docx,zip",
        lessonSection: 6,
      },
    ],
  },
  {
    title: "Python Programming for Data and AI Foundations",
    price: 100,
    level: "Beginner",
    category: "Programming & Artificial Intelligence",
    description:
      "A practical Python course that progresses from programming fundamentals to data handling and introductory machine learning. Includes real video instruction, quizzes, programming assignments, and a final AI project.",
    longDescription:
      "This paid 100 ETB course is designed for learners who want a practical path from Python fundamentals toward data and AI. It covers variables, strings, control flow, data structures, functions, files, object-oriented programming, data preparation, machine-learning concepts, classification, regression, and model evaluation. Learners complete programming assignments and a final machine-learning project. The main programming video is the real freeCodeCamp.org Python course; AI concept lessons use real Code.org educational videos.",
    sourceNote: "Third-party videos: freeCodeCamp.org and Code.org. Course activities and assessment are OSTA educational content.",
    sections: [
      {
        title: "Section 1 — Python Fundamentals",
        description: "Learn Python syntax, variables, data types, strings, input, and basic program structure.",
        lessons: [
          ["1.1 Getting Started with Python", "Understand Python programs, the interpreter, editors, running scripts, and basic output.", VIDEOS.python, 35],
          ["1.2 Variables and Data Types", "Work with integers, floats, strings, booleans, variables, and type conversion.", VIDEOS.python, 35],
          ["1.3 Strings and User Input", "Use strings, string methods, input, formatting, and basic validation.", VIDEOS.python, 30],
        ],
        quiz: [
          ["Which Python type represents whole numbers?", ["int", "str", "list", "bool"], 0],
          ["What does input() normally return?", ["A string", "A list", "A dictionary", "A file object"], 0],
          ["Which operation converts a numeric string to an integer?", ["int(value)", "str(value)", "list(value)", "bool(value)"], 0],
        ],
      },
      {
        title: "Section 2 — Control Flow",
        description: "Use conditions, comparisons, logical operators, loops, and iteration to control program behavior.",
        lessons: [
          ["2.1 Conditional Statements", "Use if, elif, and else to make decisions in Python programs.", VIDEOS.python, 35],
          ["2.2 Comparison and Logical Operators", "Combine comparisons with and, or, and not to express program conditions.", VIDEOS.python, 30],
          ["2.3 For and While Loops", "Repeat operations using for and while loops and control iteration safely.", VIDEOS.python, 35],
        ],
        quiz: [
          ["Which keyword starts a conditional branch in Python?", ["if", "loop", "case", "when"], 0],
          ["Which loop is commonly used to iterate through items in a sequence?", ["for", "switch", "repeat-until", "select"], 0],
          ["What does break do inside a loop?", ["Stops the loop immediately", "Restarts the program", "Creates a function", "Sorts the list"], 0],
        ],
      },
      {
        title: "Section 3 — Python Data Structures",
        description: "Store and organize collections using lists, tuples, dictionaries, and sets.",
        lessons: [
          ["3.1 Lists and Tuples", "Create sequences, access elements, slice collections, and understand mutable versus immutable sequences.", VIDEOS.python, 35],
          ["3.2 Dictionaries", "Store key-value data and retrieve, update, and iterate through dictionary entries.", VIDEOS.python, 30],
          ["3.3 Sets and Choosing a Structure", "Use sets for unique values and choose an appropriate data structure for a task.", VIDEOS.python, 25],
        ],
        quiz: [
          ["Which structure stores key-value pairs?", ["Dictionary", "Tuple", "Set", "String"], 0],
          ["What is a useful property of a set?", ["It stores unique elements", "It always preserves duplicate elements", "It only stores strings", "It requires numeric keys"], 0],
          ["Which Python collection is mutable?", ["List", "Tuple", "String", "Integer"], 0],
        ],
      },
      {
        title: "Section 4 — Functions, Files, and OOP",
        description: "Write reusable functions, handle errors, work with files, and understand classes and objects.",
        lessons: [
          ["4.1 Functions and Return Values", "Create reusable functions with parameters and return values.", VIDEOS.python, 35],
          ["4.2 Files and Error Handling", "Read and write files and handle expected runtime errors with exceptions.", VIDEOS.python, 35],
          ["4.3 Classes and Objects", "Understand classes, objects, constructors, attributes, methods, and basic inheritance.", VIDEOS.python, 40],
        ],
        quiz: [
          ["What is the purpose of a return statement?", ["It sends a value back from a function", "It creates a loop", "It deletes a variable", "It imports a package"], 0],
          ["Which construct is used to catch an exception?", ["except", "catch", "rescue", "handle"], 0],
          ["What is an object in object-oriented programming?", ["An instance of a class", "A Python keyword", "A database table", "A loop condition"], 0],
        ],
      },
      {
        title: "Section 5 — Python for Data",
        description: "Prepare data for analysis and connect programming skills with data and machine-learning workflows.",
        lessons: [
          ["5.1 Structured Data and CSV", "Understand rows, columns, fields, records, and common CSV workflows.", VIDEOS.python, 30],
          ["5.2 Data Cleaning Fundamentals", "Identify missing, invalid, inconsistent, or duplicated data and plan basic cleaning steps.", VIDEOS.python, 30],
          ["5.3 Features and Labels", "Understand the difference between input features and target labels in supervised learning datasets.", VIDEOS.ml, 25],
        ],
        quiz: [
          ["What is a feature in a supervised-learning dataset?", ["An input variable used by the model", "Always the final prediction", "A database password", "A Python package"], 0],
          ["What is a label or target?", ["The value the model is trained to predict", "A file extension", "A loop counter", "A network protocol"], 0],
          ["Why clean data before modeling?", ["Poor-quality data can reduce the reliability of analysis and models", "Cleaning guarantees perfect accuracy", "Cleaning replaces model evaluation", "Cleaning removes the need for features"], 0],
        ],
      },
      {
        title: "Section 6 — Introduction to Machine Learning",
        description: "Understand machine learning workflows and apply introductory classification and regression concepts.",
        lessons: [
          ["6.1 What Is Machine Learning?", "Introduce supervised learning, patterns, training data, predictions, and practical ML applications.", VIDEOS.ml, 20],
          ["6.2 Training and Testing Data", "Understand why datasets are separated for learning and evaluation and why evaluation must use unseen data.", VIDEOS.ml, 22],
          ["6.3 Classification, Regression, and Evaluation", "Distinguish classification from regression and introduce accuracy, error, and model evaluation.", VIDEOS.ml, 25],
        ],
        quiz: [
          ["Which task is classification?", ["Predicting whether a student will pass or fail", "Predicting a house price as a number", "Sorting a Python list alphabetically", "Counting lines in a file"], 0],
          ["Why keep test data separate from training data?", ["To evaluate how the model performs on data it did not learn from", "To make the dataset larger", "To remove all errors", "To avoid selecting features"], 0],
          ["Which is a regression target?", ["A numeric house price", "Pass or fail", "Spam or not spam", "Cat or dog"], 0],
        ],
      },
      {
        title: "Section 7 — Practical Machine Learning Project",
        description: "Apply Python and introductory machine learning to a small end-to-end prediction project.",
        lessons: [
          ["7.1 Preparing a Prediction Dataset", "Define the target, inspect features, identify missing values, and prepare data for a model.", VIDEOS.ml, 25],
          ["7.2 Training a Classification Model", "Train a simple classification model and make predictions on held-out examples.", VIDEOS.ml, 25],
          ["7.3 Evaluating and Explaining Results", "Measure performance, inspect errors, discuss limitations, and communicate results responsibly.", VIDEOS.ml, 25],
        ],
        quiz: [
          ["What is the purpose of model evaluation?", ["To measure how well the trained model performs on evaluation data", "To rename Python variables", "To install an operating system", "To create a database user"], 0],
          ["Why should a model's limitations be reported?", ["Results can depend on data quality, assumptions, and the chosen method", "Limitations are only needed when the model is perfect", "Limitations make testing unnecessary", "Limitations replace documentation"], 0],
          ["Which is an appropriate final ML project output?", ["Code, evaluation results, explanation, and documented limitations", "Only a logo", "Only a screenshot of Python", "Only the dataset filename"], 0],
        ],
      },
    ],
    assignments: [
      {
        title: "Assignment 1 — Student Grade Manager",
        description: "Build a Python program that stores student names and grades and produces a useful summary report.",
        instructions: "Submit a .py file. The program must accept student names and grades, calculate the average, determine pass/fail, find the highest and lowest scores, and display a readable report. Include a short README explaining how to run it.",
        points: 100,
        fileTypes: "py,zip,pdf",
        lessonSection: 3,
      },
      {
        title: "Assignment 2 — Student Performance Prediction",
        description: "Build a small machine-learning project that predicts whether a student will pass or fail from study and performance features.",
        instructions: "Submit Python code plus a PDF report. The report must cover the dataset, data preparation, features and target, training/testing split, model, evaluation result, limitations, and conclusion. Screenshots are encouraged.",
        points: 100,
        fileTypes: "py,zip,pdf",
        lessonSection: 7,
      },
    ],
  },
];

async function findAccount(type) {
  const [rows] = await pool.execute(
    `SELECT id, first_name, last_name, email, role, account_type
     FROM users
     WHERE status='active' AND (LOWER(role)=LOWER(?) OR LOWER(account_type)=LOWER(?))
     ORDER BY id LIMIT 1`,
    [type, type]
  );
  if (!rows[0]) throw new Error(`An active ${type} account is required before running the master course seed.`);
  return rows[0];
}

async function category(name) {
  const [rows] = await pool.execute("SELECT id FROM categories WHERE name=? LIMIT 1", [name]);
  if (rows[0]) return rows[0].id;
  const [result] = await pool.execute(
    "INSERT INTO categories(name,description) VALUES(?,?)",
    [name, `Educational category for ${name}.`]
  );
  return result.insertId;
}

async function course(course, instructorId) {
  const categoryId = await category(course.category);
  const [existing] = await pool.execute("SELECT id FROM courses WHERE title=? LIMIT 1", [course.title]);
  let courseId;
  if (existing[0]) {
    courseId = existing[0].id;
    await pool.execute(
      `UPDATE courses SET description=?, long_description=?, instructor_id=?, category_id=?, level=?, price=?, status='published'
       WHERE id=?`,
      [course.description, course.longDescription, instructorId, categoryId, course.level, course.price, courseId]
    );
  } else {
    const [result] = await pool.execute(
      `INSERT INTO courses(title,description,long_description,instructor_id,category_id,level,price,thumbnail_color,status)
       VALUES(?,?,?,?,?,?,?,?, 'published')`,
      [course.title, course.description, course.longDescription, instructorId, categoryId, course.level, course.price, course.price > 0 ? "#F59E0B" : "#1565C0"]
    );
    courseId = result.insertId;
  }

  const lessonIds = [];
  for (let sectionIndex = 0; sectionIndex < course.sections.length; sectionIndex += 1) {
    const section = course.sections[sectionIndex];
    const [sectionRows] = await pool.execute(
      "SELECT id FROM course_sections WHERE course_id=? AND title=? LIMIT 1",
      [courseId, section.title]
    );
    let sectionId = sectionRows[0]?.id;
    if (!sectionId) {
      const [result] = await pool.execute(
        "INSERT INTO course_sections(course_id,title,section_order,description) VALUES(?,?,?,?)",
        [courseId, section.title, sectionIndex + 1, section.description]
      );
      sectionId = result.insertId;
    } else {
      await pool.execute("UPDATE course_sections SET section_order=?,description=? WHERE id=?", [sectionIndex + 1, section.description, sectionId]);
    }

    const sectionLessons = [];
    for (let lessonIndex = 0; lessonIndex < section.lessons.length; lessonIndex += 1) {
      const [title, description, videoUrl, minutes] = section.lessons[lessonIndex];
      const [lessonRows] = await pool.execute(
        "SELECT id FROM lessons WHERE course_id=? AND title=? LIMIT 1",
        [courseId, title]
      );
      let lessonId = lessonRows[0]?.id;
      if (!lessonId) {
        const [result] = await pool.execute(
          `INSERT INTO lessons(course_id,section_id,title,description,content,video_url,duration_minutes,position,resource_url)
           VALUES(?,?,?,?,?,?,?,?,?)`,
          [courseId, sectionId, title, description, description, videoUrl, minutes, lessonIndex + 1, videoUrl]
        );
        lessonId = result.insertId;
      } else {
        await pool.execute(
          `UPDATE lessons SET section_id=?,description=?,content=?,video_url=?,duration_minutes=?,position=?,resource_url=? WHERE id=?`,
          [sectionId, description, description, videoUrl, minutes, lessonIndex + 1, videoUrl, lessonId]
        );
      }
      sectionLessons.push(lessonId);
      lessonIds.push(lessonId);
    }

    const quizTitle = `${section.title} — Knowledge Check`;
    const [quizRows] = await pool.execute("SELECT id FROM quizzes WHERE course_id=? AND title=? LIMIT 1", [courseId, quizTitle]);
    let quizId = quizRows[0]?.id;
    if (!quizId) {
      const [result] = await pool.execute(
        "INSERT INTO quizzes(course_id,lesson_id,title,description) VALUES(?,?,?,?)",
        [courseId, sectionLessons[sectionLessons.length - 1], quizTitle, `Knowledge check for ${section.title}. Pass mark: 70%.`]
      );
      quizId = result.insertId;
    } else {
      await pool.execute("UPDATE quizzes SET lesson_id=?,description=? WHERE id=?", [sectionLessons[sectionLessons.length - 1], `Knowledge check for ${section.title}. Pass mark: 70%.`, quizId]);
    }

    for (let qIndex = 0; qIndex < section.quiz.length; qIndex += 1) {
      const [prompt, options, correct] = section.quiz[qIndex];
      const [questionRows] = await pool.execute("SELECT id FROM questions WHERE quiz_id=? AND prompt=? LIMIT 1", [quizId, prompt]);
      let questionId = questionRows[0]?.id;
      if (!questionId) {
        const [result] = await pool.execute(
          "INSERT INTO questions(quiz_id,prompt,question_type,points) VALUES(?,?,?,?)",
          [quizId, prompt, "multiple_choice", 1]
        );
        questionId = result.insertId;
      } else {
        await pool.execute("UPDATE questions SET points=1 WHERE id=?", [questionId]);
      }
      for (let optionIndex = 0; optionIndex < options.length; optionIndex += 1) {
        const [optionRows] = await pool.execute(
          "SELECT id FROM question_options WHERE question_id=? AND option_text=? LIMIT 1",
          [questionId, options[optionIndex]]
        );
        if (optionRows[0]) {
          await pool.execute("UPDATE question_options SET is_correct=? WHERE id=?", [optionIndex === correct ? 1 : 0, optionRows[0].id]);
        } else {
          await pool.execute(
            "INSERT INTO question_options(question_id,option_text,is_correct) VALUES(?,?,?)",
            [questionId, options[optionIndex], optionIndex === correct ? 1 : 0]
          );
        }
      }
    }
  }

  for (const assignment of course.assignments) {
    const lessonId = lessonIds[Math.max(0, Math.min(lessonIds.length - 1, assignment.lessonSection * 3 - 1))];
    const [assignmentRows] = await pool.execute(
      "SELECT id FROM assignments WHERE course_id=? AND title=? LIMIT 1",
      [courseId, assignment.title]
    );
    if (assignmentRows[0]) {
      await pool.execute(
        `UPDATE assignments SET description=?,points,status='published',lesson_id=?,instructions=?,allowed_file_types=?,max_file_size_mb=? WHERE id=?`,
        [assignment.description, assignment.points, lessonId, assignment.instructions, assignment.fileTypes, 10, assignmentRows[0].id]
      );
    } else {
      await pool.execute(
        `INSERT INTO assignments(course_id,title,description,points,due_date,status,lesson_id,instructions,allowed_file_types,max_file_size_mb)
         VALUES(?,?,?,?,?,?,?,?,?,?)`,
        [courseId, assignment.title, assignment.description, assignment.points, "2026-12-31 23:59:00", "published", lessonId, assignment.instructions, assignment.fileTypes, 10]
      );
    }
  }

  return courseId;
}

async function main() {
  const instructor = await findAccount("instructor");
  const student = await findAccount("student");

  const courseIds = [];
  for (const courseData of COURSES) {
    const courseId = await course(courseData, instructor.id);
    courseIds.push(courseId);
  }

  // Free course is enrolled for the demo learner so progress/lesson/quiz/assignment
  // features can be tested immediately. The paid course is deliberately NOT enrolled:
  // its 100 ETB price should exercise the real paid-enrollment flow.
  await pool.execute(
    "INSERT INTO enrollments(user_id,course_id,status) VALUES(?,?, 'active') ON DUPLICATE KEY UPDATE status='active'",
    [student.id, courseIds[0]]
  );

  console.log("Master courses seeded successfully.");
  console.log(`Instructor: ${instructor.email}`);
  console.log(`Demo learner: ${student.email}`);
  console.log(`Free course ID: ${courseIds[0]}`);
  console.log(`Paid course ID: ${courseIds[1]} — price: 100 ETB`);
  console.log("Paid course is intentionally not enrolled so the real payment/enrollment flow can be tested.");
}

main()
  .catch((error) => {
    console.error("Master course seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
