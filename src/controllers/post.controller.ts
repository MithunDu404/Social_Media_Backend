import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

const MAX_TITLE_LENGTH = 200;
const MAX_BLOG_LENGTH = 10000;

const params = (req: Request) => req.params as Record<string, string>;
const query = (req: Request) => req.query as Record<string, string>;

// ─── CREATE POST ──────────────────────────────────────────────
export const createPost = async (req: Request, res: Response) => {
  try {
    const { title, blog } = req.body;
    const userId = req.userId!;

    if (!title || !blog)
      return res.status(400).json({ message: "Title and blog content are required." });

    if (typeof title !== "string" || title.trim().length === 0 || title.length > MAX_TITLE_LENGTH)
      return res.status(400).json({ message: `Title must be 1–${MAX_TITLE_LENGTH} characters` });

    if (typeof blog !== "string" || blog.trim().length === 0 || blog.length > MAX_BLOG_LENGTH)
      return res.status(400).json({ message: `Blog content must be 1–${MAX_BLOG_LENGTH} characters` });

    const post = await prisma.post.create({
      data: {
        title: title.trim(),
        blog,
        user_id: userId,
      },
    });

    return res.status(201).json({ message: "Post created successfully", post });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ─── ADD MEDIA TO POST ────────────────────────────────────────
export const addMediaToPost = async (req: Request, res: Response) => {
  try {
    const postId = parseInt(params(req).postId ?? '');
    if (isNaN(postId)) return res.status(400).json({ message: "Invalid post ID" });

    const { url, content_type, size } = req.body;

    if (!url || !content_type)
      return res.status(400).json({ message: "Missing media fields" });

    if (typeof url !== "string") {
      return res.status(400).json({ message: "Invalid URL" });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return res.status(400).json({ message: "Invalid URL format" });
    }

    const post = await prisma.post.findUnique({ where: { id: postId } });

    if (!post)
      return res.status(404).json({ message: "Post not found" });

    if (post.user_id !== req.userId)
      return res.status(403).json({ message: "Unauthorized" });

    const media = await prisma.media.create({
      data: {
        url,
        content_type,
        size: typeof size === "number" ? size : null,
        post_id: postId,
      },
    });

    return res.json({ message: "Media added", media });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ─── GET SINGLE POST ──────────────────────────────────────────
export const getPostById = async (req: Request, res: Response) => {
  try {
    const postId = parseInt(params(req).postId ?? '');
    if (isNaN(postId)) return res.status(400).json({ message: "Invalid post ID" });
    const userId = req.userId!;

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        medias: true,
        user: { select: { id: true, user_name: true, picture_url: true } },
        likes: {
          where: { user_id: userId },
          select: { user_id: true },
        },
        _count: {
          select: { comments: true, likes: true },
        },
      },
    });

    if (!post) return res.status(404).json({ message: "Post not found" });

    const { likes, _count, ...rest } = post;
    const formattedPost = {
      ...rest,
      commentCount: _count.comments,
      likeCount: _count.likes,
      isLiked: likes.length > 0,
    };

    return res.json(formattedPost);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ─── GET POSTS BY SPECIFIC USER ───────────────────────────────
export const getUserPosts = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(params(req).userId ?? '');
    if (isNaN(userId)) return res.status(400).json({ message: "Invalid user ID" });
    const loggedUserId = req.userId!;
    const q = query(req);
    const limit = Math.min(parseInt(q.limit || "10"), 50);
    const page = Math.max(parseInt(q.page || "1"), 1);
    const skip = (page - 1) * limit;

    const posts = await prisma.post.findMany({
      where: { user_id: userId },
      take: limit,
      skip,
      include: {
        medias: true,
        user: { select: { id: true, user_name: true, picture_url: true } },
        likes: {
          where: { user_id: loggedUserId },
          select: { user_id: true },
        },
        _count: {
          select: { comments: true, likes: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedPosts = posts.map((post) => {
      const { likes, _count, ...rest } = post;
      return {
        ...rest,
        commentCount: _count.comments,
        likeCount: _count.likes,
        isLiked: likes.length > 0,
      };
    });

    return res.json(formattedPosts);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ─── GET FEED POSTS ───────────────────────────────────────────
export const getFeedPosts = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;

    const following = await prisma.follow.findMany({
      where: { follower_id: userId },
      select: { following_id: true },
    });

    const followingIds = following.map((f) => f.following_id);
    followingIds.push(userId); // include own posts

    const q = query(req);
    const limit = Math.min(parseInt(q.limit || "10"), 50);
    const page = Math.max(parseInt(q.page || "1"), 1);
    const skip = (page - 1) * limit;

    const posts = await prisma.post.findMany({
      where: { user_id: { in: followingIds } },
      take: limit,
      skip,
      include: {
        medias: true,
        user: { select: { id: true, user_name: true, picture_url: true } },
        likes: {
          where: { user_id: userId },
          select: { user_id: true },
        },
        _count: {
          select: { comments: true, likes: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedPosts = posts.map((post) => {
      const { likes, _count, ...rest } = post;
      return {
        ...rest,
        commentCount: _count.comments,
        likeCount: _count.likes,
        isLiked: likes.length > 0,
      };
    });

    return res.json(formattedPosts);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ─── UPDATE POST ──────────────────────────────────────────────
export const updatePost = async (req: Request, res: Response) => {
  try {
    const postId = parseInt(params(req).postId ?? '');
    if (isNaN(postId)) return res.status(400).json({ message: "Invalid post ID" });

    const { title, blog } = req.body;

    if (title !== undefined) {
      if (typeof title !== "string" || title.trim().length === 0 || title.length > MAX_TITLE_LENGTH)
        return res.status(400).json({ message: `Title must be 1–${MAX_TITLE_LENGTH} characters` });
    }

    if (blog !== undefined) {
      if (typeof blog !== "string" || blog.trim().length === 0 || blog.length > MAX_BLOG_LENGTH)
        return res.status(400).json({ message: `Blog content must be 1–${MAX_BLOG_LENGTH} characters` });
    }

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.user_id !== req.userId)
      return res.status(403).json({ message: "Unauthorized" });

    const updated = await prisma.post.update({
      where: { id: postId },
      data: { title: title?.trim(), blog },
    });

    return res.json({ message: "Post updated", updated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ─── DELETE POST ──────────────────────────────────────────────
export const deletePost = async (req: Request, res: Response) => {
  try {
    const postId = parseInt(params(req).postId ?? '');
    if (isNaN(postId)) return res.status(400).json({ message: "Invalid post ID" });

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.user_id !== req.userId)
      return res.status(403).json({ message: "Unauthorized" });

    await prisma.post.delete({ where: { id: postId } });

    return res.json({ message: "Post deleted" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
