# Social Media Backend

> A RESTful backend for a social media application using Node.js, TypeScript, Express and Prisma (Postgres).

## Features
- User auth (JWT)
- Posts, comments, replies
- Likes, follows
- Direct messages
- Notifications
- Rate limiting and middleware

## Project structure (high level)
- `src/controllers` — request handlers
- `src/routes` — route definitions (auth, user, post, comment, reply, like, follow, message, notification)
- `src/generated/prisma` — generated Prisma client and models
- `prisma` — schema and migrations
- `test.*.rest` — example REST requests for the VS Code REST client

## Prerequisites
- Node.js 18+ (or compatible)
- npm or yarn
- PostgreSQL (or another datasource supported by Prisma)

## Install

Install dependencies:

```bash
npm install
```

Generate Prisma client (if needed):

```bash
npx prisma generate
```

## Environment

Create a `.env` file in the project root with at least:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
JWT_SECRET="your_jwt_secret_here"
PORT=4000
```

Adjust other environment variables as required by your deployment or local setup.

## Database / Prisma

- Apply migrations (development):

```bash
npx prisma migrate dev
```

- Apply migrations (production):

```bash
npx prisma migrate deploy
```

- Open Prisma Studio:

```bash
npx prisma studio
```

Note: this repo already contains a `prisma/migrations` folder with migrations.

## Running the app

Development (watch):

```bash
npm run dev
```

If you need a production build, compile TypeScript and run the output (adjust as needed).

## API (base routes)

The server exposes REST endpoints under these main route groups:

- `POST /auth` — authentication (login/register)
- `GET/POST/PUT/DELETE /users` — user operations
- `GET/POST/PUT/DELETE /posts` — posts and feed
- `GET/POST/DELETE /comments` — comments on posts
- `GET/POST/DELETE /replies` — replies to comments
- `POST/DELETE /likes` — like/unlike resources
- `POST /follow` — follow/unfollow
- `GET/POST /messages` — direct messages
- `GET /notifications` — notifications

See the route files in `src/routes` for exact endpoints and expected payloads.

## Tests / Manual requests

There are `test.*.rest` files at the repository root you can use with the VS Code REST Client extension to exercise the API.

## Notes
- The project uses the Prisma client generated code under `src/generated/prisma` — regenerate after schema changes.
- Keep `JWT_SECRET` secure in production.

## Want help?
If you'd like, I can:
- Add a sample `.env.example` file
- Add a Docker Compose for Postgres + app
- Document each endpoint with request/response examples

---
Generated README for the repository.
