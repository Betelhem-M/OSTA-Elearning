const authService = require("../services/authService");

const authController = {
  async register(req, res) {
    try {
      const {
        firstName,
        lastName,
        email,
        phone,
        region,
        password,
        accountType,
      } = req.body;

      if (
        !firstName ||
        !lastName ||
        !email ||
        !phone ||
        !region ||
        !password ||
        !accountType
      ) {
        return res.status(400).json({
          message: "All registration fields are required",
        });
      }

      const result = await authService.register({
        firstName,
        lastName,
        email,
        phone,
        region,
        password,
        accountType: accountType.toLowerCase(),
      });

      return res.status(201).json({
        message: "Registration successful",
        ...result,
      });
    } catch (error) {
      console.error("Registration error:", error);

      return res.status(400).json({
        message: error.message,
      });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          message: "Email and password are required",
        });
      }

      const result = await authService.login(email, password);

      return res.status(200).json({
        message: "Login successful",
        ...result,
      });
    } catch (error) {
      console.error("Login error:", error);

      return res.status(401).json({
        message: error.message,
      });
    }
  },
};

module.exports = authController;