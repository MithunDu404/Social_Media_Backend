import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { prisma } from "../lib/prisma.js";

const JWT_SECRET = process.env.JWT_SECRET!;
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ─── Validation Helpers ────────────────────────────────────────
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;
const MAX_USERNAME_LENGTH = 50;
const MIN_USERNAME_LENGTH = 2;

// ─── GOOGLE REGISTER / LOGIN ──────────────────────────────────
export const registerUserGoogle = async (req: Request, res: Response) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ message: "Google credential is required" });
    }

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID!,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      return res.status(401).json({ message: "Invalid Google token" });
    }

    const { email, name, picture, sub } = payload;

    if (!email) return res.status(401).json({ message: "Invalid Google Email" });

    // Find or create user
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Hash the Google sub ID before storing (never store plaintext secrets)
      const hashedSub = await bcrypt.hash(sub, 10);

      user = await prisma.user.create({
        data: {
          email: email,
          user_name: name || "profile",
          picture_url: picture ?? null,
          password: hashedSub,
        },
      });
    }

    // Issue JWT — use { id } to match auth middleware
    const token = jwt.sign(
      { id: user.id },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: { ...user, password: "" },
    });
  } catch (err) {
    console.error("Google auth error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ─── REGISTER ──────────────────────────────────────────────────
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { user_name, email, password } = req.body;

    // Basic validation
    if (!user_name || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Username validation
    if (
      typeof user_name !== "string" ||
      user_name.trim().length < MIN_USERNAME_LENGTH ||
      user_name.trim().length > MAX_USERNAME_LENGTH
    ) {
      return res.status(400).json({
        message: `Username must be between ${MIN_USERNAME_LENGTH} and ${MAX_USERNAME_LENGTH} characters`,
      });
    }

    // Email validation
    if (typeof email !== "string" || !EMAIL_REGEX.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Password validation
    if (typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({
        message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
      });
    }

    const existing = await prisma.user.findUnique({
      where: { email: email },
    });

    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        user_name: user_name.trim(),
        email: email.toLowerCase().trim(),
        password: hashed,
      },
    });

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });

    return res.status(201).json({
      message: "User registered successfully",
      token,
      user: { ...user, password: "" },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ─── LOGIN ─────────────────────────────────────────────────────
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Check fields
    if (!email || !password) {
      return res.status(400).json({ message: "Missing credentials" });
    }

    if (typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({ message: "Invalid credentials format" });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Compare password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Create JWT
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });

    return res.json({
      message: "Login successful",
      token,
      user: { ...user, password: "" },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ─── GET ME (requires auth) ───────────────────────────────────
export const getMe = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        user_name: true,
        email: true,
        phone: true,
        dob: true,
        location: true,
        about: true,
        picture_url: true,
      },
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json(user);
  } catch (err) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
