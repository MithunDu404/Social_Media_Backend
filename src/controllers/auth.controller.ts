import type { Request,Response } from "express";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import {prisma} from '../lib/prisma.js'
