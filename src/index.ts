import express from 'express'
import authRoutes from './routes/auth.routes.js'
import userRoutes from './routes/user.routes.js'
import postRoutes from './routes/post.routes.js'
import commentRoutes from './routes/comment.routes.js'
import replyRoutes from './routes/reply.routes.js'

const PORT = process.env.PORT || 3000;


const app = express();
app.use(express.json());
app.use("/auth",authRoutes);
app.use("/users", userRoutes);
app.use("/posts",postRoutes);
app.use("/comments",commentRoutes);
app.use("/replies",replyRoutes);

app.listen(PORT, ()=>{
    console.log(`Server is Running on port: ${PORT}
        Visit the url: http://localhost:${PORT}`);
})

