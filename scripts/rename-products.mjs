// Renames products in the database using scripts/product-renames.json.
// Only `name` (and `image`, where an entry has `newImage`) change, and only when the current name still matches
// `oldName`, so edits made in the admin panel since are never overwritten.
//
//   node scripts/rename-products.mjs          # dry run: shows what would change
//   node scripts/rename-products.mjs --apply  # writes the changes
import { readFile } from "node:fs/promises";
import path from "node:path";
import pg from "pg";

const { Pool } = pg;

async function loadEnvFile(fileName) {
  const filePath = path.join(process.cwd(), fileName);

  try {
    const content = await readFile(filePath, "utf8");
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }

      const separatorIndex = trimmed.indexOf("=");
      if (separatorIndex === -1) {
        continue;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      const value = trimmed.slice(separatorIndex + 1).trim();
      if (!(key in process.env)) {
        process.env[key] = value;
      }
    }
  } catch {
    // Ignore missing env files.
  }
}

await loadEnvFile(".env.local");
await loadEnvFile(".env");

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const apply = process.argv.includes("--apply");
const renames = JSON.parse(
  await readFile(path.join(process.cwd(), "scripts/product-renames.json"), "utf8"),
);

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const client = await pool.connect();

let changed = 0;
let alreadyDone = 0;
const skipped = [];

try {
  await client.query("begin");

  for (const { id, oldName, newName, newImage } of renames) {
    const { rows } = await client.query("select name from products where id = $1", [id]);
    const current = rows[0]?.name?.trim();

    if (current === undefined) {
      skipped.push(`${id}: not found`);
    } else if (current === newName) {
      alreadyDone += 1;
    } else if (current !== oldName) {
      skipped.push(`${id}: name is now "${current}" (expected "${oldName}")`);
    } else {
      if (apply) {
        await client.query("update products set name = $1 where id = $2", [newName, id]);
        if (newImage) {
          await client.query("update products set image = $1 where id = $2", [newImage, id]);
        }
      }
      changed += 1;
    }
  }

  await client.query(apply ? "commit" : "rollback");
} catch (error) {
  await client.query("rollback");
  throw error;
} finally {
  client.release();
  await pool.end();
}

console.log(`${apply ? "Renamed" : "Would rename"}: ${changed}`);
console.log(`Already renamed: ${alreadyDone}`);
if (skipped.length > 0) {
  console.log(`Skipped (${skipped.length}):\n  ${skipped.join("\n  ")}`);
}
if (!apply) {
  console.log("\nDry run only. Re-run with --apply to save the changes.");
}
