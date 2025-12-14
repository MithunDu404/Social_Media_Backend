import { Router } from "express";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
} from "../controllers/notification.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

// Get all notifications for logged-in user
router.get("/", authMiddleware, getNotifications);

// Mark a single notification as read
router.patch("/:notificationId/read", authMiddleware, markAsRead);

// Mark all notifications as read
router.patch("/read-all", authMiddleware, markAllAsRead);

// Delete a notification
router.delete("/:notificationId", authMiddleware, deleteNotification);

export default router;
