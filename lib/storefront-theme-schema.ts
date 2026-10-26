export type ThemeSectionId = "announcement" | "hero" | "categories" | "service" | "occasions" | "picks" | "flavors" | "promos" | "steps" | "faq" | "seo";

export const THEME_SECTION_IDS: ThemeSectionId[] = ["announcement", "hero", "categories", "service", "occasions", "picks", "flavors", "promos", "steps", "faq", "seo"];
export const THEME_SECTION_LABELS: Record<ThemeSectionId, string> = {
  announcement: "Delivery announcement", hero: "Hero banner", categories: "Cake collections", service: "Service highlights",
  occasions: "Shop by occasion", picks: "Featured cakes", flavors: "Shop by flavour", promos: "Custom and corporate orders",
  steps: "How to order", faq: "FAQs", seo: "About OccasionKart",
};

export type StorefrontTheme = {
  picksEyebrow: string;
  picksHeading: string;
  picksSubheading: string;
  picksProductIds: string[];
  sectionOrder: ThemeSectionId[];
  hiddenSections: ThemeSectionId[];
  sectionCopy: Partial<Record<ThemeSectionId, { eyebrow: string; heading: string; description: string; ctaText: string; ctaHref: string }>>;
  brandPrimary: string;
  pageBackground: string;
  heroTitle: string;
  heroSubtitle: string;
  heroCtaText: string;
  heroCtaHref: string;
  heroImage: string;
};

export const DEFAULT_STOREFRONT_THEME: StorefrontTheme = {
  picksEyebrow: "Hyderabad Loves",
  picksHeading: "Best Sellers",
  picksSubheading: "",
  picksProductIds: [],
  sectionOrder: [...THEME_SECTION_IDS],
  hiddenSections: [],
  sectionCopy: {
    announcement: { eyebrow: "", heading: "Cake delivery across Hyderabad", description: "Same-day and midnight delivery in selected pincodes", ctaText: "", ctaHref: "" },
    hero: { eyebrow: "", heading: "Birthday Cakes,\nDelivered Today", description: "Same-day delivery across Hyderabad in selected pincodes", ctaText: "Order now", ctaHref: "/cakes?category=Regular%20Birthday%20Cakes" },
    categories: { eyebrow: "", heading: "", description: "", ctaText: "", ctaHref: "" },
    service: { eyebrow: "", heading: "", description: "", ctaText: "", ctaHref: "" },
    occasions: { eyebrow: "Shop by occasion", heading: "Cakes for every occasion", description: "", ctaText: "See all cakes", ctaHref: "/cakes" },
    picks: { eyebrow: "Hyderabad Loves", heading: "Best Sellers", description: "", ctaText: "View all cakes", ctaHref: "/cakes" },
    flavors: { eyebrow: "Shop by flavour", heading: "Pick a flavour", description: "", ctaText: "See all cakes", ctaHref: "/cakes" },
    promos: { eyebrow: "", heading: "", description: "", ctaText: "", ctaHref: "" },
    steps: { eyebrow: "How to order", heading: "Order in three steps", description: "", ctaText: "", ctaHref: "" },
    faq: { eyebrow: "FAQs", heading: "Questions about delivery", description: "", ctaText: "See all FAQs", ctaHref: "/faq" },
    seo: { eyebrow: "", heading: "", description: "", ctaText: "", ctaHref: "" },
  },
  brandPrimary: "#77171c",
  pageBackground: "#fffaf4",
  heroTitle: "Birthday Cakes,\nDelivered Today",
  heroSubtitle: "Same-day delivery across Hyderabad in selected pincodes",
  heroCtaText: "Order now",
  heroCtaHref: "/cakes?category=Regular%20Birthday%20Cakes",
  heroImage: "/images/home/floral.jpg",
};
