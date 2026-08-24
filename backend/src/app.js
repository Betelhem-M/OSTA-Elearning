const express = require("express");

const cors = require("cors");

const authRoutes =
  require("./routes/authRoutes");

const authMiddleware =
  require("./middleware/authMiddleware");

const errorMiddleware =
  require("./middleware/errorMiddleware");

const quizRoutes =
  require("./routes/quizRoutes");

const courseRoutes =
  require("./routes/courseRoutes");

const lessonRoutes =
  require("./routes/lessonRoutes");

const courseSectionRoutes =
  require("./routes/courseSectionRoutes");

const lessonProgressRoutes =
  require("./routes/lessonProgressRoutes");

const enrollmentRoutes =
  require("./routes/enrollmentRoutes");

const certificateRoutes =
  require("./routes/certificateRoutes");

const discussionRoutes =
  require("./routes/discussionRoutes");

const notificationRoutes =
  require("./routes/notificationRoutes");

const eventRoutes =
  require("./routes/eventRoutes");

const competitionRoutes =
  require("./routes/competitionRoutes");

const innovationRoutes =
  require("./routes/innovationRoutes");

const assignmentRoutes =
  require("./routes/assignmentRoutes");

const adminRoutes =
  require("./routes/adminRoutes");

const researchRoutes =
  require("./routes/researchRoutes");

const hackathonRoutes =
  require("./routes/hackathonRoutes");

const categoryRoutes =
  require("./routes/categoryRoutes");

const instructorRoutes =
  require("./routes/instructorRoutes");

const userRoutes =
  require("./routes/userRoutes");

const path = require("path");

const app = express();

app.use(cors());

app.use(express.json());

/* =========================
   PUBLIC / GENERAL ROUTES
========================= */

app.get("/", (req, res) => {
  res.json({
    message:
      "OSTA-Elearning API is running",
  });
});

/* =========================
   AUTH ROUTES
========================= */

app.use(
  "/api/auth",
  authRoutes
);

app.get(
  "/api/auth/me",
  authMiddleware,
  (req, res) => {
    res.json({
      message:
        "Authenticated successfully",
      user: req.user,
    });
  }
);

/* =========================
   USER ROUTES
========================= */

app.use(
  "/api/users",
  userRoutes
);

/* =========================
   COURSE / LEARNING ROUTES
========================= */

app.use(
  "/api/courses",
  courseRoutes
);

app.use(
  "/api/categories",
  categoryRoutes
);

app.use(
  "/api/instructor",
  instructorRoutes
);

app.use(
  "/api/course-sections",
  courseSectionRoutes
);

app.use(
  "/api/lessons",
  lessonRoutes
);

app.use(
  "/api/enrollments",
  enrollmentRoutes
);

app.use(
  "/api/progress",
  lessonProgressRoutes
);

/* =========================
   ASSESSMENT ROUTES
========================= */

app.use(express.json());

app.use(
  "/uploads",
  express.static(
    path.join(
      __dirname,
      "uploads"
    )
  )
);

app.use(
  "/api/assignments",
  assignmentRoutes
);

app.use(
  "/api/quizzes",
  quizRoutes
);

/* =========================
   CERTIFICATE ROUTES
========================= */

app.use(
  "/api/certificates",
  certificateRoutes
);

/* =========================
   COMMUNITY ROUTES
========================= */

app.use(
  "/api/discussions",
  discussionRoutes
);

app.use(
  "/api/notifications",
  notificationRoutes
);

/* =========================
   EVENTS / COMPETITIONS
========================= */

app.use(
  "/api/hackathons",
  hackathonRoutes
);

app.use(
  "/api/events",
  eventRoutes
);

app.use(
  "/api/competitions",
  competitionRoutes
);

/* =========================
   INNOVATION
========================= */

app.use(
  "/api/innovation",
  innovationRoutes
);

/* =========================
   RESEARCH
========================= */

app.use(
  "/api/research",
  researchRoutes
);

/* =========================
   ADMIN
========================= */

app.use(
  "/api/admin",
  adminRoutes
);

/* =========================
   ERROR HANDLER
========================= */

app.use(errorMiddleware);

module.exports = app;