import { db } from "@/lib/db";
import type { Product } from "@/lib/store-schema";
import { DEFAULT_STOREFRONT_THEME, THEME_SECTION_IDS, type StorefrontTheme, type ThemeSectionId } from "@/lib/storefront-theme-schema";

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
  const sectionOrder = Array.isArray(value?.sectionOrder)
    ? [...new Set(value.sectionOrder.filter((id): id is ThemeSectionId => THEME_SECTION_IDS.includes(id))), ...THEME_SECTION_IDS.filter((id) => !value.sectionOrder!.includes(id))]
    : DEFAULT_STOREFRONT_THEME.sectionOrder;
  const sectionCopy = { ...DEFAULT_STOREFRONT_THEME.sectionCopy };
  if (value?.sectionCopy && typeof value.sectionCopy === "object") {
    for (const id of THEME_SECTION_IDS) {
      const incoming = value.sectionCopy[id];
      const fallback = DEFAULT_STOREFRONT_THEME.sectionCopy[id]!;
      if (incoming && typeof incoming === "object") {
        sectionCopy[id] = {
          eyebrow: typeof incoming.eyebrow === "string" ? incoming.eyebrow.slice(0, 80) : fallback.eyebrow,
          heading: typeof incoming.heading === "string" ? incoming.heading.slice(0, 120) : fallback.heading,
          description: typeof incoming.description === "string" ? incoming.description.slice(0, 240) : fallback.description,
          ctaText: typeof incoming.ctaText === "string" ? incoming.ctaText.slice(0, 60) : fallback.ctaText,
          ctaHref: typeof incoming.ctaHref === "string" ? incoming.ctaHref.slice(0, 240) : fallback.ctaHref,
        };
      }
    }
  }
  return {
    ...DEFAULT_STOREFRONT_THEME,
    ...value,
    picksEyebrow: typeof value?.picksEyebrow === "string" ? value.picksEyebrow.slice(0, 80) : DEFAULT_STOREFRONT_THEME.picksEyebrow,
    picksHeading: typeof value?.picksHeading === "string" ? value.picksHeading.slice(0, 100) : DEFAULT_STOREFRONT_THEME.picksHeading,
    picksSubheading: typeof value?.picksSubheading === "string" ? value.picksSubheading.slice(0, 180) : DEFAULT_STOREFRONT_THEME.picksSubheading,
    picksProductIds: Array.isArray(value?.picksProductIds) ? value.picksProductIds.filter((id): id is string => typeof id === "string").slice(0, 5) : [],
    sectionOrder,
    hiddenSections: Array.isArray(value?.hiddenSections) ? value.hiddenSections.filter((id): id is ThemeSectionId => THEME_SECTION_IDS.includes(id)) : [],
    sectionCopy,
    brandPrimary: typeof value?.brandPrimary === "string" && /^#[0-9a-f]{6}$/i.test(value.brandPrimary) ? value.brandPrimary : DEFAULT_STOREFRONT_THEME.brandPrimary,
    pageBackground: typeof value?.pageBackground === "string" && /^#[0-9a-f]{6}$/i.test(value.pageBackground) ? value.pageBackground : DEFAULT_STOREFRONT_THEME.pageBackground,
    heroTitle: typeof value?.heroTitle === "string" ? value.heroTitle.slice(0, 120) : DEFAULT_STOREFRONT_THEME.heroTitle,
    heroSubtitle: typeof value?.heroSubtitle === "string" ? value.heroSubtitle.slice(0, 240) : DEFAULT_STOREFRONT_THEME.heroSubtitle,
    heroCtaText: typeof value?.heroCtaText === "string" ? value.heroCtaText.slice(0, 60) : DEFAULT_STOREFRONT_THEME.heroCtaText,
    heroCtaHref: typeof value?.heroCtaHref === "string" ? value.heroCtaHref.slice(0, 240) : DEFAULT_STOREFRONT_THEME.heroCtaHref,
    heroImage: typeof value?.heroImage === "string" ? value.heroImage.slice(0, 500) : DEFAULT_STOREFRONT_THEME.heroImage,
  };
}

export async function getStorefrontTheme(): Promise<StorefrontTheme> {
  await ensureThemeTable();
  const result = await db.query<{ settings: Partial<StorefrontTheme> }>("select settings from storefront_theme where id = $1 limit 1", ["homepage"]);
  return normalizeTheme(result.rows[0]?.settings);
}

export async function saveStorefrontTheme(value: Partial<StorefrontTheme>, products: Product[]) {
  await ensureThemeTable();
  const validIds = new Set(products.map((product) => product.id));
  const settings = normalizeTheme(value);
  settings.picksProductIds = settings.picksProductIds.filter((id) => validIds.has(id));
  await db.query(
    `insert into storefront_theme (id, settings, updated_at) values ($1, $2::jsonb, now())
     on conflict (id) do update set settings = excluded.settings, updated_at = now()`,
    ["homepage", JSON.stringify(settings)],
  );
  return settings;
}
