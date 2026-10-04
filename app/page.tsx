/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { ProductCard } from "@/components/store/product-card";
import { SiteFooter } from "@/components/store/site-footer";
import { SiteHeader } from "@/components/store/site-header";
import { toJsonLd } from "@/lib/json-ld";
import { createMetadata, siteSeo } from "@/lib/seo";
import { listProducts } from "@/lib/server/catalog";
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
  const products = await listProducts();
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
  const picks = Array.from(new Map([...featured, ...products].map((product) => [product.id, product])).values()).slice(0, 5);
  const heroImage = "/images/home/celebration.jpg";
  const occasionCards = collectionCards.filter((card) => ["Birthday Cakes", "Anniversary", "Kids & Themes", "Wedding Cakes"].includes(card.title));
  return (
    <>
      <SiteHeader />
      <main className={styles.home}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: toJsonLd({
          "@context": "https://schema.org", "@type": "WebSite",
          "@id": `${siteSeo.siteUrl}/#website`, url: siteSeo.siteUrl,
          name: siteSeo.siteName, description: siteSeo.defaultDescription, inLanguage: "en-IN",
        }) }} />
        <div className={styles.deliveryNote}>Cake delivery across Hyderabad <span>Same-day and midnight delivery in selected pincodes</span></div>
        <div className={styles.shell}>
          <nav className={styles.categories} aria-label="Shop cake collections">
            {collectionCards.map((card) => (
              <Link href={categoryHref(card.category)} key={card.title} className={styles.category}>
                <span className={styles.categoryImage}><img src={card.image} alt="" /></span>
                <span>{card.title}</span>
              </Link>
            ))}
          </nav>

          <section className={styles.hero} aria-labelledby="home-title">
            <div className={styles.heroCopy}>
              <p className={styles.eyebrow}>Cake shop in Hyderabad</p>
              <h1 id="home-title">Fresh cakes, delivered<br />across <em>Hyderabad.</em></h1>
              <p>Birthday, anniversary, photo and custom cakes. Pick a flavour, add a message, and choose when it arrives.</p>
              <Link className={styles.primaryButton} href="/cakes">Browse cakes <span aria-hidden="true">→</span></Link>
              <span className={styles.heroFootnote}>Enter your pincode at checkout to see delivery times</span>
            </div>
            <div className={styles.heroVisual}>
              {heroImage && <img src={heroImage} alt="Chocolate celebration cake topped with fruit" fetchPriority="high" />}
              <span className={styles.heroStamp}>Freshly<br /><strong>baked</strong><HeartIcon /></span>
            </div>
          </section>
          <div className={styles.serviceStrip}>
            <div><CakeIcon /><p><strong>Freshly baked</strong><small>Birthday, anniversary & custom cakes</small></p></div>
            <div><ClockIcon /><p><strong>Same-day delivery</strong><small>Available in selected pincodes</small></p></div>
            <div><HeartIcon /><p><strong>Message on cake</strong><small>Add a name or wish at checkout</small></p></div>
          </div>

          <section className={styles.section}>
            <div className={styles.sectionHead}><div><p className={styles.eyebrow}>Shop by occasion</p><h2>Cakes for every occasion</h2></div><Link href="/cakes">See all cakes <span aria-hidden="true">→</span></Link></div>
            <div className={styles.occasions}>
              {occasionCards.map((card) => <Link key={card.title} href={categoryHref(card.category)} className={styles.occasion}>
                <div><img src={card.image} alt={card.title} loading="lazy" /></div>
                <span><span><strong>{card.title}</strong><small>{card.note}</small></span><b aria-hidden="true">↗</b></span>
              </Link>)}
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHead}><div><p className={styles.eyebrow}>Our picks</p><h2>Chocolate and birthday favourites</h2><p>A good place to start if you’re not sure what to order.</p></div><Link href="/cakes">View all cakes →</Link></div>
            <div className={styles.products}>{picks.map((product) => <ProductCard key={product.id} product={product} />)}</div>
            {picks.length === 0 && <p>No cakes to show here right now. <Link href="/cakes">Browse all cakes →</Link></p>}
          </section>

          <section className={styles.flavorSection}>
            <div className={styles.sectionHead}><div><p className={styles.eyebrow}>Shop by flavour</p><h2>Pick a flavour</h2></div><Link href="/cakes">See all cakes →</Link></div>
            <div className={styles.flavors}>{flavors.map((flavor) => {
              const product = inCategory(flavor)[0];
              return product ? <Link href={categoryHref(flavor)} key={flavor}><img src={product.image} alt="" loading="lazy" /><strong>{flavor.replace(" Cakes", "")}</strong><span>View cakes →</span></Link> : null;
            })}</div>
          </section>

          <section className={styles.promos} aria-label="More ways to celebrate">
            <Link href="/custom-orders" className={styles.customPromo}><p className={styles.eyebrow}>Custom cakes</p><h2>Have a design<br />in mind?</h2><p>Send us your theme, flavour, size and a reference photo. We’ll help with the design and confirm the price.</p><span className={styles.primaryButton}>Request a custom cake →</span></Link>
            <Link href="/corporate-orders" className={styles.corporatePromo}><p className={styles.eyebrow}>Corporate orders</p><h2>Cakes for<br />office celebrations</h2><p>Bulk orders for team birthdays, launches and company events.</p><span className={styles.textButton}>Ask about corporate orders →</span></Link>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHead}><div><p className={styles.eyebrow}>How to order</p><h2>Order in three steps</h2></div></div>
            <div className={styles.steps}>{[
              ["01", "Pick a cake", "Browse by occasion or flavour and open the cake you like."],
              ["02", "Choose size and message", "Select the weight and type the message to write on the cake."],
              ["03", "Choose delivery and pay", "Enter your pincode, pick a date and time slot, and pay online."],
            ].map(([number, title, copy]) => <div key={number}><span>{number}</span><h3>{title}</h3><p>{copy}</p></div>)}</div>
          </section>
          <section className={styles.faq}>
            <div><p className={styles.eyebrow}>FAQs</p><h2>Questions about delivery</h2><Link href="/faq" className={styles.textButton}>See all FAQs →</Link></div>
            <div>{seoFaqItems.map((item) => <details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}</div>
          </section>
          <section className={styles.seo} aria-label="About our Hyderabad cake delivery">{seoCopyBlocks.map((block) => <details key={block.title}><summary>{block.title}</summary><p>{block.body}</p></details>)}</section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
