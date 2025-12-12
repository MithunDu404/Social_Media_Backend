import { Router } from "express";
import { registerUser, loginUser, getMe } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

// Register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// Get logged-in user (protected)
router.get("/me", authMiddleware, getMe);

export default router;
