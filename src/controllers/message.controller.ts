import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { createNotification } from "../services/notification.service.js";

const MAX_MESSAGE_LENGTH = 5000;

const params = (req: Request) => req.params as Record<string, string>;
const query = (req: Request) => req.query as Record<string, string>;

// ─── SEND MESSAGE ─────────────────────────────────────────────
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const senderId = req.userId!;
    const receiverId = parseInt(params(req).receiverId ?? '');
    if (isNaN(receiverId)) return res.status(400).json({ message: "Invalid receiver ID" });

    const { message } = req.body;

    if (!message || typeof message !== "string" || message.trim().length === 0)
      return res.status(400).json({ message: "Message content is required" });

    if (message.length > MAX_MESSAGE_LENGTH)
      return res.status(400).json({ message: `Message must be at most ${MAX_MESSAGE_LENGTH} characters` });

    if (senderId === receiverId)
      return res.status(400).json({ message: "Cannot message yourself" });

    const receiverExists = await prisma.user.findUnique({ where: { id: receiverId } });

    if (!receiverExists)
      return res.status(404).json({ message: "Receiver not found" });

    const newMessage = await prisma.message.create({
      data: {
        sender_id: senderId,
        receiver_id: receiverId,
        message: message.trim(),
      },
    });

    await createNotification({
      creatorId: senderId,
      receiverId,
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

// ─── GET CONVERSATION WITH USER ───────────────────────────────
export const getConversation = async (req: Request, res: Response) => {
  try {
    const currentUserId = req.userId!;
    const otherUserId = parseInt(params(req).userId ?? '');
    if (isNaN(otherUserId)) return res.status(400).json({ message: "Invalid user ID" });

    const q = query(req);
    const limit = Math.min(parseInt(q.limit || "50"), 100);
    const page = Math.max(parseInt(q.page || "1"), 1);
    const skip = (page - 1) * limit;

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { sender_id: currentUserId, receiver_id: otherUserId },
          { sender_id: otherUserId, receiver_id: currentUserId },
        ],
      },
      take: limit,
      skip,
      orderBy: { createdAt: "asc" },
    });

    return res.json(messages);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ─── GET ALL CONVERSATIONS (CHAT LIST) ────────────────────────
export const getConversations = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;

    const messages = await prisma.message.findMany({
      where: {
        OR: [{ sender_id: userId }, { receiver_id: userId }],
      },
      orderBy: { createdAt: "desc" },
      take: 1000,
      include: {
        sender: {
          select: { id: true, user_name: true, picture_url: true },
        },
        receiver: {
          select: { id: true, user_name: true, picture_url: true },
        },
      },
    });

    const conversationMap = new Map<string, any>();

    for (const msg of messages) {
      const otherUser = msg.sender_id === userId ? msg.receiver : msg.sender;

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

// ─── MARK MESSAGE AS READ ─────────────────────────────────────
export const markMessageAsRead = async (req: Request, res: Response) => {
  try {
    const messageId = parseInt(params(req).messageId ?? '');
    if (isNaN(messageId)) return res.status(400).json({ message: "Invalid message ID" });
    const userId = req.userId!;

    const message = await prisma.message.findUnique({ where: { id: messageId } });

    if (!message)
      return res.status(404).json({ message: "Message not found" });

    if (message.receiver_id !== userId)
      return res.status(403).json({ message: "Unauthorized" });

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
