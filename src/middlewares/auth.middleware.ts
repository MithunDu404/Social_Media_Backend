import type { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || "secretkey"

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if(!authHeader || !authHeader.startsWith("Bearer ")){
            return res.status(401).json({message: "Unauthorized"});
        }
        const token = authHeader.split(" ")[1];
        if(!token){
            return res.status(401).json({message: "Token not Provided"});
        }

        const decoded = jwt.verify(token,JWT_SECRET) as {id: number};
        (req as any).userId = decoded.id;
        next();
    }catch(err){
        return res.status(401).json({message: "Invalid Token"})
    }
};