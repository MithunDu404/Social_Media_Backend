import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";

// --------------------------------------
// CREATE POST
// --------------------------------------
export const createPost = async (req: Request, res: Response) => {
  try {
    const { title, blog } = req.body;
    const userId = (req as any).userId;

    if (!title || !blog)
      return res.status(400).json({ message: "Title and blog content are required." });

    const post = await prisma.post.create({
      data: {
        title,
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

// --------------------------------------
// ADD MEDIA TO POST (UploadThing URL)
// --------------------------------------
export const addMediaToPost = async (req: Request, res: Response) => {
  try {
    const { postId } = (req as any).params;
    const { url, content_type, size } = req.body;

    if (!url || !content_type)
      return res.status(400).json({ message: "Missing media fields" });

    const post = await prisma.post.findUnique({
      where: { id: parseInt(postId) },
    });

    if (!post)
      return res.status(404).json({ message: "Post not found" });

    if (post.user_id !== (req as any).userId)
      return res.status(403).json({ message: "Unauthorized" });

    const media = await prisma.media.create({
      data: {
        url,
        content_type,
        size,
        post_id: parseInt(postId),
      },
    });

    return res.json({ message: "Media added", media });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// --------------------------------------
// GET SINGLE POST
// --------------------------------------
export const getPostById = async (req: Request, res: Response) => {
  try {
    const postId = parseInt((req as any).params.postId);

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        medias: true,
        user: { select: { id: true, user_name: true, picture_url: true } },
        _count:{
          select:{ comments: true, likes: true}
        }
      },
    });

    if (!post) return res.status(404).json({ message: "Post not found" });

  //  const { _count, ...rest } = post;
  //  const formmatedPost = {
  //   ...rest,
  //   commentCount: _count.comments,
  //   likeCount: _count.likes
  //  }

    return res.json(post);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "internal server error" });
  }
};

// --------------------------------------
// GET POSTS BY SPECIFIC USER
// --------------------------------------
export const getUserPosts = async (req: Request, res: Response) => {
  try {
    const userId = parseInt((req as any).params.userId);

    const posts = await prisma.post.findMany({
      where: { user_id: userId },
      include: { 
        medias: true,
        user: { select: { id: true, user_name: true, picture_url: true } },
        _count:{
          select:{ comments: true, likes: true}
        }
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json(posts);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "internal server error" });
  }
};

// --------------------------------------
// GET FEED POSTS (from people the user follows)
// --------------------------------------
export const getFeedPosts = async (req: Request, res: Response) => {
  try {
    const userId = parseInt((req as any).userId);

    const following = await prisma.follow.findMany({
      where: { follower_id: userId },
      select: { following_id: true },
    });

    const followingIds = following.map(f => f.following_id);

    const posts = await prisma.post.findMany({
      where: {
        user_id: { in: followingIds },
      },
      include: {
        medias: true,
        user: { select: { id: true, user_name: true, picture_url: true } },
        _count:{
          select:{ comments: true, likes: true}
        }
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json(posts);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// --------------------------------------
// UPDATE POST
// --------------------------------------
export const updatePost = async (req: Request, res: Response) => {
  try {
    const postId = parseInt((req as any).params.postId);
    const { title, blog } = req.body;

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.user_id !== (req as any).userId)
      return res.status(403).json({ message: "Unauthorized" });

    const updated = await prisma.post.update({
      where: { id: postId },
      data: { title, blog },
    });

    return res.json({ message: "Post updated", updated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// --------------------------------------
// DELETE POST
// --------------------------------------
export const deletePost = async (req: Request, res: Response) => {
  try {
    const postId = parseInt((req as any).params.postId);

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.user_id !== (req as any).userId)
      return res.status(403).json({ message: "Unauthorized" });

    // await prisma.media.deleteMany({ where: { post_id: postId } });

    await prisma.post.delete({ where: { id: postId } });

    return res.json({ message: "Post deleted" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
