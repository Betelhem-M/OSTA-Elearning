function roleMiddleware(...allowedRoles) {
  return (req, res, next) => {
    console.log("========== ROLE DEBUG ==========");
    console.log("User:", req.user);
    console.log("User ID:", req.user?.id);
    console.log("User Role:", req.user?.role);
    console.log("Allowed Roles:", allowedRoles);
    console.log("================================");

    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "You do not have permission to access this resource",
        debug: {
          userRole: req.user.role,
          allowedRoles,
        },
      });
    }

    next();
  };
}

module.exports = roleMiddleware;