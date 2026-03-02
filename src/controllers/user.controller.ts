import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

const MAX_USERNAME_LENGTH = 50;
const MIN_USERNAME_LENGTH = 2;
const MAX_ABOUT_LENGTH = 500;
const MAX_LOCATION_LENGTH = 200;

// Helper: Express route params are always defined when route matches
const params = (req: Request) => req.params as Record<string, string>;
const query = (req: Request) => req.query as Record<string, string>;

// ─── GET USER PROFILE ─────────────────────────────────────────
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const id = parseInt(params(req).id ?? '');
    if (isNaN(id)) return res.status(400).json({ message: "Invalid user ID" });

    const user = await prisma.user.findUnique({
      where: { id },
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

// ─── UPDATE USER PROFILE ──────────────────────────────────────
export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const id = parseInt(params(req).id ?? '');
    if (isNaN(id)) return res.status(400).json({ message: "Invalid user ID" });

    if (req.userId !== id)
      return res.status(403).json({ message: "You can only update your own profile" });

    const { user_name, phone, location, dob, about } = req.body;

    // Validate fields if provided
    if (user_name !== undefined) {
      if (
        typeof user_name !== "string" ||
        user_name.trim().length < MIN_USERNAME_LENGTH ||
        user_name.trim().length > MAX_USERNAME_LENGTH
      ) {
        return res.status(400).json({
          message: `Username must be between ${MIN_USERNAME_LENGTH} and ${MAX_USERNAME_LENGTH} characters`,
        });
      }
    }

    if (about !== undefined && typeof about === "string" && about.length > MAX_ABOUT_LENGTH) {
      return res.status(400).json({ message: `About must be at most ${MAX_ABOUT_LENGTH} characters` });
    }

    if (location !== undefined && typeof location === "string" && location.length > MAX_LOCATION_LENGTH) {
      return res.status(400).json({ message: `Location must be at most ${MAX_LOCATION_LENGTH} characters` });
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        user_name: user_name?.trim(),
        phone,
        location,
        dob,
        about,
      },
    });

    return res.json({ message: "Profile updated successfully", user: { ...user, password: "" } });
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ─── UPDATE PROFILE PICTURE ───────────────────────────────────
export const updateProfilePicture = async (req: Request, res: Response) => {
  try {
    const id = parseInt(params(req).id ?? '');
    if (isNaN(id)) return res.status(400).json({ message: "Invalid user ID" });

    if (req.userId !== id)
      return res.status(403).json({ message: "You can only update your own picture" });

    const { url } = req.body;

    if (!url || typeof url !== "string") {
      return res.status(400).json({ message: "Missing or invalid picture URL" });
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      return res.status(400).json({ message: "Invalid URL format" });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { picture_url: url },
    });

    return res.json({ message: "Profile picture updated successfully", user: { ...user, password: "" } });
  } catch (err) {
    // Do NOT leak err details
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ─── GET USER POSTS ───────────────────────────────────────────
export const getUserPosts = async (req: Request, res: Response) => {
  try {
    const id = parseInt(params(req).id ?? '');
    if (isNaN(id)) return res.status(400).json({ message: "Invalid user ID" });

    const limit = Math.min(parseInt(query(req).limit || "10"), 50);
    const page = Math.max(parseInt(query(req).page || "1"), 1);
    const skip = (page - 1) * limit;

    const posts = await prisma.post.findMany({
      where: { user_id: id },
      take: limit,
      skip,
      include: {
        medias: true,
        _count: {
          select: { comments: true, likes: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json(posts);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ─── SEARCH USERS ─────────────────────────────────────────────
export const searchUsers = async (req: Request, res: Response) => {
  try {
    const q = query(req);
    const search = q.search;
    const userId = req.userId!;
    // Cap max results to prevent data dumps
    const limit = Math.min(parseInt(q.limit || "10"), 20);

    if (!search) {
      const users = await prisma.user.findMany({
        where: { id: { not: userId } },
        take: limit,
        select: {
          id: true,
          user_name: true,
          picture_url: true,
        },
      });
      return res.json(users);
    }

    // Validate search length to prevent abuse
    if (search.length > 100) {
      return res.status(400).json({ message: "Search query too long" });
    }

    const users = await prisma.user.findMany({
      where: {
        user_name: {
          contains: search,
          mode: "insensitive",
        },
      },
      take: limit,
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

// ─── GET FOLLOWERS ────────────────────────────────────────────
export const getFollowers = async (req: Request, res: Response) => {
  try {
    const id = parseInt(params(req).id ?? '');
    if (isNaN(id)) return res.status(400).json({ message: "Invalid user ID" });

    const followers = await prisma.follow.findMany({
      where: { following_id: id },
      include: {
        follower: {
          select: { id: true, user_name: true, picture_url: true },
        },
      },
    });

    return res.json(followers.map((f) => f.follower));
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ─── GET FOLLOWINGS ───────────────────────────────────────────
export const getFollowings = async (req: Request, res: Response) => {
  try {
    const id = parseInt(params(req).id ?? '');
    if (isNaN(id)) return res.status(400).json({ message: "Invalid user ID" });

    const followings = await prisma.follow.findMany({
      where: { follower_id: id },
      include: {
        following: {
          select: { id: true, user_name: true, picture_url: true },
        },
      },
    });

    return res.json(followings.map((f) => f.following));
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
};
