/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { HomeHeroCarousel } from "@/components/store/home-hero-carousel";
import { ProductCard } from "@/components/store/product-card";
import { SiteFooter } from "@/components/store/site-footer";
import { SiteHeader } from "@/components/store/site-header";
import { toJsonLd } from "@/lib/json-ld";
import { createMetadata, siteSeo } from "@/lib/seo";
import { listProducts } from "@/lib/server/catalog";
import { getStorefrontTheme } from "@/lib/server/storefront-theme";
import { type ThemeSectionId } from "@/lib/storefront-theme-schema";
import styles from "./home.module.css";

export const metadata = createMetadata({
  title: "Order Fresh Cakes Online in Hyderabad | OccasionKart",
  description:
    "OccasionKart is a Hyderabad-based cake shop for cakes in Hyderabad, cake delivery in Hyderabad, same day cake delivery, birthday cakes, custom cakes, and celebration desserts.",
  keywords: [
    "cakes in Hyderabad",
    "cake delivery in Hyderabad",
    "order cakes same day delivery",
    "best cakes in Hyderabad",
    "Hyderabad based cake shop",
    "Hyderabad based bakery",
  ],
  path: "/",
});

export const dynamic = "force-dynamic";


const collections = [
  { title: "Birthday Cakes", category: "Regular Birthday Cakes" },
  { title: "Anniversary", category: "Anniversary" },
  { title: "Chocolate", category: "Chocolate Truffle" },
  { title: "Kids & Themes", category: "Kids Cake" },
  { title: "Photo Cakes", category: "Photo cakes" },
  { title: "Bento Cakes", category: "Bento Cakes" },
  { title: "Wedding Cakes", category: "Wedding cakes" },
  { title: "Custom Cakes", category: "Custom Cakes" },
];
const flavors = ["Chocolate Truffle", "Black Forest Cakes", "Red Velvet Cakes", "Butterscotch Cakes", "Pineapple Cakes", "Fresh Fruit Cakes"];
const categoryHref = (category: string) => `/cakes?category=${encodeURIComponent(category)}`;

const seoCopyBlocks = [
  {
    title: "Cakes Delivery in Hyderabad Online from OccasionKart",
    body: "OccasionKart helps you order fresh cakes online in Hyderabad for birthdays, anniversaries, baby showers, office celebrations, and surprise moments. If you are searching for cakes in Hyderabad, cake delivery in Hyderabad, or same day cake delivery in Hyderabad, our team makes ordering simple with clear pricing, flavor choices, and slot-based local delivery.",
  },
  {
    title: "Order Cakes Same Day Delivery in Hyderabad",
    body: "Need a cake today? We support same day orders in serviceable Hyderabad pincodes. Choose your flavor, weight, message on cake, and delivery slot. From classic chocolate cakes to custom celebration cakes, we focus on fresh baking, careful packing, and timely doorstep delivery so your event runs smoothly.",
  },
  {
    title: "Best Cakes in Hyderabad for Every Occasion",
    body: "Our catalog includes birthday cakes, anniversary cakes, kids theme cakes, photo cakes, custom cakes, and corporate cakes. Whether you need a simple elegant design or a premium celebration cake, OccasionKart gives you flexible options for flavor, portion size, and personalized message.",
  },
];

const seoFaqItems = [
  {
    question: "Do you deliver cakes across Hyderabad?",
    answer:
      "We deliver to selected Hyderabad pincodes based on active shipping zones. Enter your pincode on product or checkout pages to instantly confirm service availability.",
  },
  {
    question: "Can I order cake online for same day delivery?",
    answer:
      "Yes. Same day cake delivery is available for eligible products and time slots in serviceable Hyderabad locations.",
  },
  {
    question: "Do you offer midnight cake delivery?",
    answer:
      "Yes, midnight delivery is available for selected pincodes and slots. Charges vary by zone and are shown automatically during checkout.",
  },
];


const iconProps = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
const CakeIcon = () => <svg {...iconProps}><path d="M4 21h16M5 21v-7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v7" /><path d="M5 16c1.2 1 2.3 1 3.5 0s2.3-1 3.5 0 2.3 1 3.5 0 2.3-1 3.5 0" /><path d="M12 12V8" /><path d="M12 5.5c.8-.7.8-1.6 0-2.5-.8.9-.8 1.8 0 2.5Z" /></svg>;
const ClockIcon = () => <svg {...iconProps}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></svg>;
const HeartIcon = () => <svg {...iconProps}><path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10Z" /></svg>;

export default async function Home() {
  const [products, theme] = await Promise.all([listProducts(), getStorefrontTheme()]);
  const inCategory = (category: string) => products.filter((product) =>
    product.categories.some((item) => item.toLowerCase() === category.toLowerCase())
  );
  const collectionCards = collections.map((collection) => ({
    ...collection,
    image: inCategory(collection.category)[0]?.image,
    note: `${inCategory(collection.category).length} designs`,
  })).filter((collection) => collection.image);
  const chocolate = inCategory("Chocolate Truffle");
  const featured = [...chocolate.slice(0, 2), ...inCategory("Regular Birthday Cakes").slice(0, 3)];
  const availablePicks = Array.from(new Map([...featured, ...products].map((product) => [product.id, product])).values())
    .filter((product) => product.price > 0)
    .sort((left, right) => left.price - right.price || left.name.localeCompare(right.name));
  const selectedPicks = theme.picksProductIds.flatMap((id) => {
    const product = products.find((item) => item.id === id);
    return product && product.price > 0 ? [product] : [];
  });
  const picks = [...selectedPicks, ...availablePicks.filter((product) => !theme.picksProductIds.includes(product.id))].slice(0, 5);
  const occasionCards = collectionCards.filter((card) => ["Birthday Cakes", "Anniversary", "Kids & Themes", "Wedding Cakes"].includes(card.title));
  const copy = theme.sectionCopy;
  const contentSections: Record<ThemeSectionId, ReactNode> = {
    announcement: <div className={styles.deliveryNote} aria-label="Cake delivery highlights"><div className={styles.deliveryTrack}>{[0, 1].map((copyIndex) => <div className={styles.deliveryGroup} key={copyIndex} aria-hidden={copyIndex === 1}><span>{copy.announcement?.heading || "Cake delivery across Hyderabad"}</span><span>{copy.announcement?.description || "Delivery in 3 hours"}</span><span>Customized and premium cakes</span></div>)}</div></div>,
    hero: <HomeHeroCarousel firstSlide={{ title: theme.heroTitle, subtitle: theme.heroSubtitle, ctaText: theme.heroCtaText, ctaHref: theme.heroCtaHref, image: theme.heroImage }} />,
    categories: <><div className={styles.sectionHead}><div>{copy.categories?.eyebrow && <p className={styles.eyebrow}>{copy.categories.eyebrow}</p>}{copy.categories?.heading && <h2>{copy.categories.heading}</h2>}{copy.categories?.description && <p>{copy.categories.description}</p>}</div></div><nav className={styles.categories} aria-label="Shop cake collections">{collectionCards.map((card) => <Link href={categoryHref(card.category)} key={card.title} className={styles.category}><span className={styles.categoryImage}><img src={card.image} alt="" /></span><span>{card.title}</span></Link>)}</nav></>,
    service: <><div className={styles.sectionHead}><div>{copy.service?.eyebrow && <p className={styles.eyebrow}>{copy.service.eyebrow}</p>}{copy.service?.heading && <h2>{copy.service.heading}</h2>}{copy.service?.description && <p>{copy.service.description}</p>}</div></div><div className={styles.serviceStrip}><div><CakeIcon /><p><strong>Freshly baked</strong><small>Birthday, anniversary & custom cakes</small></p></div><div><ClockIcon /><p><strong>Same-day delivery</strong><small>Available in selected pincodes</small></p></div><div><HeartIcon /><p><strong>Message on cake</strong><small>Add a name or wish at checkout</small></p></div></div></>,
    occasions: <section className={styles.section}><div className={styles.sectionHead}><div><p className={styles.eyebrow}>{copy.occasions?.eyebrow}</p><h2>{copy.occasions?.heading}</h2></div><Link href={copy.occasions?.ctaHref || "/cakes"}>{copy.occasions?.ctaText} →</Link></div><div className={styles.occasions}>{occasionCards.map((card) => <Link key={card.title} href={categoryHref(card.category)} className={styles.occasion}><div><img src={card.image} alt={card.title} loading="lazy" /></div><span><span><strong>{card.title}</strong><small>{card.note}</small></span><b aria-hidden="true">↗</b></span></Link>)}</div></section>,
    picks: <section className={styles.section}><div className={styles.sectionHead}><div><p className={styles.eyebrow}>{theme.picksEyebrow || copy.picks?.eyebrow}</p><h2>{theme.picksHeading || copy.picks?.heading}</h2>{(theme.picksSubheading || copy.picks?.description) && <p>{theme.picksSubheading || copy.picks?.description}</p>}</div><Link href={copy.picks?.ctaHref || "/cakes"}>{copy.picks?.ctaText || "View all cakes"} →</Link></div><div className={styles.products}>{picks.map((product) => <ProductCard key={product.id} product={product} />)}</div>{picks.length === 0 && <p>No cakes to show here right now. <Link href="/cakes">Browse all cakes →</Link></p>}</section>,
    flavors: <section className={styles.flavorSection}><div className={styles.sectionHead}><div><p className={styles.eyebrow}>{copy.flavors?.eyebrow}</p><h2>{copy.flavors?.heading}</h2></div><Link href={copy.flavors?.ctaHref || "/cakes"}>{copy.flavors?.ctaText} →</Link></div><div className={styles.flavors}>{flavors.map((flavor) => { const product = inCategory(flavor)[0]; return product ? <Link href={categoryHref(flavor)} key={flavor}><img src={product.image} alt="" loading="lazy" /><strong>{flavor.replace(" Cakes", "")}</strong><span>View cakes →</span></Link> : null; })}</div></section>,
    promos: <section className={styles.promos} aria-label="More ways to celebrate">{(copy.promos?.heading || copy.promos?.description) && <div className="col-span-full"><p className={styles.eyebrow}>{copy.promos.eyebrow}</p><h2>{copy.promos.heading}</h2><p>{copy.promos.description}</p></div>}<Link href="/custom-orders" className={styles.customPromo}><p className={styles.eyebrow}>Custom cakes</p><h2>Have a design<br />in mind?</h2><p>Send us your theme, flavour, size and a reference photo. We’ll help with the design and confirm the price.</p><span className={styles.primaryButton}>Request a custom cake →</span></Link><Link href="/corporate-orders" className={styles.corporatePromo}><p className={styles.eyebrow}>Corporate orders</p><h2>Cakes for<br />office celebrations</h2><p>Bulk orders for team birthdays, launches and company events.</p><span className={styles.textButton}>Ask about corporate orders →</span></Link></section>,
    steps: <section className={styles.section}><div className={styles.sectionHead}><div><p className={styles.eyebrow}>{copy.steps?.eyebrow}</p><h2>{copy.steps?.heading}</h2>{copy.steps?.description && <p>{copy.steps.description}</p>}</div></div><div className={styles.steps}>{[["01", "Pick a cake", "Browse by occasion or flavour and open the cake you like."], ["02", "Choose size and message", "Select the weight and type the message to write on the cake."], ["03", "Choose delivery and pay", "Enter your pincode, pick a date and time slot, and pay online."]].map(([number, title, text]) => <div key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p></div>)}</div></section>,
    faq: <section className={styles.faq}><div><p className={styles.eyebrow}>{copy.faq?.eyebrow}</p><h2>{copy.faq?.heading}</h2>{copy.faq?.description && <p>{copy.faq.description}</p>}<Link href={copy.faq?.ctaHref || "/faq"} className={styles.textButton}>{copy.faq?.ctaText} →</Link></div><div>{seoFaqItems.map((item) => <details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}</div></section>,
    seo: <section className={styles.seo} aria-label="About our Hyderabad cake delivery">{(copy.seo?.heading || copy.seo?.description) && <><h2>{copy.seo.heading}</h2><p>{copy.seo.description}</p></>}{seoCopyBlocks.map((block) => <details key={block.title}><summary>{block.title}</summary><p>{block.body}</p></details>)}</section>,
  };
  return (
    <>
      <SiteHeader />
      <main className={styles.home} style={{ "--brand-primary": theme.brandPrimary, "--background": theme.pageBackground } as CSSProperties}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: toJsonLd({
          "@context": "https://schema.org", "@type": "WebSite",
          "@id": `${siteSeo.siteUrl}/#website`, url: siteSeo.siteUrl,
          name: siteSeo.siteName, description: siteSeo.defaultDescription, inLanguage: "en-IN",
        }) }} />
        <h1 className="sr-only">OccasionKart: fresh cakes delivered across Hyderabad</h1>
        <div className={styles.shell}>
          {theme.sectionOrder.map((id) => theme.hiddenSections.includes(id) ? null : <div key={id} data-storefront-section={id} className={id === "hero" || id === "announcement" ? styles.fullBleed : undefined}>{contentSections[id]}</div>)}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
