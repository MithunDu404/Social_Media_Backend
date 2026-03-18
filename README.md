<h1 align="center">Social Media Backend API 🚀</h1>

<p align="center">
  <a href="https://social-media-frontend-dusky-omega.vercel.app"><strong>Live Application</strong></a> | 
  <a href="https://github.com/MithunDu404/Social_Media_Frontend"><strong>Frontend Repository</strong></a>
</p>

<p align="center">
  A highly scalable, RESTful backend service for a full-stack social media application. Built with modern web technologies, providing a secure, robust API for user authentication, real-time-like social interactions, and media handling.
</p>

---

## 🛠️ Tech Stack

- **Runtime:** [Node.js](https://nodejs.org/) (v18+)
- **Framework:** [Express.js](https://expressjs.com/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Database ORM:** [Prisma](https://www.prisma.io/)
- **Database:** PostgreSQL (via [Supabase](https://supabase.com/))
- **Media Storage:** [Cloudinary](https://cloudinary.com/) (using secure Signed Uploads)
- **Authentication:** JSON Web Tokens (JWT)

---

## ✨ Features

- **🔐 Robust Authentication:** Secure user signup and login using JWT.
- **🖼️ Secure Media Uploads:** Generates cryptographic signatures for Cloudinary, ensuring API secrets never reach the client.
- **📝 Social Interactions:** Complete CRUD capabilities for Posts, Comments, and Nested Replies.
- **❤️ Engagement:** Like and Unlike functionality for various content types.
- **👥 Connections:** Follow and Unfollow users to curate a personal feed.
- **📩 Direct Messaging:** Private messaging capabilities between users.
- **🔔 Notifications:** System to alert users of interactions like new followers, likes, or comments.
- **🛡️ Security & Middleware:** Implements rate limiting and secure route protection to safeguard the API.

---

## 📂 Project Architecture

A clean, modular structure ensures scalability and ease of maintenance:

```text
src/
├── controllers/    # Request handlers & core business logic
├── middleware/     # JWT verification, error handling, rate limiting
├── routes/         # API route definitions
├── generated/      # Generated Prisma client types
└── utils/          # Helper functions (e.g., Cloudinary signature generation)
prisma/             # Database schema and migration history
test.*.rest         # REST Client test files for VS Code
```

---

## 🚀 Getting Started

Follow these instructions to set up the project locally.

### Prerequisites

- **Node.js**: `v18` or higher
- **npm** or **yarn**
- **PostgreSQL Database** (Local or cloud like Supabase, Neon, etc.)
- **Cloudinary Account** (for media upload functionality)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/MithunDu404/Social_Media_Backend.git
   cd Social_Media_Backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

### Environment Configuration

Create a `.env` file in the root directory and configure the following variables:

```env
# Server
PORT=4000
NODE_ENV=development

# Database (Supabase PostgreSQL Connection Pooling URL is recommended for production)
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"

# Authentication
JWT_SECRET="your_super_secret_jwt_string"

# Cloudinary (For signed media uploads)
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
```

### Database Setup (Prisma)

1. **Push schema to the database (development):**
   ```bash
   npx prisma db push
   # OR: npx prisma migrate dev
   ```

2. **Generate the Prisma Client:**
   ```bash
   npx prisma generate
   ```

3. *(Optional)* **Open Prisma Studio** to view your database GUI:
   ```bash
   npx prisma studio
   ```

### Running the Server

- **Development Mode** (auto-reloads on file changes):
  ```bash
  npm run dev
  ```
- **Production Build**:
  ```bash
  npm run build
  npm start
  ```

---

## 📡 API Endpoints Overview

The REST API endpoints are grouped logically. Here are the base routes:

| Group | Base Route | Description |
|---|---|---|
| **Auth** | `/auth` | Register, Login |
| **Users** | `/users` | Get profiles, update profile |
| **Posts** | `/posts` | Create, read, update, delete posts |
| **Comments** | `/comments` | Comment on posts |
| **Replies** | `/replies` | Nested replies under comments |
| **Likes** | `/likes` | Like / Unlike posts and comments |
| **Follows** | `/follow` | Follow / Unfollow users |
| **Messages** | `/messages` | Send and retrieve DMs |
| **Notifications**| `/notifications` | Retrieve user notification history |

*Note: Look inside `src/routes/` for specific endpoint configurations, parameters, and payloads.*

---

## 🧪 Testing the API

For convenience, the repository includes `.rest` files (e.g., `test.post.rest`, `test.auth.rest`). 
If you use VS Code, install the [REST Client extension](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) to easily fire off manual requests directly from these files.

---

## ☁️ Deployment

This backend is optimized for deployment on platforms like [Render](https://render.com/) or Railway.
Ensure you add a build step that compiles the TypeScript and generates the Prisma client before starting the node server.
