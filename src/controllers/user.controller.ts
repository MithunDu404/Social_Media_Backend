import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";

// GET USER PROFILE

export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const id = (req as any).params.id;

    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        user_name: true,
        email: true,
        picture_url: true,
        location: true,
        dob: true,
        about: true,
      },
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json(user);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// UPDATE USER PROFILE

export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const id = (req as any).params.id;

    if ((req as any).userId !== Number(id))
      return res.status(403).json({ message: "You can only update your own profile" });

    const { user_name, phone, location, dob, about } = req.body;

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { user_name, phone, location, dob, about },
    });

    return res.json({ message: "Profile updated successfully", user:{...user, password: ""} });
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

// UPDATE PROFILE PICTURE
export const updateProfilePicture = async (req: Request, res: Response) => {
  try {
    const id = (req as any).params.id;

    if ((req as any).userId !== Number(id))
      return res.status(403).json({ message: "You can only update your own picture" });

    const { url } = req.body; // UploadThing returns URL

    if (!url) return res.status(400).json({ message: "Missing picture URL" });

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { picture_url: url },
    });

    return res.json({ message: "Profile picture updated successfully", user:{...user, password: ""} });
  } catch (err) {
    return res.status(500).json({ message: "Internal server error",err });
  }
};

// GET USER POSTS
export const getUserPosts = async (req: Request, res: Response) => {
  try {
    const id = (req as any).params.id;

    const posts = await prisma.post.findMany({
      where: { user_id: parseInt(id) },
      include: {
        medias: true,
        comments: true,
        likes: true,
      },
    });

    return res.json(posts);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// SEARCH USERS
export const searchUsers = async (req: Request, res: Response) => {
  try {
    const search = req.query.search as string;

    if (!search) return res.json([]);

    const users = await prisma.user.findMany({
      where: {
        user_name: {
          contains: search,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        user_name: true,
        picture_url: true,
      },
    });

    return res.json(users);
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GET FOLLOWERS
export const getFollowers = async (req: Request, res: Response) => {
  try {
    const id = (req as any).params.id;

    const followers = await prisma.follow.findMany({
      where: { following_id: parseInt(id) },
      include: {
        follower: {
          select: { id: true, user_name: true, picture_url: true },
        },
      },
    });

    return res.json(followers.map(f => f.follower));
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GET FOLLOWINGS
export const getFollowings = async (req: Request, res: Response) => {
  try {
    const id = (req as any).params.id;

    const followings = await prisma.follow.findMany({
      where: { follower_id: parseInt(id) },
      include: {
        following: {
          select: { id: true, user_name: true, picture_url: true },
        },
      },
    });

    return res.json(followings.map(f => f.following));
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
};
