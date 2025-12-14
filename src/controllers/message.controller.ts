import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { createNotification } from "../services/notification.service.js";

// --------------------------------------
// SEND MESSAGE
// --------------------------------------
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const senderId = (req as any).userId as number;
    const receiverId = parseInt((req as any).params.receiverId);
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Message content is required" });
    }

    // Prevent sending message to self
    if (senderId === receiverId) {
      return res.status(400).json({ message: "Cannot message yourself" });
    }

    // Check receiver exists
    const receiverExists = await prisma.user.findUnique({
      where: { id: receiverId },
    });

    if (!receiverExists) {
      return res.status(404).json({ message: "Receiver not found" });
    }

    const newMessage = await prisma.message.create({
      data: {
        sender_id: senderId,
        receiver_id: receiverId,
        message,
      },
    });

    await createNotification({
      creatorId: senderId,
      receiverId: receiverId,
      reason: "MESSAGE",
    });


    return res.status(201).json({
      message: "Message sent successfully",
      data: newMessage,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// --------------------------------------
// GET CONVERSATION WITH USER
// --------------------------------------
export const getConversation = async (req: Request, res: Response) => {
  try {
    const currentUserId = (req as any).userId as number;
    const otherUserId = parseInt((req as any).params.userId);

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          {
            sender_id: currentUserId,
            receiver_id: otherUserId,
          },
          {
            sender_id: otherUserId,
            receiver_id: currentUserId,
          },
        ],
      },
      orderBy: { createdAt: "asc" },
    });

    return res.json(messages);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// --------------------------------------
// GET ALL CONVERSATIONS (CHAT LIST)
// --------------------------------------
export const getConversations = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId as number;

    // Get latest message per conversation
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { sender_id: userId },
          { receiver_id: userId },
        ],
      },
      orderBy: { createdAt: "desc" },
      include: {
        sender: {
          select: { id: true, user_name: true, picture_url: true },
        },
        receiver: {
          select: { id: true, user_name: true, picture_url: true },
        },
      },
    });

    // Group by conversation partner
    const conversationMap = new Map<string, any>();

    for (const msg of messages) {
      const otherUser =
        msg.sender_id === userId ? msg.receiver : msg.sender;

      if (!conversationMap.has(otherUser.id.toString())) {
        conversationMap.set(otherUser.id.toString(), {
          user: otherUser,
          lastMessage: msg,
        });
      }
    }

    return res.json(Array.from(conversationMap.values()));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// --------------------------------------
// MARK MESSAGE AS READ
// --------------------------------------
export const markMessageAsRead = async (req: Request, res: Response) => {
  try {
    const messageId = parseInt((req as any).params.messageId);
    const userId = (req as any).userId as number;

    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Only receiver can mark as read
    if (message.receiver_id !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const updated = await prisma.message.update({
      where: { id: messageId },
      data: { is_read: true },
    });

    return res.json({ message: "Message marked as read", data: updated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
