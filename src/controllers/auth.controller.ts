import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";   

const JWT_SECRET = process.env.JWT_SECRET || "secretkey";

// REGISTER
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { user_name, email, password } = req.body;

    // Basic validation
    if (!user_name || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if user exists
    const isUsername = await prisma.user.findUnique({
      where:{
        user_name: user_name
      }
    });

    if(isUsername){
        return res.status(400).json({ message: "Username already registered" });
    }

    const existing = await prisma.user.findUnique({
      where:{
        email: email
      }
    });

    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        user_name,
        email,
        password: hashed,
      },
    });

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "1d" });

    return res.status(201).json({ message: "User registered successfully",token, user: {...user, password:""}});
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// LOGIN
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Check fields
    if (!email || !password) {
      return res.status(400).json({ message: "Missing credentials" });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
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

    return res.json({ message: "Login successful", token, user:{...user, password: ""}});
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GET ME (requires auth)

export const getMe = async (req: Request, res: Response) => {
  try {
    // req.userId is added by authMiddleware
    const user = await prisma.user.findUnique({
      where: { id: (req as any).userId}
    });

    if(!user) return res.status(404).json({message: "User not found"})

    return res.json({...user, password: ""});
  } catch (err) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
