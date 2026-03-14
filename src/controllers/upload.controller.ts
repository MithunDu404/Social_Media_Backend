import type { Request, Response } from "express";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export const getUploadSignature = async (req: Request, res: Response) => {
  try {
    const userId = req.userId; // Provided by authMiddleware

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: Missing user ID" });
    }

    const timestamp = Math.round(Date.now() / 1000);

    const params = {
      timestamp,
      folder: "social_media_prod",
      context: `uploader_id=${userId}`,
    };

    const signature = cloudinary.utils.api_sign_request(
      params,
      process.env.CLOUDINARY_API_SECRET!
    );

    return res.json({
      signature,
      timestamp,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      folder: params.folder,
      context: params.context,
    });
  } catch (err) {
    console.error("Cloudinary Signature Error:", err);
    return res.status(500).json({ message: "Failed to generate upload signature" });
  }
};
