import { Router } from "express";
import {
  createPost,
  addMediaToPost,
  getPostById,
  getUserPosts,
  getFeedPosts,
  updatePost,
  deletePost
} from "../controllers/post.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

// Create new post
router.post("/", authMiddleware, createPost);

// Add media to a post
router.post("/:postId/media", authMiddleware, addMediaToPost);

// Get single post
router.get("/:postId", authMiddleware, getPostById);

// Get posts of a specific user
router.get("/user/:userId", authMiddleware, getUserPosts);

// Feed posts (from following users)
router.get("/", authMiddleware, getFeedPosts);

// Update post
router.put("/:postId", authMiddleware, updatePost);

// Delete post
router.delete("/:postId", authMiddleware, deletePost);

export default router;
