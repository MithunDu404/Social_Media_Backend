import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { createNotification } from "../services/notification.service.js";

const MAX_COMMENT_LENGTH = 2000;

const params = (req: Request) => req.params as Record<string, string>;
const query = (req: Request) => req.query as Record<string, string>;

// ─── CREATE COMMENT ───────────────────────────────────────────
export const createComment = async (req: Request, res: Response) => {
  try {
    const postId = parseInt(params(req).postId ?? '');
    if (isNaN(postId)) return res.status(400).json({ message: "Invalid post ID" });
    const userId = req.userId!;
    const { comment } = req.body;

    if (!comment || typeof comment !== "string" || comment.trim().length === 0)
      return res.status(400).json({ message: "Comment text is required" });

    if (comment.length > MAX_COMMENT_LENGTH)
      return res.status(400).json({ message: `Comment must be at most ${MAX_COMMENT_LENGTH} characters` });

    const postExists = await prisma.post.findUnique({
      where: { id: postId },
      select: { user_id: true },
    });

    if (!postExists)
      return res.status(404).json({ message: "Post not found" });

    const newComment = await prisma.comment.create({
      data: {
        comment: comment.trim(),
        post_id: postId,
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
      receiverId: postExists.user_id,
      reason: "COMMENT",
    });

    return res.status(201).json({
      message: "Comment added successfully",
      comment: newComment,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ─── GET COMMENTS OF A POST ───────────────────────────────────
export const getPostComments = async (req: Request, res: Response) => {
  try {
    const postId = parseInt(params(req).postId ?? '');
    if (isNaN(postId)) return res.status(400).json({ message: "Invalid post ID" });
    const q = query(req);
    const limit = Math.min(parseInt(q.limit || "10"), 50);
    const page = Math.max(parseInt(q.page || "1"), 1);
    const skip = (page - 1) * limit;

    const comments = await prisma.comment.findMany({
      where: { post_id: postId },
      take: limit,
      skip,
      include: {
        user: {
          select: { id: true, user_name: true, picture_url: true },
        },
        _count: {
          select: { replies: true, likes: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return res.json(comments);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ─── UPDATE COMMENT ───────────────────────────────────────────
export const updateComment = async (req: Request, res: Response) => {
  try {
    const commentId = parseInt(params(req).commentId ?? '');
    if (isNaN(commentId)) return res.status(400).json({ message: "Invalid comment ID" });
    const userId = req.userId!;
    const { comment } = req.body;

    if (!comment || typeof comment !== "string" || comment.trim().length === 0)
      return res.status(400).json({ message: "Comment text is required" });

    if (comment.length > MAX_COMMENT_LENGTH)
      return res.status(400).json({ message: `Comment must be at most ${MAX_COMMENT_LENGTH} characters` });

    const existing = await prisma.comment.findUnique({ where: { id: commentId } });

    if (!existing)
      return res.status(404).json({ message: "Comment not found" });

    if (existing.user_id !== userId)
      return res.status(403).json({ message: "Unauthorized" });

    const updated = await prisma.comment.update({
      where: { id: commentId },
      data: { comment: comment.trim() },
    });

    return res.json({ message: "Comment updated", comment: updated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ─── DELETE COMMENT ───────────────────────────────────────────
export const deleteComment = async (req: Request, res: Response) => {
  try {
    const commentId = parseInt(params(req).commentId ?? '');
    if (isNaN(commentId)) return res.status(400).json({ message: "Invalid comment ID" });
    const userId = req.userId!;

    const existing = await prisma.comment.findUnique({ where: { id: commentId } });

    if (!existing)
      return res.status(404).json({ message: "Comment not found" });

    if (existing.user_id !== userId)
      return res.status(403).json({ message: "Unauthorized" });

    await prisma.comment.delete({ where: { id: commentId } });

    return res.json({ message: "Comment deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
