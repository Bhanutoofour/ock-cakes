import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/components/store/cart-context";
import { buildSeoKeywords } from "@/lib/seo-content";
import { siteSeo } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(siteSeo.siteUrl),
  title: {
    default: "OccasionKart | Cakes and Memories",
    template: "%s",
  },
  description: siteSeo.defaultDescription,
  keywords: buildSeoKeywords(),
  openGraph: {
    type: "website",
    siteName: siteSeo.siteName,
    title: "OccasionKart | Cakes and Memories",
    description: siteSeo.defaultDescription,
    url: siteSeo.siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "OccasionKart | Cakes and Memories",
    description: siteSeo.defaultDescription,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth antialiased">
      <body className="min-h-full flex flex-col">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
