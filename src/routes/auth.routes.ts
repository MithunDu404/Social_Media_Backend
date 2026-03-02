import { Router } from "express";
import { registerUserGoogle, registerUser, loginUser, getMe } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authRateLimiter } from "../middlewares/hybridRateLimiter.middleware.js";

const router = Router();

// Google OAuth
router.post("/google", authRateLimiter, registerUserGoogle);

// Register
router.post("/register", authRateLimiter, registerUser);

// Login
router.post("/login", authRateLimiter, loginUser);

// Get logged-in user (protected)
router.get("/me", authMiddleware, getMe);

export default router;
