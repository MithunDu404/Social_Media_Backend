import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";

// --------------------------------------
// CREATE REPLY
// --------------------------------------
export const createReply = async (req: Request, res: Response) => {
  try {
    const commentId = parseInt((req as any).params.commentId);
    const userId = (req as any).userId as number;
    const { reply } = req.body;

    if (!reply) {
      return res.status(400).json({ message: "Reply text is required" });
    }

    // Check comment exists
    const commentExists = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!commentExists) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const newReply = await prisma.reply.create({
      data: {
        reply,
        comment_id: commentId,
        user_id: userId,
      },
      include: {
        user: {
          select: {
            id: true,
            user_name: true,
            picture_url: true,
          },
        },
      },
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

// --------------------------------------
// GET REPLIES OF A COMMENT
// --------------------------------------
export const getCommentReplies = async (req: Request, res: Response) => {
  try {
    const commentId = parseInt((req as any).params.commentId);
    // const userId = (req as any).userId as number;

    const replies = await prisma.reply.findMany({
      where: { comment_id: commentId },
      include: {
        user: {
          select: {
            id: true,
            user_name: true,
            picture_url: true,
          },
        },
        _count:{
            select: {likes: true}
        }
      },
      orderBy: { createdAt: "asc" },
    });

    return res.json(replies);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// --------------------------------------
// UPDATE REPLY
// --------------------------------------
export const updateReply = async (req: Request, res: Response) => {
  try {
    // const replyId = BigInt(req.params.replyId);
    const replyId = parseInt((req as any).params.replyId);
    const userId = (req as any).userId as number;
    const { reply } = req.body;

    if (!reply) {
      return res.status(400).json({ message: "Reply text is required" });
    }

    const existing = await prisma.reply.findUnique({
      where: { id: replyId },
    });

    if (!existing) {
      return res.status(404).json({ message: "Reply not found" });
    }

    if (existing.user_id !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const updated = await prisma.reply.update({
      where: { id: replyId },
      data: { reply },
    });

    return res.json({ message: "Reply updated", reply: updated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// --------------------------------------
// DELETE REPLY
// --------------------------------------
export const deleteReply = async (req: Request, res: Response) => {
  try {
    const replyId = parseInt((req as any).params.replyId);
    const userId = (req as any).userId as number;

    const existing = await prisma.reply.findUnique({
      where: { id: replyId },
    });

    if (!existing) {
      return res.status(404).json({ message: "Reply not found" });
    }

    if (existing.user_id !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await prisma.reply.delete({
      where: { id: replyId },
    });

    return res.json({ message: "Reply deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
