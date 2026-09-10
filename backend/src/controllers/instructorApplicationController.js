const instructorApplicationService = require("../services/instructorApplicationService");

const controller = {
  async submit(req, res) {
    try {
      const result = await instructorApplicationService.submit({
        user: req.user,
        body: req.body,
        file: req.file,
      });

      return res.status(201).json(result);
    } catch (error) {
      if (req.file?.path) {
        const fs = require("fs");
        try {
          if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        } catch (_) {}
      }

      console.error("Submit instructor application error:", error);
      return res.status(400).json({ message: error.message });
    }
  },

  async mine(req, res) {
    try {
      return res.status(200).json({
        application: await instructorApplicationService.getMyApplication(
          req.user.id
        ),
      });
    } catch (error) {
      console.error("Get instructor application error:", error);
      return res.status(500).json({ message: "Failed to fetch application." });
    }
  },

  async list(req, res) {
    try {
      const status = String(req.query.status || "all").toLowerCase();
      return res.status(200).json({
        applications: await instructorApplicationService.list(status),
      });
    } catch (error) {
      console.error("List instructor applications error:", error);
      return res.status(500).json({ message: "Failed to fetch instructor applications." });
    }
  },

  async cv(req, res) {
    try {
      const file = await instructorApplicationService.getCv(
        Number(req.params.id)
      );

      return res.download(file.path, file.originalName, {
        headers: {
          "Content-Type": file.mimeType,
        },
      });
    } catch (error) {
      console.error("Download instructor CV error:", error);
      return res.status(404).json({ message: error.message });
    }
  },

  async review(req, res) {
    try {
      const result = await instructorApplicationService.review({
        id: Number(req.params.id),
        status: req.body.status,
        adminNote: req.body.adminNote,
        adminId: req.user.id,
      });

      return res.status(200).json(result);
    } catch (error) {
      console.error("Review instructor application error:", error);
      return res.status(400).json({ message: error.message });
    }
  },
};

module.exports = controller;
