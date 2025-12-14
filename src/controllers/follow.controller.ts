import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { createNotification } from "../services/notification.service.js";

// --------------------------------------
// FOLLOW / UNFOLLOW (TOGGLE)
// --------------------------------------
export const toggleFollow = async (req: Request, res: Response) => {
  try {
    const followerId = (req as any).userId as number;
    const followingId = parseInt((req as any).params.userId);

    // Prevent self-follow
    if (followerId === followingId) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    // Check target user exists
    const userExists = await prisma.user.findUnique({
      where: { id: followingId },
    });

    if (!userExists) {
      return res.status(404).json({ message: "User not found" });
    }

    const existing = await prisma.follow.findUnique({
      where: {
        follower_id_following_id: {
          follower_id: followerId,
          following_id: followingId,
        },
      },
    });

    // Unfollow
    if (existing) {
      await prisma.follow.delete({
        where: {
          follower_id_following_id: {
            follower_id: followerId,
            following_id: followingId,
          },
        },
      });

      return res.json({ following: false });
    }

    // Follow
    await prisma.follow.create({
      data: {
        follower_id: followerId,
        following_id: followingId,
      },
    });
    
    await createNotification({
      creatorId: followerId,
      receiverId: followingId,
      reason: "FOLLOW",
    });

    return res.json({ following: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// --------------------------------------
// GET FOLLOWERS
// --------------------------------------
export const getFollowers = async (req: Request, res: Response) => {
  try {
    const userId = parseInt((req as any).params.userId);

    const followers = await prisma.follow.findMany({
      where: { following_id: userId },
      include: {
        follower: {
          select: {
            id: true,
            user_name: true,
            picture_url: true,
          },
        },
      },
    });

    return res.json({
      count: followers.length,
      users: followers.map(f => f.follower),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// --------------------------------------
// GET FOLLOWINGS
// --------------------------------------
export const getFollowings = async (req: Request, res: Response) => {
  try {
    const userId = parseInt((req as any).params.userId);

    const followings = await prisma.follow.findMany({
      where: { follower_id: userId },
      include: {
        following: {
          select: {
            id: true,
            user_name: true,
            picture_url: true,
          },
        },
      },
    });

    return res.json({
      count: followings.length,
      users: followings.map(f => f.following),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
