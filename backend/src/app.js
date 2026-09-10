const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const authRoutes = require("./routes/authRoutes");
const quizRoutes = require("./routes/quizRoutes");
const quizAttemptRoutes = require("./routes/quizAttemptRoutes");
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
const aiTutorRoutes = require("./routes/aiTutorRoutes");
const bookRoutes = require("./routes/bookRoutes");
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
const instructorProgressRoutes = require("./routes/instructorProgressRoutes");
const instructorApplicationRoutes = require("./routes/instructorApplicationRoutes");

const authMiddleware = require("./middleware/authMiddleware");
const errorMiddleware = require("./middleware/errorMiddleware");

const app = express();

app.use(cors({
  origin: function (origin, callback) {
    return callback(null, true);
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "OSTA-Elearning API is running",
    timestamp: new Date().toISOString(),
  });
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.get("/api/auth/me", authMiddleware, (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});

app.use("/api/users", userRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/course-sections", courseSectionRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/instructor/payment-accounts", instructorPaymentRoutes);
app.use("/api/ai-tutor", aiTutorRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/progress", lessonProgressRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api", quizAttemptRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/discussions", discussionRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/competitions", competitionRoutes);
app.use("/api/hackathons", hackathonRoutes);
app.use("/api/innovation", innovationRoutes);
app.use("/api/research", researchRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/instructor", instructorRoutes);
app.use("/api/instructor", instructorProgressRoutes);
app.use("/api/instructor-applications", instructorApplicationRoutes);
app.use("/api/features", featureRoutes);
app.use("/api/portal", portalRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/admin", adminRoutes);

const publicPath = path.join(__dirname, "..", "public");
if (fs.existsSync(publicPath)) {
  app.use(express.static(publicPath));
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(publicPath, "index.html"));
  });
}

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

app.use(errorMiddleware);

module.exports = app;
