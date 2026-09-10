const express = require("express");

const adminController = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

if (typeof authMiddleware !== "function") {
  console.error("WARNING: authMiddleware is not a valid function");
}
if (typeof roleMiddleware !== "function") {
  console.error("WARNING: roleMiddleware is not a valid function");
}

router.get(
  "/dashboard",
  authMiddleware,
  roleMiddleware("admin"),
  adminController.getDashboard
);

router.get(
  "/users",
  authMiddleware,
  roleMiddleware("admin"),
  adminController.getUsers
);

router.put(
  "/users/:id/role",
  authMiddleware,
  roleMiddleware("admin"),
  adminController.updateUserRole
);

router.put(
  "/users/:id/status",
  authMiddleware,
  roleMiddleware("admin"),
  adminController.updateUserStatus
);

router.delete(
  "/users/:id",
  authMiddleware,
  roleMiddleware("admin"),
  adminController.deleteUser
);

router.get(
  "/reports",
  authMiddleware,
  roleMiddleware("admin"),
  adminController.getReports
);

router.get(
  "/system-health",
  authMiddleware,
  roleMiddleware("admin"),
  adminController.getSystemHealth
);

module.exports = router;
