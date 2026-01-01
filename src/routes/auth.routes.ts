import { Router } from "express";
import { registerUserGoogle, registerUser, loginUser, getMe } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { hybridRateLimiter } from "../middlewares/hybridRateLimiter.middleware.js";

const router = Router();

router.post("/google", hybridRateLimiter, registerUserGoogle)

// Register
router.post("/register", hybridRateLimiter, registerUser);

// Login
router.post("/login", hybridRateLimiter, loginUser);

// Get logged-in user (protected)
router.get("/me", authMiddleware, hybridRateLimiter, getMe);

export default router;
