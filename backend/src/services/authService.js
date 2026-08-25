const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_EXPIRES_IN =
  process.env.JWT_EXPIRES_IN ||
  "1d";

function createToken(user) {
  if (!process.env.JWT_SECRET) {
    throw new Error(
      "JWT_SECRET is not configured."
    );
  }

  return jwt.sign(
    {
      id: user.id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN,
    }
  );
}

const authService = {
  // =====================================================
  // REGISTER
  // =====================================================

  async register({
    firstName,
    lastName,
    email,
    phone,
    region,
    password,
    accountType,
  }) {
    const existingUser =
      await User.findByEmail(
        email
      );

    if (existingUser) {
      throw new Error(
        "Email is already registered"
      );
    }

    const hashedPassword =
      await bcrypt.hash(
        password,
        10
      );

    let role = "student";

    if (
      accountType ===
      "instructor"
    ) {
      role = "instructor";
    }

    const userId =
      await User.create({
        firstName,
        lastName,
        email,
        phone,
        region,
        password:
          hashedPassword,
        role,
        accountType,
      });

    const user =
      await User.findById(
        userId
      );

    if (!user) {
      throw new Error(
        "User was created but could not be loaded."
      );
    }

    delete user.password;

    const token =
      createToken(user);

    return {
      user,
      token,
    };
  },

  // =====================================================
  // LOGIN
  // =====================================================

  async login(email, password) {
    const user =
      await User.findByEmail(
        email
      );

    if (!user) {
      throw new Error(
        "Invalid email or password"
      );
    }

    if (user.status !== "active") {
      throw new Error(
        "Your account is not active."
      );
    }

    const passwordMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!passwordMatch) {
      throw new Error(
        "Invalid email or password"
      );
    }

    delete user.password;

    const token =
      createToken(user);

    return {
      user,
      token,
    };
  },
};

module.exports = authService;