import "dotenv/config";
import dns from "node:dns";
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client.js'

// Force IPv4 — Render free tier does not support outbound IPv6
dns.setDefaultResultOrder("ipv4first");

const connectionString = `${process.env.DATABASE_URL}`

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

export { prisma }