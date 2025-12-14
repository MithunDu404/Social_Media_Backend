import { Router } from "express";
import {
  sendMessage,
  getConversation,
  getConversations,
  markMessageAsRead
} from "../controllers/message.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

// Send message to a user
router.post("/:receiverId", authMiddleware, sendMessage);

// Get conversation with a specific user
router.get("/with/:userId", authMiddleware, getConversation);

// Get all conversations (chat list)
router.get("/", authMiddleware, getConversations);

// Mark a message as read
router.patch("/:messageId/read", authMiddleware, markMessageAsRead);

export default router;
