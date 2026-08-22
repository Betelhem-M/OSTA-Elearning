const express = require("express");

const adminController = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

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

router.delete(
  "/users/:id",
  authMiddleware,
  roleMiddleware("admin"),
  adminController.deleteUser
);

module.exports = router;