import { Pool } from "pg";

declare global {
  var __ockPool: Pool | undefined;
}

function createPool() {
  return new Pool({
    connectionString:
      process.env.DATABASE_URL ??
      "postgres://postgres:postgres@127.0.0.1:5432/occasionkart",
  });
}

export const db = globalThis.__ockPool ?? createPool();

if (process.env.NODE_ENV !== "production") {
  globalThis.__ockPool = db;
}
