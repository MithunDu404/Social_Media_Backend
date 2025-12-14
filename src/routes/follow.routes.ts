import { Router } from "express";
import {
  toggleFollow,
  getFollowers,
  getFollowings
} from "../controllers/follow.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

// Follow / Unfollow user
router.post("/:userId", authMiddleware, toggleFollow);

// Get followers of a user
router.get("/:userId/followers", authMiddleware, getFollowers);

// Get followings of a user
router.get("/:userId/followings", authMiddleware, getFollowings);

export default router;
