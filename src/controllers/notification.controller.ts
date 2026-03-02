import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

const params = (req: Request) => req.params as Record<string, string>;
const query = (req: Request) => req.query as Record<string, string>;

// ─── GET USER NOTIFICATIONS ───────────────────────────────────
export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const q = query(req);
    const limit = Math.min(parseInt(q.limit || "20"), 50);
    const page = Math.max(parseInt(q.page || "1"), 1);
    const skip = (page - 1) * limit;

    const notifications = await prisma.notification.findMany({
      where: { receiver_id: userId },
      include: {
        creator: {
          select: { id: true, user_name: true, picture_url: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip,
    });

    return res.json(notifications);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ─── MARK SINGLE NOTIFICATION AS READ ────────────────────────
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const notificationId = parseInt(params(req).notificationId ?? '');
    if (isNaN(notificationId))
      return res.status(400).json({ message: "Invalid Notification ID format" });

    const userId = req.userId!;

    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification)
      return res.status(404).json({ message: "Notification not found" });

    if (notification.receiver_id !== userId)
      return res.status(403).json({ message: "Unauthorized" });

    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: { is_read: true },
    });

    return res.json({ message: "Notification marked as read", data: updated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ─── MARK ALL NOTIFICATIONS AS READ ──────────────────────────
export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;

    await prisma.notification.updateMany({
      where: { receiver_id: userId, is_read: false },
      data: { is_read: true },
    });

    return res.json({ message: "All notifications marked as read" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ─── DELETE READ NOTIFICATIONS ────────────────────────────────
export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;

    await prisma.notification.deleteMany({
      where: { is_read: true, receiver_id: userId },
    });

    return res.json({ message: "Notifications deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
