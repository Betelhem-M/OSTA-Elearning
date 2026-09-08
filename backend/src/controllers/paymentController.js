const Payment = require("../models/Payment");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const InstructorPaymentAccount = require("../models/InstructorPaymentAccount");

const OFFICIAL_PAYMENT_PAGES = {
  telebirr: "https://www.ethiotelecom.et/telebirr/",
  cbe: "https://combanketh.et/products/digital-banking",
};

const paymentController = {
  async methods(req, res) {
    try {
      const courseId = Number(req.query.courseId);
      if (!Number.isInteger(courseId) || courseId < 1) {
        return res.status(400).json({ message: "A valid course ID is required" });
      }

      const methods = [];

      for (const method of ["telebirr", "cbe"]) {
        const account = await InstructorPaymentAccount.findVerifiedForCourse(
          courseId,
          method
        );

        if (account) {
          methods.push({
            id: method,
            accountId: account.id,
            name: method === "telebirr" ? "Telebirr" : "CBE Mobile Banking",
            accountName: account.accountName,
            accountNumber: account.accountNumber,
            instructorName: account.instructorName,
            officialUrl: OFFICIAL_PAYMENT_PAGES[method],
            officialLabel:
              method === "telebirr"
                ? "Open official Telebirr"
                : "Open official CBE Banking",
            ussdCode: method === "telebirr" ? "*127#" : null,
            ussdUri: method === "telebirr" ? "tel:*127%23" : null,
            instructions:
              method === "telebirr"
                ? "Open the official Telebirr service, or use the Telebirr app/USSD to pay the verified instructor account. Keep the transaction reference after payment."
                : "Open the official CBE digital banking page and use CBE Mobile Banking/CBE Birr to pay the verified instructor account. Keep the transaction reference after payment.",
          });
        }
      }

      return res.json({ methods });
    } catch (error) {
      console.error("Payment methods error:", error);
      return res.status(500).json({ message: "Failed to load payment methods" });
    }
  },

  async create(req, res) {
    try {
      if (req.user.role !== "student") {
        return res.status(403).json({ message: "Only students can pay for courses" });
      }

      const courseId = Number(req.body.courseId);
      const method = String(req.body.method || "").toLowerCase();
      const rawPaymentAccountId = req.body.paymentAccountId;
      const transactionReference = String(
        req.body.transactionReference || ""
      ).trim();

      if (!Number.isInteger(courseId) || courseId < 1) {
        return res.status(400).json({ message: "A valid course ID is required" });
      }

      if (!["telebirr", "cbe"].includes(method)) {
        return res
          .status(400)
          .json({ message: "Choose Telebirr or CBE Mobile Banking" });
      }

      if (
        transactionReference.length < 4 ||
        transactionReference.length > 120
      ) {
        return res
          .status(400)
          .json({ message: "Enter a valid payment transaction reference" });
      }

      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      if (course.status && course.status !== "published") {
        return res
          .status(400)
          .json({ message: "This course is not available for enrollment" });
      }

      const amount = Number(course.price) || 0;
      if (amount <= 0) {
        return res.status(400).json({ message: "This course does not require payment" });
      }

      const instructorAccount =
        await InstructorPaymentAccount.findVerifiedForCourse(courseId, method);

      if (!instructorAccount) {
        return res.status(409).json({
          message:
            "This instructor has not configured a verified account for the selected payment method",
        });
      }

      const paymentAccountId =
        Number(rawPaymentAccountId) || instructorAccount.id;

      if (instructorAccount.id !== paymentAccountId) {
        return res
          .status(400)
          .json({ message: "Payment account does not belong to this course" });
      }

      if (await Enrollment.findByUserAndCourse(req.user.id, courseId)) {
        return res
          .status(409)
          .json({ message: "You are already enrolled in this course" });
      }

      const existingPayment = await Payment.findByUserAndCourse(
        req.user.id,
        courseId
      );

      if (
        existingPayment &&
        ["pending", "approved"].includes(existingPayment.status)
      ) {
        return res.status(409).json({
          message: "A payment is already awaiting verification for this course",
          payment: existingPayment,
        });
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
        message: "Payment submitted for verification",
        paymentId,
        status: "pending",
        method,
        amount,
        currency: "ETB",
      });
    } catch (error) {
      console.error("Payment error:", error);
      return res.status(500).json({ message: "Failed to submit payment" });
    }
  },
};

module.exports = paymentController;
