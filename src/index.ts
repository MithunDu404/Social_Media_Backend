import express from 'express'
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

const PORT = process.env.PORT || 3000;

const app = express();

app.use(
  cors({
    origin: "http://localhost:3001",
    credentials: true,
  })
);
app.use(express.json());
app.use("/auth",authRoutes);
app.use("/users", userRoutes);
app.use("/posts",postRoutes);
app.use("/comments",commentRoutes);
app.use("/replies",replyRoutes);
app.use("/likes",likeRoutes);
app.use("/follow",followRoutes);
app.use("/messages",messageRoutes);
app.use("/notifications",notificationRoutes);

app.listen(PORT, ()=>{
    console.log(`Server is Running on port: ${PORT}
        Visit the url: http://localhost:${PORT}`);
})

