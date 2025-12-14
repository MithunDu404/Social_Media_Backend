import { Router } from "express";
import {
  togglePostLike,
  toggleCommentLike,
  toggleReplyLike,
  getPostLikes,
  getCommentLikes,
  getReplyLikes
} from "../controllers/like.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

// Toggle likes
router.post("/post/:postId", authMiddleware, togglePostLike);
router.post("/comment/:commentId", authMiddleware, toggleCommentLike);
router.post("/reply/:replyId", authMiddleware, toggleReplyLike);

// Get likes
router.get("/post/:postId", authMiddleware, getPostLikes);
router.get("/comment/:commentId", authMiddleware, getCommentLikes);
router.get("/reply/:replyId", authMiddleware, getReplyLikes);

export default router;
