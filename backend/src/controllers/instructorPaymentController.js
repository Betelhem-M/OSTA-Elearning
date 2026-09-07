const InstructorPaymentAccount = require("../models/InstructorPaymentAccount");

const instructorPaymentController = {
  async list(req, res) {
    try {
      if (req.user.role !== "instructor") return res.status(403).json({ message: "Instructor access required" });
      return res.json({ accounts: await InstructorPaymentAccount.findByUser(req.user.id) });
    } catch (error) {
      console.error("List payment accounts error:", error);
      return res.status(500).json({ message: "Failed to load payment accounts" });
    }
  },

  async save(req, res) {
    try {
      if (req.user.role !== "instructor") return res.status(403).json({ message: "Instructor access required" });
      const method = await InstructorPaymentAccount.upsert(req.user.id, req.body);
      return res.status(200).json({ message: `${method} account saved and submitted for verification` });
    } catch (error) {
      return res.status(400).json({ message: error.message || "Invalid payment account" });
    }
  },

  async verify(req, res) {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Admin access required" });
    const verified = await InstructorPaymentAccount.verifyById(Number(req.params.id));
    return verified
      ? res.json({ message: "Payment account verified" })
      : res.status(404).json({ message: "Payment account not found" });
  },
};

module.exports = instructorPaymentController;
