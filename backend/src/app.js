const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const authRoutes = require("./routes/authRoutes");
const quizRoutes = require("./routes/quizRoutes");
const quizAttemptRoutes =require("./routes/quizAttemptRoutes");
const courseRoutes = require("./routes/courseRoutes");
const lessonRoutes = require("./routes/lessonRoutes");
const courseSectionRoutes = require("./routes/courseSectionRoutes");
const lessonProgressRoutes = require("./routes/lessonProgressRoutes");
const enrollmentRoutes = require("./routes/enrollmentRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const instructorPaymentRoutes = require("./routes/instructorPaymentRoutes");
const certificateRoutes = require("./routes/certificateRoutes");
const discussionRoutes = require("./routes/discussionRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const competitionRoutes = require("./routes/competitionRoutes");
const innovationRoutes = require("./routes/innovationRoutes");
const assignmentRoutes = require("./routes/assignmentRoutes");
const adminRoutes = require("./routes/adminRoutes");

const hackathonRoutes = require("./routes/hackathonRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const instructorRoutes = require("./routes/instructorRoutes");
const userRoutes = require("./routes/userRoutes");
const studentRoutes = require("./routes/studentRoutes");
const noteRoutes = require("./routes/noteRoutes");
const eventRoutes = require("./routes/eventRoutes");
const researchRoutes = require("./routes/researchRoutes");
const featureRoutes = require("./routes/featureRoutes");
const portalRoutes = require("./routes/portalRoutes");
const instructorProgressRoutes =
  require("./routes/instructorProgressRoutes");

const authMiddleware =
  require("./middleware/authMiddleware");

const errorMiddleware =
  require("./middleware/errorMiddleware");

const app = express();


// =====================================================
// GLOBAL MIDDLEWARE
// =====================================================

// Allow configuring allowed CORS origins via CORS_ORIGIN env var
// Example: CORS_ORIGIN="https://mydomain.com,https://www.mydomain.com"
const DEFAULT_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
];

const allowedOrigins = (process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",")
  : DEFAULT_ORIGINS
).map((o) => o.trim()).filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      }

      // In production you may want to be strict. For now reject unknown origins.
      return callback(new Error('CORS policy: Origin not allowed'), false);
    },
    credentials: true,
  })
);

app.use(express.json());

app.use(express.urlencoded({
  extended: true,
}));


// =====================================================
// HEALTH CHECK
// =====================================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "OSTA-Elearning API is running",
    timestamp: new Date().toISOString(),
  });
});


// =====================================================
// STATIC FILES (uploads)
// =====================================================

app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "uploads")
  )
);


// =====================================================
// AUTH
// =====================================================

app.use(
  "/api/auth",
  authRoutes
);

app.get(
  "/api/auth/me",
  authMiddleware,
  (req, res) => {
    res.status(200).json({
      success: true,
      user: req.user,
    });
  }
);


// =====================================================
// USERS
// =====================================================

app.use(
  "/api/users",
  userRoutes
);


// =====================================================
// STUDENT
// =====================================================

app.use(
  "/api/student",
  studentRoutes
);


// =====================================================
// COURSES
// =====================================================

app.use(
  "/api/courses",
  courseRoutes
);


// =====================================================
// LESSONS
// =====================================================

app.use(
  "/api/lessons",
  lessonRoutes
);


// =====================================================
// COURSE SECTIONS
// =====================================================

app.use(
  "/api/course-sections",
  courseSectionRoutes
);


// =====================================================
// ENROLLMENTS
// =====================================================

app.use(
  "/api/enrollments",
  enrollmentRoutes
);

// =====================================================
// PAYMENTS
// =====================================================

app.use(
  "/api/payments",
  paymentRoutes
);

app.use(
  "/api/instructor/payment-accounts",
  instructorPaymentRoutes
);


// =====================================================
// PROGRESS
// =====================================================

app.use(
  "/api/progress",
  lessonProgressRoutes
);


// =====================================================
// QUIZZES
// =====================================================

app.use("/api/quizzes", quizRoutes);

app.use(
  "/api",
  quizAttemptRoutes
);

// =====================================================
// ASSIGNMENTS
// =====================================================

app.use(
  "/api/assignments",
  assignmentRoutes
);


// =====================================================
// CERTIFICATES
// =====================================================

app.use(
  "/api/certificates",
  certificateRoutes
);


// =====================================================
// NOTIFICATIONS
// =====================================================

app.use(
  "/api/notifications",
  notificationRoutes
);


// =====================================================
// DISCUSSIONS
// =====================================================

app.use(
  "/api/discussions",
  discussionRoutes
);


// =====================================================
// EVENTS
// =====================================================

app.use("/api/events", eventRoutes);


// =====================================================
// COMPETITIONS
// =====================================================

app.use(
  "/api/competitions",
  competitionRoutes
);


// =====================================================
// HACKATHONS
// =====================================================

app.use(
  "/api/hackathons",
  hackathonRoutes
);


// =====================================================
// INNOVATION
// =====================================================

app.use(
  "/api/innovation",
  innovationRoutes
);


// =====================================================
// RESEARCH
// =====================================================

app.use("/api/research", researchRoutes);


// =====================================================
// CATEGORIES
// =====================================================

app.use(
  "/api/categories",
  categoryRoutes
);


// =====================================================
// INSTRUCTOR
// =====================================================

app.use(
  "/api/instructor",
  instructorRoutes
);

app.use("/api/instructor", instructorProgressRoutes);


// =====================================================
// CROSS-CUTTING FEATURES
// =====================================================

app.use("/api/features", featureRoutes);
app.use("/api/portal", portalRoutes);

// =====================================================
// NOTES
// =====================================================

app.use(
  "/api/notes",
  noteRoutes
);


// =====================================================
// ADMIN
// =====================================================

app.use(
  "/api/admin",
  adminRoutes
);


// =====================================================
// STATIC FRONTEND (if present)
// =====================================================

// When the frontend build is copied into backend/public, serve it as a static SPA.
const publicPath = path.join(__dirname, "..", "public");
if (fs.existsSync(publicPath)) {
  app.use(express.static(publicPath));

  // Serve index.html for any non-API route (simple SPA fallback)
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(publicPath, "index.html"));
  });
}


// =====================================================
// 404 HANDLER
// =====================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});


// =====================================================
// GLOBAL ERROR HANDLER
// =====================================================

app.use(errorMiddleware);


module.exports = app;
