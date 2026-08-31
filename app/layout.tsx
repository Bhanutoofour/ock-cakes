import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/store/cart-context";
import { WhatsAppChatButton } from "@/components/store/whatsapp-chat-button";
import { toJsonLd } from "@/lib/json-ld";
import { buildSeoKeywords } from "@/lib/seo-content";
import { siteSeo } from "@/lib/seo";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteSeo.siteUrl),
  title: {
    default: "OccasionKart | Cakes and Memories",
    template: "%s",
  },
  description: siteSeo.defaultDescription,
  applicationName: siteSeo.siteName,
  category: "Food",
  referrer: "origin-when-cross-origin",
  keywords: buildSeoKeywords(),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: siteSeo.siteName,
    title: "OccasionKart | Cakes and Memories",
    description: siteSeo.defaultDescription,
    locale: "en_IN",
    url: "/",
    images: [
      {
        url: siteSeo.defaultOgImage,
        alt: "OccasionKart cakes in Hyderabad",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "OccasionKart | Cakes and Memories",
    description: siteSeo.defaultDescription,
    images: [siteSeo.defaultOgImage],
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    yandex: process.env.YANDEX_SITE_VERIFICATION,
    yahoo: process.env.YAHOO_SITE_VERIFICATION,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#86171c",
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": `${siteSeo.siteUrl}/#organization`,
  name: siteSeo.siteName,
  url: siteSeo.siteUrl,
  image: `${siteSeo.siteUrl}${siteSeo.defaultOgImage}`,
  logo: `${siteSeo.siteUrl}${siteSeo.defaultOgImage}`,
  description: siteSeo.defaultDescription,
  telephone: "+91-9059058058",
  email: "support@occasionkart.com",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Hyderabad",
    addressRegion: "Telangana",
    addressCountry: "IN",
  },
  areaServed: {
    "@type": "City",
    name: "Hyderabad",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${fraunces.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: toJsonLd(organizationSchema) }}
        />
        <CartProvider>
          {children}
          <WhatsAppChatButton />
        </CartProvider>
      </body>
    </html>
  );
}
