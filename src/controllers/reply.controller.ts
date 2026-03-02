import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { createNotification } from "../services/notification.service.js";

const MAX_REPLY_LENGTH = 2000;

const params = (req: Request) => req.params as Record<string, string>;
const query = (req: Request) => req.query as Record<string, string>;

// ─── CREATE REPLY ─────────────────────────────────────────────
export const createReply = async (req: Request, res: Response) => {
  try {
    const commentId = parseInt(params(req).commentId ?? '');
    if (isNaN(commentId)) return res.status(400).json({ message: "Invalid comment ID" });
    const userId = req.userId!;
    const { reply } = req.body;

    if (!reply || typeof reply !== "string" || reply.trim().length === 0)
      return res.status(400).json({ message: "Reply text is required" });

    if (reply.length > MAX_REPLY_LENGTH)
      return res.status(400).json({ message: `Reply must be at most ${MAX_REPLY_LENGTH} characters` });

    const commentExists = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { user_id: true },
    });

    if (!commentExists)
      return res.status(404).json({ message: "Comment not found" });

    const newReply = await prisma.reply.create({
      data: {
        reply: reply.trim(),
        comment_id: commentId,
        user_id: userId,
      },
      include: {
        user: {
          select: { id: true, user_name: true, picture_url: true },
        },
      },
    });

    await createNotification({
      creatorId: userId,
      receiverId: commentExists.user_id,
      reason: "REPLY",
    });

    return res.status(201).json({
      message: "Reply added successfully",
      reply: newReply,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ─── GET REPLIES OF A COMMENT ─────────────────────────────────
export const getCommentReplies = async (req: Request, res: Response) => {
  try {
    const commentId = parseInt(params(req).commentId ?? '');
    if (isNaN(commentId)) return res.status(400).json({ message: "Invalid comment ID" });
    const q = query(req);
    const limit = Math.min(parseInt(q.limit || "20"), 50);
    const page = Math.max(parseInt(q.page || "1"), 1);
    const skip = (page - 1) * limit;

    const replies = await prisma.reply.findMany({
      where: { comment_id: commentId },
      take: limit,
      skip,
      include: {
        user: {
          select: { id: true, user_name: true, picture_url: true },
        },
        _count: {
          select: { likes: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return res.json(replies);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ─── UPDATE REPLY ─────────────────────────────────────────────
export const updateReply = async (req: Request, res: Response) => {
  try {
    const replyId = parseInt(params(req).replyId ?? '');
    if (isNaN(replyId)) return res.status(400).json({ message: "Invalid reply ID" });
    const userId = req.userId!;
    const { reply } = req.body;

    if (!reply || typeof reply !== "string" || reply.trim().length === 0)
      return res.status(400).json({ message: "Reply text is required" });

    if (reply.length > MAX_REPLY_LENGTH)
      return res.status(400).json({ message: `Reply must be at most ${MAX_REPLY_LENGTH} characters` });

    const existing = await prisma.reply.findUnique({ where: { id: replyId } });

    if (!existing)
      return res.status(404).json({ message: "Reply not found" });

    if (existing.user_id !== userId)
      return res.status(403).json({ message: "Unauthorized" });

    const updated = await prisma.reply.update({
      where: { id: replyId },
      data: { reply: reply.trim() },
    });

    return res.json({ message: "Reply updated", reply: updated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ─── DELETE REPLY ─────────────────────────────────────────────
export const deleteReply = async (req: Request, res: Response) => {
  try {
    const replyId = parseInt(params(req).replyId ?? '');
    if (isNaN(replyId)) return res.status(400).json({ message: "Invalid reply ID" });
    const userId = req.userId!;

    const existing = await prisma.reply.findUnique({ where: { id: replyId } });

    if (!existing)
      return res.status(404).json({ message: "Reply not found" });

    if (existing.user_id !== userId)
      return res.status(403).json({ message: "Unauthorized" });

    await prisma.reply.delete({ where: { id: replyId } });

    return res.json({ message: "Reply deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
