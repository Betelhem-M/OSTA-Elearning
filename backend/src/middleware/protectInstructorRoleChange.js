module.exports = function protectInstructorRoleChange(req, res, next) {
  if (String(req.body?.role || "").toLowerCase() === "instructor") {
    return res.status(403).json({
      message:
        "Instructor access can only be granted through the instructor application approval process.",
    });
  }

  return next();
};
