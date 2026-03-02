import "dotenv/config";
import express from 'express'
import helmet from 'helmet'
import authRoutes from './routes/auth.routes.js'
import userRoutes from './routes/user.routes.js'
import postRoutes from './routes/post.routes.js'
import commentRoutes from './routes/comment.routes.js'
import replyRoutes from './routes/reply.routes.js'
import likeRoutes from './routes/like.routes.js'
import followRoutes from './routes/follow.routes.js'
import messageRoutes from './routes/message.routes.js'
import notificationRoutes from './routes/notification.routes.js'
import cors from "cors";
import { globalRateLimiter } from './middlewares/globalRateLimiter.middleware.js'
import { errorHandler } from './middlewares/error.middleware.js'

// ─── Startup Validations ───────────────────────────────────────
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error("FATAL: JWT_SECRET must be set and at least 32 characters long.");
  process.exit(1);
}

const PORT = process.env.PORT || 3000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:3001";

const app = express();

// ─── Security Middleware ───────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
  })
);

app.set("trust proxy", 1);
app.use(globalRateLimiter);
app.use(express.json({ limit: "10kb" }));

// ─── Routes ────────────────────────────────────────────────────
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/posts", postRoutes);
app.use("/comments", commentRoutes);
app.use("/replies", replyRoutes);
app.use("/likes", likeRoutes);
app.use("/follow", followRoutes);
app.use("/messages", messageRoutes);
app.use("/notifications", notificationRoutes);

// ─── Global Error Handler (must be last) ───────────────────────
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is Running on port: ${PORT}
        Visit the url: http://localhost:${PORT}`);
})
