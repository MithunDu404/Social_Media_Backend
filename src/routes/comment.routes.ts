import { Router } from "express";
import {
  createComment,
  getPostComments,
  updateComment,
  deleteComment
} from "../controllers/comment.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

// Create a comment on a post
router.post("/:postId", authMiddleware, createComment);

// Get all comments for a post
router.get("/:postId", authMiddleware, getPostComments);

// Update comment
router.patch("/:commentId", authMiddleware, updateComment);

// Delete comment
router.delete("/:commentId", authMiddleware, deleteComment);

export default router;
