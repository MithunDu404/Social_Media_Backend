import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

// --------------------------------------
// CREATE COMMENT
// --------------------------------------
export const createComment = async (req: Request, res: Response) => {
  try {
    const postId = parseInt((req as any).params.postId);
    const userId = (req as any).userId as number;
    const { comment } = req.body;

    if (!comment)
      return res.status(400).json({ message: "Comment text is required" });

    // Check post exists
    const postExists = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!postExists)
      return res.status(404).json({ message: "Post not found" });

    const newComment = await prisma.comment.create({
      data: {
        comment,
        post_id: postId,
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
      message: "Comment added successfully",
      comment: newComment,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// --------------------------------------
// GET COMMENTS OF A POST
// --------------------------------------
export const getPostComments = async (req: Request, res: Response) => {
  try {
    const postId = parseInt((req as any).params.postId);

    const comments = await prisma.comment.findMany({
      where: { post_id: postId },
      include: {
        user: {
          select: {
            id: true,
            user_name: true,
            picture_url: true,
          },
        },
        _count:{
            select: {replies: true, likes: true}
        }
      },
      orderBy: { createdAt: "asc" },
    });

    return res.json(comments);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// --------------------------------------
// UPDATE COMMENT
// --------------------------------------
export const updateComment = async (req: Request, res: Response) => {
  try {
    const commentId = parseInt((req as any).params.commentId);
    const userId = (req as any).userId as number;
    const { comment } = req.body;

    if (!comment)
      return res.status(400).json({ message: "Comment text is required" });

    const existing = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!existing)
      return res.status(404).json({ message: "Comment not found" });

    if (existing.user_id !== userId)
      return res.status(403).json({ message: "Unauthorized" });

    const updated = await prisma.comment.update({
      where: { id: commentId },
      data: { comment },
    });

    return res.json({ message: "Comment updated", comment: updated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// --------------------------------------
// DELETE COMMENT
// --------------------------------------
export const deleteComment = async (req: Request, res: Response) => {
  try {
    const commentId = parseInt((req as any).params.commentId);
    const userId = (req as any).userId as number;

    const existing = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!existing)
      return res.status(404).json({ message: "Comment not found" });

    if (existing.user_id !== userId)
      return res.status(403).json({ message: "Unauthorized" });

    await prisma.comment.delete({
      where: { id: commentId },
    });

    return res.json({ message: "Comment deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
