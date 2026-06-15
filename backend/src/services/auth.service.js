const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const prisma = require("../lib/prisma");
const { createAppError } = require("../utils/appError");

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function getJwtSecret() {
  if (!process.env.JWT_SECRET) {
    throw createAppError("JWT_SECRET is not configured", 500);
  }

  return process.env.JWT_SECRET;
}

function toSafeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

function createToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    getJwtSecret(),
    {
      expiresIn: "1d",
    }
  );
}

async function registerUser(data = {}) {
  const name = String(data.name || "").trim();
  const email = normalizeEmail(data.email);
  const password = String(data.password || "");

  if (!name || !email || !password) {
    throw createAppError("Name, email, and password are required");
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    throw createAppError("Email already exists");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: "SALES_USER",
    },
  });

  return toSafeUser(user);
}

async function loginUser(data = {}) {
  const email = normalizeEmail(data.email);
  const password = String(data.password || "");

  if (!email || !password) {
    throw createAppError("Invalid credentials", 401);
  }

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throw createAppError("Invalid credentials", 401);
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatches) {
    throw createAppError("Invalid credentials", 401);
  }

  return {
    token: createToken(user),
    user: toSafeUser(user),
  };
}

module.exports = {
  createToken,
  loginUser,
  registerUser,
  toSafeUser,
};
