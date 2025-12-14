import { Router } from "express";
import {
  getUserProfile,
  updateUserProfile,
  updateProfilePicture,
  getUserPosts,
  searchUsers,
  getFollowers,
  getFollowings
} from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

// Get profile
router.get("/:id", authMiddleware, getUserProfile);

// Update profile
router.put("/:id", authMiddleware, updateUserProfile);

// Update profile picture
router.put("/:id/picture", authMiddleware, updateProfilePicture);

// Get user's posts
router.get("/:id/posts", authMiddleware, getUserPosts);

// Search users
router.get("/", authMiddleware, searchUsers); // /users?search=abc

// Followers
router.get("/:id/followers", authMiddleware, getFollowers);

// Followings
router.get("/:id/followings", authMiddleware, getFollowings);

export default router;
