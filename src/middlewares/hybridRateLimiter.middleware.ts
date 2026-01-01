import rateLimit, { ipKeyGenerator } from "express-rate-limit";

export const hybridRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 50,
  keyGenerator: (req) => {
    if (req.userId) {
      return `user:${req.userId}`;
    }
    return ipKeyGenerator(req.ip?? "unknown-ip");
  },
  message: {
    error: "Too many requests. Please try again later."
  }
});
