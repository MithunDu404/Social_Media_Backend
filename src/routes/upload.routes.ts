import { Router } from "express";
import { getUploadSignature } from "../controllers/upload.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/signature", authMiddleware, getUploadSignature);

export default router;
