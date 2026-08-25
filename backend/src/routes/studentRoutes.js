const express = require("express");

const studentController =
  require("../controllers/studentController");

const authMiddleware =
  require("../middleware/authMiddleware");

const roleMiddleware =
  require("../middleware/roleMiddleware");

const router = express.Router();

// =====================================================
// STUDENT DASHBOARD
// =====================================================

router.get(
  "/dashboard",
  authMiddleware,
  roleMiddleware("student"),
  studentController.getDashboard
);

module.exports = router;