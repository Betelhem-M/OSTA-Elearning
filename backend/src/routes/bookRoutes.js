const express = require("express");
const auth = require("../middleware/authMiddleware");
const upload = require("../middleware/bookUploadMiddleware");
const controller = require("../controllers/bookController");

const router = express.Router();

router.get("/", controller.list);
router.get("/:id/read", controller.read);
router.get("/:id/download", auth, controller.download);
router.post("/", auth, upload.single("book"), controller.upload);

module.exports = router;
