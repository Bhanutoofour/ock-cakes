import type { Metadata } from "next";
import { buildSeoKeywords } from "@/lib/seo-content";

const siteName = "OccasionKart";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://occasionkart.com";
const defaultDescription =
  "Order cakes online in Hyderabad with OccasionKart for same day cake delivery, custom cakes, birthday cakes, anniversary cakes, and premium celebration designs.";

type CreateMetadataInput = {
  title: string;
  description?: string;
  keywords?: string[];
  path?: string;
  image?: string;
};

export function createMetadata({
  title,
  description = defaultDescription,
  keywords = [],
  path,
  image,
}: CreateMetadataInput): Metadata {
  const canonicalUrl = path ? new URL(path, siteUrl).toString() : undefined;
  const mergedKeywords = buildSeoKeywords(keywords);

  return {
    title,
    description,
    metadataBase: new URL(siteUrl),
    keywords: mergedKeywords,
    alternates: canonicalUrl
      ? {
          canonical: canonicalUrl,
        }
      : undefined,
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title,
      description,
      siteName,
      type: "website",
      url: canonicalUrl,
      images: image
        ? [
            {
              url: image,
              alt: title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export const siteSeo = {
  siteName,
  siteUrl,
  defaultDescription,
};
