import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";

// --------------------------------------
// GET USER NOTIFICATIONS
// --------------------------------------
export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId as number;

    const notifications = await prisma.notification.findMany({
      where: { receiver_id: userId },
      include: {
        creator: {
          select: {
            id: true,
            user_name: true,
            picture_url: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json(notifications);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// --------------------------------------
// MARK SINGLE NOTIFICATION AS READ
// --------------------------------------
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const notificationId = parseInt((req as any).params.notificationId);
    const userId = (req as any).userId as number;

    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    if (notification.receiver_id !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

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

// --------------------------------------
// MARK ALL NOTIFICATIONS AS READ
// --------------------------------------
export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId as number;

    await prisma.notification.updateMany({
      where: {
        receiver_id: userId,
        is_read: false,
      },
      data: {
        is_read: true,
      },
    });

    return res.json({ message: "All notifications marked as read" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// --------------------------------------
// DELETE NOTIFICATION
// --------------------------------------
export const deleteNotification = async (req: Request, res: Response) => {
  try {
    // const notificationId = parseInt((req as any).params.notificationId);
    const userId = (req as any).userId as number;

    // const notification = await prisma.notification.findUnique({
    //   where: { id: notificationId },
    // });

    // if (!notification) {
    //   return res.status(404).json({ message: "Notification not found" });
    // }

    // if (notification.receiver_id !== userId) {
    //   return res.status(403).json({ message: "Unauthorized" });
    // }

    await prisma.notification.deleteMany({
      where: { is_read: true },
    });

    return res.json({ message: "Notifications deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
