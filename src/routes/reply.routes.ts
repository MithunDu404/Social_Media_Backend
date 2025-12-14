import { Router } from "express";
import {
  createReply,
  getCommentReplies,
  updateReply,
  deleteReply
} from "../controllers/reply.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

// Create reply on a comment
router.post("/:commentId", authMiddleware, createReply);

// Get all replies for a comment
router.get("/:commentId", authMiddleware, getCommentReplies);

// Update reply
router.patch("/:replyId", authMiddleware, updateReply);

// Delete reply
router.delete("/:replyId", authMiddleware, deleteReply);

export default router;
