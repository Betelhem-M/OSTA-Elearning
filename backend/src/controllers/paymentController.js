const Payment = require("../models/Payment");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const InstructorPaymentAccount = require("../models/InstructorPaymentAccount");

const paymentController = {
  async methods(req, res) {
    const courseId = Number(req.query.courseId);
    if (!Number.isInteger(courseId) || courseId < 1) {
      return res.status(400).json({ message: "A valid course ID is required" });
    }

    const methods = [];
    for (const method of ["telebirr", "cbe"]) {
      const account = await InstructorPaymentAccount.findVerifiedForCourse(courseId, method);
      if (account) methods.push({
        id: method,
        name: method === "telebirr" ? "Telebirr" : "CBE Birr / CBE",
        accountName: account.accountName,
        accountNumber: account.accountNumber,
        instructorName: account.instructorName,
        instructions: "Send the exact course amount to this verified instructor account, then enter the transaction reference.",
      });
    }

    return res.json({ methods });
  },

  async create(req, res) {
    try {
      if (req.user.role !== "student") {
        return res.status(403).json({ message: "Only students can pay for courses" });
      }

      const courseId = Number(req.body.courseId);
      const method = String(req.body.method || "").toLowerCase();
      const paymentAccountId = Number(req.body.paymentAccountId);
      const transactionReference = String(req.body.transactionReference || "").trim();

      if (!Number.isInteger(courseId) || courseId < 1) {
        return res.status(400).json({ message: "A valid course ID is required" });
      }

      if (!["telebirr", "cbe"].includes(method)) {
        return res.status(400).json({ message: "Choose Telebirr or CBE" });
      }

      if (!Number.isInteger(paymentAccountId) || paymentAccountId < 1) {
        return res.status(400).json({ message: "A valid instructor payment account is required" });
      }

      if (transactionReference.length < 4 || transactionReference.length > 120) {
        return res.status(400).json({ message: "Enter a valid payment transaction reference" });
      }

      const course = await Course.findById(courseId);
      if (!course) return res.status(404).json({ message: "Course not found" });
      if (course.status && course.status !== "published") {
        return res.status(400).json({ message: "This course is not available for enrollment" });
      }

      const amount = Number(course.price) || 0;
      if (amount <= 0) {
        return res.status(400).json({ message: "This course does not require payment" });
      }

      const instructorAccount = await InstructorPaymentAccount.findVerifiedForCourse(courseId, method);
      if (!instructorAccount) {
        return res.status(409).json({ message: "This instructor has not configured a verified account for the selected payment method" });
      }
      if (instructorAccount.id !== paymentAccountId) {
        return res.status(400).json({ message: "Payment account does not belong to this course" });
      }

      const enrollment = await Enrollment.findByUserAndCourse(req.user.id, courseId);
      if (enrollment) return res.status(409).json({ message: "You are already enrolled in this course" });

      const existingPayment = await Payment.findByUserAndCourse(req.user.id, courseId);
      if (existingPayment && ["pending", "approved"].includes(existingPayment.status)) {
        return res.status(409).json({ message: "A payment is already awaiting review for this course", payment: existingPayment });
      }

      const paymentId = await Payment.create({
        userId: req.user.id,
        courseId,
        amount,
        method,
        paymentAccountId,
        transactionReference,
      });

      return res.status(201).json({
        message: "Payment submitted for review",
        paymentId,
        status: "pending",
        method: method === "telebirr" ? "Telebirr" : "CBE Birr / CBE",
      });
    } catch (error) {
      console.error("Payment error:", error);
      return res.status(500).json({ message: "Failed to submit payment" });
    }
  },
};

module.exports = paymentController;
