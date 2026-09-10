const fs = require("fs");
const path = require("path");

const InstructorApplication = require("../models/InstructorApplication");
const Notification = require("../models/Notification");
const User = require("../models/User");
const { sendEmail } = require("./emailService");
const pool = require("../config/database");

function clean(value) {
  return String(value || "").trim();
}

function validateFields(data) {
  const fields = {
    professionalTitle: clean(data.professionalTitle),
    specialization: clean(data.specialization),
    education: clean(data.education),
    experience: clean(data.experience),
    skills: clean(data.skills),
    teachingStatement: clean(data.teachingStatement),
  };

  for (const [name, value] of Object.entries(fields)) {
    if (!value) {
      throw new Error(`${name} is required`);
    }
  }

  return fields;
}

async function notifyAdmins({ title, message, targetPath }) {
  const [admins] = await pool.execute(
    `SELECT id FROM users WHERE role = 'admin' AND status = 'active'`
  );

  for (const admin of admins) {
    await Notification.create({
      userId: admin.id,
      title,
      message,
      category: "Instructor Application",
      entityType: "instructor_application",
      entityId: 0,
      targetPath,
    });
  }
}

function removeFile(filePath) {
  if (!filePath) return;
  try {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (error) {
    console.error("Unable to remove instructor CV:", error.message);
  }
}

const instructorApplicationService = {
  async submit({ user, body, file }) {
    if (user.role === "admin") {
      throw new Error("Admin accounts cannot submit instructor applications.");
    }

    const fields = validateFields(body);

    if (!file) {
      throw new Error("Please upload your CV.");
    }

    const existing = await InstructorApplication.findByUserId(user.id);

    if (existing && existing.status === "pending") {
      removeFile(file.path);
      throw new Error("You already have a pending instructor application.");
    }

    if (existing && existing.status === "approved") {
      removeFile(file.path);
      throw new Error("Your instructor application has already been approved.");
    }

    let applicationId;

    if (existing && existing.status === "rejected") {
      const updated = await InstructorApplication.updateRejectedApplication(
        existing.id,
        {
          ...fields,
          cvFilePath: file.path,
          cvOriginalName: file.originalname,
          cvMimeType: file.mimetype,
          cvFileSize: file.size,
        }
      );

      if (!updated) {
        removeFile(file.path);
        throw new Error("Unable to resubmit instructor application.");
      }

      removeFile(existing.cv_file_path);
      applicationId = existing.id;
    } else {
      applicationId = await InstructorApplication.create({
        userId: user.id,
        ...fields,
        cvFilePath: file.path,
        cvOriginalName: file.originalname,
        cvMimeType: file.mimetype,
        cvFileSize: file.size,
      });
    }

    await notifyAdmins({
      title: "New instructor application",
      message: `${user.first_name || "A user"} ${user.last_name || ""} submitted an instructor application for review.`,
      targetPath: "/admin/instructor-requests",
    });

    return {
      id: applicationId,
      status: "pending",
      message:
        "Your instructor application was submitted successfully and is waiting for admin review.",
    };
  },

  async getMyApplication(userId) {
    const application = await InstructorApplication.findByUserId(userId);

    if (!application) return null;

    return {
      id: application.id,
      professionalTitle: application.professional_title,
      specialization: application.specialization,
      education: application.education,
      experience: application.experience,
      skills: application.skills,
      teachingStatement: application.teaching_statement,
      cvOriginalName: application.cv_original_name,
      status: application.status,
      adminNote: application.admin_note,
      reviewedAt: application.reviewed_at,
      createdAt: application.created_at,
    };
  },

  async list(status) {
    const rows = await InstructorApplication.listAll(status);

    return rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      applicant: {
        firstName: row.first_name,
        lastName: row.last_name,
        email: row.email,
        phone: row.phone,
        region: row.region,
      },
      professionalTitle: row.professional_title,
      specialization: row.specialization,
      education: row.education,
      experience: row.experience,
      skills: row.skills,
      teachingStatement: row.teaching_statement,
      cvOriginalName: row.cv_original_name,
      cvMimeType: row.cv_mime_type,
      cvFileSize: row.cv_file_size,
      status: row.status,
      adminNote: row.admin_note,
      reviewedBy: row.reviewed_by,
      reviewedAt: row.reviewed_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  },

  async getCv(id) {
    const application = await InstructorApplication.findById(id);
    if (!application) throw new Error("Instructor application not found.");
    if (!application.cv_file_path || !fs.existsSync(application.cv_file_path)) {
      throw new Error("CV file is no longer available.");
    }

    return {
      path: application.cv_file_path,
      originalName: application.cv_original_name,
      mimeType: application.cv_mime_type || "application/octet-stream",
    };
  },

  async review({ id, status, adminNote, adminId }) {
    if (!['approved', 'rejected'].includes(status)) {
      throw new Error("Review status must be approved or rejected.");
    }

    const application = await InstructorApplication.findById(id);

    if (!application) throw new Error("Instructor application not found.");
    if (application.status !== "pending") {
      throw new Error("This instructor application has already been reviewed.");
    }

    const updated = await InstructorApplication.review({
      id,
      status,
      adminNote: clean(adminNote),
      reviewedBy: adminId,
    });

    if (!updated) {
      throw new Error("The application could not be reviewed.");
    }

    if (status === "approved") {
      await pool.execute(
        `
        UPDATE users
        SET role = 'instructor', account_type = 'instructor'
        WHERE id = ?
        `,
        [application.user_id]
      );
    }

    const applicantName = `${application.first_name || ""} ${application.last_name || ""}`.trim();
    const approved = status === "approved";
    const title = approved
      ? "Your OSTA instructor application was approved"
      : "Update on your OSTA instructor application";
    const message = approved
      ? `Congratulations${applicantName ? ` ${applicantName}` : ""}. Your instructor application has been approved. You can now sign in and use the instructor workspace.`
      : `Your instructor application was not approved at this time.${clean(adminNote) ? ` Admin note: ${clean(adminNote)}` : " Please review your application and resubmit when ready."}`;

    await Notification.create({
      userId: application.user_id,
      title,
      message,
      category: "Instructor Application",
      entityType: "instructor_application",
      entityId: id,
      targetPath: approved ? "/instructor/dashboard" : "/instructor-application",
    });

    await sendEmail({
      to: application.email,
      subject: title,
      text: message,
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6">
          <h2>${title}</h2>
          <p>${message}</p>
          ${clean(adminNote) ? `<p><strong>Admin note:</strong> ${clean(adminNote)}</p>` : ""}
          ${approved ? "<p>Welcome to the OSTA instructor community.</p>" : "<p>You may submit a new application after addressing the feedback.</p>"}
        </div>
      `,
    });

    return {
      id,
      status,
      message: approved
        ? "Instructor application approved and acceptance email sent."
        : "Instructor application rejected and notification email sent.",
    };
  },
};

module.exports = instructorApplicationService;
