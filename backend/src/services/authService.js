const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authService = {
  async register({
    firstName,
    lastName,
    email,
    phone,
    region,
    password,
    accountType,
  }) {
    const existingUser = await User.findByEmail(email);

    if (existingUser) {
      throw new Error("Email is already registered");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let role = "student";

    if (accountType === "instructor") {
      role = "instructor";
    }

    const userId = await User.create({
      firstName,
      lastName,
      email,
      phone,
      region,
      password: hashedPassword,
      role,
      accountType,
    });

    const user = await User.findById(userId);

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    return { user, token };
  },

  async login(email, password) {
    const user = await User.findByEmail(email);

    if (!user) {
      throw new Error("Invalid email or password");
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      throw new Error("Invalid email or password");
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    delete user.password;

    return { user, token };
  },
};

module.exports = authService;