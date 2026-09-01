// lib/db.ts
//
// A single, shared Postgres connection pool, reused by every API route that
// needs to read or write to the database. Import { db } from here rather
// than creating a new connection in each route file.

import { Pool } from "pg";

// A pool keeps a small set of open connections ready to use, rather than
// opening and closing a new one for every single query — much faster under
// real traffic, and the standard pattern for any Node.js + Postgres app.
export const db = new Pool({
  connectionString: process.env.DATABASE_URL,
});