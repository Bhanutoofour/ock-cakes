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
  { title: "Birthday Cakes", category: "Regular Birthday Cakes", note: "Make a wish" },
  { title: "Anniversary", category: "Anniversary", note: "Celebrate your story" },
  { title: "Chocolate", category: "Chocolate Truffle", note: "A little indulgence" },
  { title: "Kids & Themes", category: "Kids Cake", note: "Big little moments" },
  { title: "Photo Cakes", category: "Photo cakes", note: "Memories you can taste" },
  { title: "Bento Cakes", category: "Bento Cakes", note: "Small cake, big love" },
  { title: "Wedding Cakes", category: "Wedding cakes", note: "Made for forever" },
  { title: "Custom Cakes", category: "Custom Cakes", note: "Uniquely yours" },
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


export default async function Home() {
  const products = await listProducts();
  const inCategory = (category: string) => products.filter((product) =>
    product.categories.some((item) => item.toLowerCase() === category.toLowerCase())
  );
  const collectionCards = collections.map((collection) => ({
    ...collection, image: inCategory(collection.category)[0]?.image,
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
        <div className={styles.deliveryNote}>Freshly made. Thoughtfully delivered. <span>Cake delivery across Hyderabad</span></div>
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
              <p className={styles.eyebrow}>A little cake. A lot of happiness.</p>
              <h1 id="home-title">Every celebration<br />deserves a <em>sweet beginning.</em></h1>
              <p>For the big milestones and the just-because moments. Find a cake they’ll remember.</p>
              <Link className={styles.primaryButton} href="/cakes">Find your perfect cake <span aria-hidden="true">↗</span></Link>
              <span className={styles.heroFootnote}>Baked with care, delivered with love in Hyderabad</span>
            </div>
            <div className={styles.heroVisual}>
              {heroImage && <img src={heroImage} alt="Chocolate celebration cake topped with fruit" fetchPriority="high" />}
              <span className={styles.heroStamp}>Made for<br /><strong>your moments</strong><span aria-hidden="true">♡</span></span>
            </div>
          </section>
          <div className={styles.serviceStrip}>
            <div><span aria-hidden="true">✧</span><p><strong>Freshly crafted</strong><small>A little care in every layer</small></p></div>
            <div><span aria-hidden="true">◷</span><p><strong>Same-day options</strong><small>Check your pincode & delivery slot</small></p></div>
            <div><span aria-hidden="true">♡</span><p><strong>Make it personal</strong><small>Your flavor, your message, your cake</small></p></div>
          </div>

          <section className={styles.section}>
            <div className={styles.sectionHead}><div><p className={styles.eyebrow}>Good times start here</p><h2>A cake for every occasion</h2></div><Link href="/cakes">Explore all <span aria-hidden="true">→</span></Link></div>
            <div className={styles.occasions}>
              {occasionCards.map((card) => <Link key={card.title} href={categoryHref(card.category)} className={styles.occasion}>
                <div><img src={card.image} alt={card.title} loading="lazy" /></div>
                <span><span><strong>{card.title}</strong><small>{card.note}</small></span><b aria-hidden="true">↗</b></span>
              </Link>)}
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHead}><div><p className={styles.eyebrow}>Something delicious awaits</p><h2>The celebration edit</h2><p>Chocolate classics, birthday wishes, and a reason to smile.</p></div><Link href="/cakes">View all cakes →</Link></div>
            <div className={styles.products}>{picks.map((product) => <ProductCard key={product.id} product={product} />)}</div>
            {picks.length === 0 && <p>Our next batch of cakes is on its way. <Link href="/custom-orders">Plan a custom cake with us →</Link></p>}
          </section>

          <section className={styles.flavorSection}>
            <div className={styles.sectionHead}><div><p className={styles.eyebrow}>Find your favorite</p><h2>Follow your flavor</h2></div><Link href="/cakes">Explore cakes →</Link></div>
            <div className={styles.flavors}>{flavors.map((flavor) => {
              const product = inCategory(flavor)[0];
              return product ? <Link href={categoryHref(flavor)} key={flavor}><img src={product.image} alt="" loading="lazy" /><strong>{flavor.replace(" Cakes", "")}</strong><span>Explore →</span></Link> : null;
            })}</div>
          </section>

          <section className={styles.promos} aria-label="More ways to celebrate">
            <Link href="/custom-orders" className={styles.customPromo}><p className={styles.eyebrow}>Dream it. We’ll bake it.</p><h2>A cake as unique<br />as your celebration.</h2><p>Bring your ideas. Let’s create something special.</p><span className={styles.primaryButton}>Create your cake ↗</span><span className={styles.promoDecoration} aria-hidden="true">✳</span></Link>
            <Link href="/corporate-orders" className={styles.corporatePromo}><p className={styles.eyebrow}>Better when shared</p><h2>Big wins.<br />Sweeter celebrations.</h2><p>Make your next team milestone memorable.</p><span className={styles.textButton}>Explore corporate orders →</span></Link>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHead}><div><p className={styles.eyebrow}>Little details. Lovely memories.</p><h2>Made personal, in three steps</h2></div></div>
            <div className={styles.steps}>{[
              ["01", "Pick your cake", "Discover a flavor and design that feels just right."],
              ["02", "Add your personal touch", "Choose your size and add a message from the heart."],
              ["03", "Plan the surprise", "Check your pincode and choose an available delivery slot."],
            ].map(([number, title, copy]) => <div key={number}><span>{number}</span><h3>{title}</h3><p>{copy}</p></div>)}</div>
          </section>
          <section className={styles.faq}>
            <div><p className={styles.eyebrow}>A little help before you celebrate</p><h2>Your cake questions, answered.</h2><Link href="/faq" className={styles.textButton}>Visit our FAQs →</Link></div>
            <div>{seoFaqItems.map((item) => <details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}</div>
          </section>
          <section className={styles.seo} aria-label="About our Hyderabad cake delivery">{seoCopyBlocks.map((block) => <details key={block.title}><summary>{block.title}</summary><p>{block.body}</p></details>)}</section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
