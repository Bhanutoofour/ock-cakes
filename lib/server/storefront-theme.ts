import { db } from "@/lib/db";
import type { Product } from "@/lib/store-schema";

export type StorefrontTheme = {
  picksEyebrow: string;
  picksHeading: string;
  picksSubheading: string;
  picksProductIds: string[];
};

export const DEFAULT_STOREFRONT_THEME: StorefrontTheme = {
  picksEyebrow: "Hyderabad Loves",
  picksHeading: "Best Sellers",
  picksSubheading: "",
  picksProductIds: [],
};

let ensureThemeTablePromise: Promise<void> | null = null;

async function ensureThemeTable() {
  if (!ensureThemeTablePromise) {
    ensureThemeTablePromise = db.query(`
      create table if not exists storefront_theme (
        id text primary key,
        settings jsonb not null default '{}'::jsonb,
        updated_at timestamptz not null default now()
      )
    `).then(() => undefined);
  }
  await ensureThemeTablePromise;
}

function normalizeTheme(value: Partial<StorefrontTheme> | null | undefined): StorefrontTheme {
  return {
    picksEyebrow: typeof value?.picksEyebrow === "string" ? value.picksEyebrow.slice(0, 80) : DEFAULT_STOREFRONT_THEME.picksEyebrow,
    picksHeading: typeof value?.picksHeading === "string" ? value.picksHeading.slice(0, 100) : DEFAULT_STOREFRONT_THEME.picksHeading,
    picksSubheading: typeof value?.picksSubheading === "string" ? value.picksSubheading.slice(0, 180) : DEFAULT_STOREFRONT_THEME.picksSubheading,
    picksProductIds: Array.isArray(value?.picksProductIds)
      ? value.picksProductIds.filter((id): id is string => typeof id === "string").slice(0, 12)
      : DEFAULT_STOREFRONT_THEME.picksProductIds,
  };
}

export async function getStorefrontTheme(): Promise<StorefrontTheme> {
  await ensureThemeTable();
  const result = await db.query<{ settings: Partial<StorefrontTheme> }>(
    "select settings from storefront_theme where id = $1 limit 1",
    ["homepage"],
  );
  return normalizeTheme(result.rows[0]?.settings);
}

export async function saveStorefrontTheme(value: Partial<StorefrontTheme>, products: Product[]) {
  await ensureThemeTable();
  const validIds = new Set(products.map((product) => product.id));
  const settings = normalizeTheme(value);
  settings.picksProductIds = settings.picksProductIds.filter((id) => validIds.has(id));
  await db.query(
    `insert into storefront_theme (id, settings, updated_at)
     values ($1, $2::jsonb, now())
     on conflict (id) do update set settings = excluded.settings, updated_at = now()`,
    ["homepage", JSON.stringify(settings)],
  );
  return settings;
}
