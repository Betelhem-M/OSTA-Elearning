const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_EXPIRES_IN =
  process.env.JWT_EXPIRES_IN || "1d";

// =====================================================
// NORMALIZE ACCOUNT TYPE
// =====================================================

function normalizeAccountType(accountType) {
  const value = String(
    accountType || ""
  )
    .trim()
    .toLowerCase();

  if (value === "entrepreneur") {
    return "entrepreneur";
  }

  if (value === "innovator") {
    return "entrepreneur";
  }

  if (value === "researcher") {
    return "researcher";
  }

  if (value === "instructor") {
    return "instructor";
  }

  return "student";
}

// =====================================================
// CREATE JWT
// =====================================================

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
      account_type:
        user.account_type || "student",
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
    const normalizedAccountType =
      normalizeAccountType(
        accountType
      );

    // -----------------------------------------------
    // CHECK EXISTING EMAIL
    // -----------------------------------------------

    const existingUser =
      await User.findByEmail(
        email.trim()
      );

    if (existingUser) {
      throw new Error(
        "Email is already registered"
      );
    }

    // -----------------------------------------------
    // PASSWORD HASH
    // -----------------------------------------------

    const hashedPassword =
      await bcrypt.hash(
        password,
        10
      );

    // -----------------------------------------------
    // DETERMINE SYSTEM ROLE
    // -----------------------------------------------

    let role = "student";

    if (
      normalizedAccountType ===
      "instructor"
    ) {
      role = "instructor";
    }

    /*
     * Researchers and entrepreneurs remain
     * normal authenticated users with role=student,
     * while account_type identifies their platform
     * identity.
     *
     * This allows:
     *
     * researcher
     * → Research Portal
     *
     * entrepreneur
     * → Innovation Hub
     */

    // -----------------------------------------------
    // CREATE USER
    // -----------------------------------------------

    const userId =
      await User.create({
        firstName:
          firstName.trim(),

        lastName:
          lastName.trim(),

        email:
          email.trim(),

        phone:
          phone.trim(),

        region:
          region.trim(),

        password:
          hashedPassword,

        role,

        accountType:
          normalizedAccountType,
      });

    // -----------------------------------------------
    // GET CREATED USER
    // -----------------------------------------------

    const user =
      await User.findById(
        userId
      );

    if (!user) {
      throw new Error(
        "User was created but could not be loaded."
      );
    }

    // -----------------------------------------------
    // REMOVE PASSWORD
    // -----------------------------------------------

    delete user.password;

    // -----------------------------------------------
    // CREATE TOKEN
    // -----------------------------------------------

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

  async login(
    email,
    password
  ) {
    const user =
      await User.findByEmail(
        email.trim()
      );

    // -----------------------------------------------
    // USER NOT FOUND
    // -----------------------------------------------

    if (!user) {
      throw new Error(
        "Invalid email or password"
      );
    }

    // -----------------------------------------------
    // ACCOUNT STATUS
    // -----------------------------------------------

    if (
      user.status &&
      user.status !== "active"
    ) {
      throw new Error(
        "Your account is not active."
      );
    }

    // -----------------------------------------------
    // PASSWORD CHECK
    // -----------------------------------------------

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

    // -----------------------------------------------
    // NORMALIZE ACCOUNT TYPE
    // -----------------------------------------------

    user.account_type =
      normalizeAccountType(
        user.account_type
      );

    // -----------------------------------------------
    // REMOVE PASSWORD
    // -----------------------------------------------

    delete user.password;

    // -----------------------------------------------
    // CREATE TOKEN
    // -----------------------------------------------

    const token =
      createToken(user);

    return {
      user,
      token,
    };
  },
};

module.exports =
  authService;