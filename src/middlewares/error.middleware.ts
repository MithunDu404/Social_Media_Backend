import type { Request, Response, NextFunction } from "express";

export const errorHandler = (
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
) => {
    console.error("Unhandled error:", err.message);

    // Never leak stack traces or internal details to clients
    return res.status(500).json({ message: "Internal server error" });
};
