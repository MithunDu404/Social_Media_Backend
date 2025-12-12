import express from 'express'
import authRoutes from './routes/auth.routes.js'

const PORT = process.env.PORT || 3000;


const app = express();
app.use(express.json());
app.use("/auth",authRoutes);

app.listen(PORT, ()=>{
    console.log(`Server is Running on port: ${PORT}
        Visit the url: http://localhost:${PORT}`);
})

