import rateLimit, { ipKeyGenerator } from "express-rate-limit";

// Standard rate limiter for authenticated routes (50/min per user or IP)
export const hybridRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 50,
  keyGenerator: (req) => {
    if (req.userId) {
      return `user:${req.userId}`;
    }
    return ipKeyGenerator(req.ip ?? "unknown-ip");
  },
  message: {
    error: "Too many requests. Please try again later."
  }
});

// Strict rate limiter for auth routes (10/min per IP) — prevents brute-force
export const authRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: {
    error: "Too many authentication attempts. Please try again later."
  }
});
