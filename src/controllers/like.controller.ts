import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { createNotification } from "../services/notification.service.js";

// ------------------------------------
// TOGGLE POST LIKE
// ------------------------------------
export const togglePostLike = async (req: Request, res: Response) => {
  try {
    const postId = parseInt((req as any).params.postId);
    const userId = (req as any).userId as number;

    const post = await prisma.post.findUnique({
      where:{id: postId},
      select:{user_id: true}
    })

    if(!post) return res.status(404).json({message: "Post not found"});

    const existing = await prisma.postLikes.findUnique({
      where: {
        post_id_user_id: {
          post_id: postId,
          user_id: userId,
        },
      },
    });

    if (existing) {
      await prisma.postLikes.delete({
        where: {
          post_id_user_id: {
            post_id: postId,
            user_id: userId,
          },
        },
      });
      return res.json({ liked: false });
    }

    await prisma.postLikes.create({
      data: {
        post_id: postId,
        user_id: userId,
      },
    });

    await createNotification({
      creatorId: userId,
      receiverId: post.user_id,
      reason: "POST_LIKE",
    });


    return res.json({ liked: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ------------------------------------
// TOGGLE COMMENT LIKE
// ------------------------------------
export const toggleCommentLike = async (req: Request, res: Response) => {
  try {
    const commentId = parseInt((req as any).params.commentId);
    const userId = (req as any).userId as number;

    const comment = await prisma.comment.findUnique({
      where:{id: commentId},
      select:{user_id: true}
    })

    if(!comment) return res.status(404).json({message: "Comment not found"});

    const existing = await prisma.commentLikes.findUnique({
      where: {
        comment_id_user_id: {
          comment_id: commentId,
          user_id: userId,
        },
      },
    });

    if (existing) {
      await prisma.commentLikes.delete({
        where: {
          comment_id_user_id: {
            comment_id: commentId,
            user_id: userId,
          },
        },
      });
      return res.json({ liked: false });
    }

    await prisma.commentLikes.create({
      data: {
        comment_id: commentId,
        user_id: userId,
      },
    });

    await createNotification({
      creatorId: userId,
      receiverId: comment.user_id,
      reason: "COMMENT_LIKE",
    });

    return res.json({ liked: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ------------------------------------
// TOGGLE REPLY LIKE
// ------------------------------------
export const toggleReplyLike = async (req: Request, res: Response) => {
  try {
    const replyId = parseInt((req as any).params.replyId);
    const userId = (req as any).userId as number;

    const reply = await prisma.reply.findUnique({
      where:{id: replyId},
      select:{user_id: true}
    })

    if(!reply) return res.status(404).json({message: "Reply not found"});

    const existing = await prisma.replyLikes.findUnique({
      where: {
        reply_id_user_id: {
          reply_id: replyId,
          user_id: userId,
        },
      },
    });

    if (existing) {
      await prisma.replyLikes.delete({
        where: {
          reply_id_user_id: {
            reply_id: replyId,
            user_id: userId,
          },
        },
      });
      return res.json({ liked: false });
    }

    await prisma.replyLikes.create({
      data: {
        reply_id: replyId,
        user_id: userId,
      },
    });

    await createNotification({
      creatorId: userId,
      receiverId: reply.user_id,
      reason: "REPLY_LIKE",
    });

    return res.json({ liked: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ------------------------------------
// GET POST LIKES
// ------------------------------------
export const getPostLikes = async (req: Request, res: Response) => {
  try {
    const postId = parseInt((req as any).params.postId);

    const likes = await prisma.postLikes.findMany({
      where: { post_id: postId },
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

    return res.json({
      count: likes.length,
      users: likes.map(l => l.user),
    });
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ------------------------------------
// GET COMMENT LIKES
// ------------------------------------
export const getCommentLikes = async (req: Request, res: Response) => {
  try {
    const commentId = parseInt((req as any).params.commentId);

    const likes = await prisma.commentLikes.findMany({
      where: { comment_id: commentId },
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

    return res.json({
      count: likes.length,
      users: likes.map(l => l.user),
    });
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ------------------------------------
// GET REPLY LIKES
// ------------------------------------
export const getReplyLikes = async (req: Request, res: Response) => {
  try {
    const replyId = parseInt((req as any).params.replyId);

    const likes = await prisma.replyLikes.findMany({
      where: { reply_id: replyId },
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

    return res.json({
      count: likes.length,
      users: likes.map(l => l.user),
    });
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
};
