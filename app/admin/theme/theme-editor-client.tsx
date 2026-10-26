"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import type { Product } from "@/lib/store-schema";
import {
  THEME_SECTION_IDS,
  THEME_SECTION_LABELS,
  type StorefrontTheme,
  type ThemeSectionId,
} from "@/lib/storefront-theme-schema";

const imageFallback = "/images/home/floral.jpg";

export function AdminThemeEditor({ initialProducts, initialTheme }: { initialProducts: Product[]; initialTheme: StorefrontTheme }) {
  const router = useRouter();
  const [products] = useState(initialProducts);
  const [theme, setTheme] = useState(initialTheme);
  const [activeSection, setActiveSection] = useState<ThemeSectionId>("hero");
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [search, setSearch] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const selectedProducts = useMemo(
    () => theme.picksProductIds.map((id) => products.find((product) => product.id === id)).filter((product): product is Product => Boolean(product)),
    [products, theme.picksProductIds],
  );
  const autoPicks = useMemo(() => products.filter((product) => product.price > 0 && !theme.picksProductIds.includes(product.id)).sort((a, b) => a.price - b.price).slice(0, Math.max(0, 5 - selectedProducts.length)), [products, selectedProducts.length, theme.picksProductIds]);
  const previewProducts = [...selectedProducts, ...autoPicks].slice(0, 5);
  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return products.filter((product) => product.price > 0 && (!query || `${product.name} ${product.category} ${product.categories.join(" ")}`.toLowerCase().includes(query)));
  }, [products, search]);

  const updateTheme = (patch: Partial<StorefrontTheme>) => setTheme((current) => ({ ...current, ...patch }));
  const updateCopy = (key: "eyebrow" | "heading" | "description" | "ctaText" | "ctaHref", value: string) => {
    setTheme((current) => ({
      ...current,
      sectionCopy: { ...current.sectionCopy, [activeSection]: { ...current.sectionCopy[activeSection], [key]: value } },
      ...(activeSection === "picks" && key === "eyebrow" ? { picksEyebrow: value } : {}),
      ...(activeSection === "picks" && key === "heading" ? { picksHeading: value } : {}),
      ...(activeSection === "picks" && key === "description" ? { picksSubheading: value } : {}),
    }));
  };
  const toggleSection = (id: ThemeSectionId) => updateTheme({ hiddenSections: theme.hiddenSections.includes(id) ? theme.hiddenSections.filter((item) => item !== id) : [...theme.hiddenSections, id] });
  const moveSection = (index: number, direction: -1 | 1) => {
    const next = [...theme.sectionOrder];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    updateTheme({ sectionOrder: next });
  };
  const toggleProduct = (id: string) => updateTheme({
    picksProductIds: theme.picksProductIds.includes(id) ? theme.picksProductIds.filter((item) => item !== id) : [...theme.picksProductIds, id].slice(0, 5),
  });
  const moveProduct = (index: number, direction: -1 | 1) => {
    const next = [...theme.picksProductIds];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    updateTheme({ picksProductIds: next });
  };
  const uploadHeroImage = async (file?: File) => {
    if (!file) return;
    setError("");
    try {
      const form = new FormData(); form.append("file", file);
      const response = await fetch("/api/admin/uploads", { method: "POST", body: form });
      const payload = await response.json() as { data?: { url: string }; error?: string };
      if (!response.ok || !payload.data) throw new Error(payload.error ?? "Unable to upload image.");
      updateTheme({ heroImage: payload.data.url });
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Unable to upload image.");
    }
  };
  const save = async () => {
    setPending(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/admin/theme", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(theme) });
      const payload = await response.json() as { data?: StorefrontTheme; error?: string };
      if (!response.ok || !payload.data) throw new Error(payload.error ?? "Unable to save theme.");
      setTheme(payload.data); setMessage("Storefront theme published."); router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save theme.");
    } finally { setPending(false); }
  };
  const activeCopy = theme.sectionCopy[activeSection] ?? { eyebrow: "", heading: "", description: "", ctaText: "", ctaHref: "" };
  const visibleSections = theme.sectionOrder.filter((id) => !theme.hiddenSections.includes(id));

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-black/10 bg-white px-5 py-4 shadow-sm">
        <div><p className="text-xs font-semibold uppercase tracking-[.16em] text-[var(--brand-primary)]">Storefront · Homepage</p><h2 className="mt-1 text-2xl font-semibold text-black">Theme editor</h2></div>
        <div className="flex items-center gap-2"><Link href="/" target="_blank" className="rounded-lg border border-black/10 px-4 py-2.5 text-sm font-semibold">Open live store ↗</Link><button type="button" onClick={() => void save()} disabled={pending} className="rounded-lg bg-[var(--brand-primary)] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{pending ? "Publishing…" : "Publish"}</button></div>
      </header>
      {message && <p role="status" className="rounded-xl bg-green-50 px-4 py-3 text-green-800">{message}</p>}{error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-red-800">{error}</p>}

      <div className="grid min-h-[760px] gap-4 2xl:grid-cols-[250px_minmax(420px,1fr)_330px]">
        <aside className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between"><h3 className="font-semibold text-black">Homepage sections</h3><span className="text-xs text-gray-500">{visibleSections.length} shown</span></div>
          <div className="space-y-1">
            {theme.sectionOrder.map((id, index) => {
              const hidden = theme.hiddenSections.includes(id);
              return <div key={id} className={`flex items-center gap-1 rounded-xl border p-1 ${activeSection === id ? "border-[var(--brand-primary)] bg-[#fff8f3]" : "border-transparent"}`}>
                <button type="button" onClick={() => setActiveSection(id)} className="min-w-0 flex-1 truncate px-2 py-2 text-left text-sm font-medium text-gray-800">{THEME_SECTION_LABELS[id]}{hidden && <span className="ml-2 text-xs text-gray-400">Hidden</span>}</button>
                <button type="button" onClick={() => moveSection(index, -1)} disabled={index === 0} aria-label={`Move ${THEME_SECTION_LABELS[id]} up`} className="rounded p-1 text-gray-500 disabled:opacity-30">↑</button>
                <button type="button" onClick={() => moveSection(index, 1)} disabled={index === theme.sectionOrder.length - 1} aria-label={`Move ${THEME_SECTION_LABELS[id]} down`} className="rounded p-1 text-gray-500 disabled:opacity-30">↓</button>
                <button type="button" onClick={() => toggleSection(id)} aria-label={`${hidden ? "Show" : "Hide"} ${THEME_SECTION_LABELS[id]}`} className="rounded p-1 text-gray-500">{hidden ? "◉" : "⊘"}</button>
              </div>;
            })}
          </div>
          <div className="mt-5 border-t border-black/10 pt-4"><h3 className="font-semibold text-black">Theme colors</h3><label className="mt-3 flex items-center justify-between text-sm">Brand color<input type="color" value={theme.brandPrimary} onChange={(event) => updateTheme({ brandPrimary: event.target.value })} className="h-9 w-12 cursor-pointer rounded border-0" /></label><label className="mt-2 flex items-center justify-between text-sm">Page background<input type="color" value={theme.pageBackground} onChange={(event) => updateTheme({ pageBackground: event.target.value })} className="h-9 w-12 cursor-pointer rounded border-0" /></label></div>
        </aside>

        <section className="min-w-0 rounded-2xl border border-black/10 bg-[#e9edf0] p-3 shadow-sm">
          <div className="mb-3 flex items-center justify-between rounded-xl bg-white px-3 py-2"><span className="text-sm font-semibold text-gray-700">Live preview · {device === "desktop" ? "Desktop" : "Mobile"}</span><div className="flex gap-1"><button type="button" onClick={() => setDevice("desktop")} className={`rounded px-3 py-1 text-xs ${device === "desktop" ? "bg-gray-900 text-white" : "bg-gray-100"}`}>Desktop</button><button type="button" onClick={() => setDevice("mobile")} className={`rounded px-3 py-1 text-xs ${device === "mobile" ? "bg-gray-900 text-white" : "bg-gray-100"}`}>Mobile</button></div></div>
          <div className={`mx-auto max-h-[690px] overflow-y-auto rounded-xl bg-white shadow-lg transition-all ${device === "mobile" ? "max-w-[390px]" : "max-w-full"}`} style={{ "--brand-primary": theme.brandPrimary, "--background": theme.pageBackground } as React.CSSProperties}>
            <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-5 py-3"><strong className="text-lg text-[#77171c]">occasionkart</strong><span className="text-xs text-gray-600">Cakes　 Birthday　 Contact　 🛒</span></div>
            {visibleSections.map((id) => <button key={id} type="button" onClick={() => setActiveSection(id)} className={`block w-full border-2 border-transparent text-left hover:border-dashed hover:border-[var(--brand-primary)] ${activeSection === id ? "!border-[var(--brand-primary)]" : ""}`}>
              {id === "announcement" && <div className="bg-[#f7efe9] px-4 py-2 text-center text-xs text-[var(--brand-primary)]">{theme.sectionCopy.announcement?.heading} · {theme.sectionCopy.announcement?.description}</div>}
              {id === "hero" && <div className="relative flex min-h-[220px] items-center overflow-hidden bg-[#fbefec] p-8"><img src={theme.heroImage || imageFallback} alt="" className="absolute inset-y-0 right-0 h-full w-1/2 object-cover" /><div className="relative z-[1] max-w-[58%]"><h3 className="whitespace-pre-line text-2xl font-bold leading-tight text-[var(--brand-primary)]">{theme.heroTitle}</h3><p className="mt-2 text-sm text-gray-700">{theme.heroSubtitle}</p><span className="mt-3 inline-block rounded-full bg-[var(--brand-primary)] px-4 py-2 text-xs font-bold text-white">{theme.heroCtaText}</span></div></div>}
              {id === "categories" && <div className="flex justify-around gap-2 px-4 py-5">{["Birthday", "Anniversary", "Chocolate", "Kids", "Photo", "Bento"].map((name) => <span key={name} className="grid h-12 w-12 place-items-center rounded-full bg-[#f8eee8] text-[9px] text-gray-700">{name}</span>)}</div>}
              {id === "service" && <div className="grid grid-cols-3 border-y px-3 py-4 text-center text-[10px] text-gray-700"><span>🍰 Freshly baked</span><span>◷ Same-day delivery</span><span>♡ Message on cake</span></div>}
              {id === "occasions" && <PreviewText copy={theme.sectionCopy.occasions} />}
              {id === "picks" && <div className="px-5 py-5"><PreviewText copy={{ eyebrow: theme.picksEyebrow || theme.sectionCopy.picks?.eyebrow, heading: theme.picksHeading || theme.sectionCopy.picks?.heading, description: theme.picksSubheading || theme.sectionCopy.picks?.description }} /><div className={`mt-4 grid gap-2 ${device === "desktop" ? "grid-cols-5" : "grid-cols-2"}`}>{previewProducts.map((product) => <div key={product.id} className="overflow-hidden rounded-lg border"><img src={product.image} alt="" className="aspect-square w-full object-cover" /><p className="truncate p-2 text-[10px] font-semibold">{product.name}</p><p className="px-2 pb-2 text-[10px]">₹{product.price.toLocaleString("en-IN")}</p></div>)}</div></div>}
              {id === "flavors" && <PreviewText copy={theme.sectionCopy.flavors} />}
              {id === "promos" && <div className="grid grid-cols-2 gap-2 p-4"><div className="rounded-lg bg-[#f7efe9] p-4 text-sm font-semibold">Custom cakes<br /><span className="text-xs font-normal">Have a design in mind?</span></div><div className="rounded-lg bg-[#f4ebe3] p-4 text-sm font-semibold">Corporate orders<br /><span className="text-xs font-normal">Cakes for office celebrations</span></div></div>}
              {id === "steps" && <PreviewText copy={theme.sectionCopy.steps} />}{id === "faq" && <PreviewText copy={theme.sectionCopy.faq} />}{id === "seo" && <div className="px-5 py-8 text-center text-xs text-gray-500">About OccasionKart</div>}
            </button>)}
            <footer className="bg-gray-50 p-6 text-center text-xs text-gray-500">OccasionKart · Fresh cakes delivered across Hyderabad</footer>
          </div>
        </section>

        <aside className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
          <div className="mb-4 border-b border-black/10 pb-4"><p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Editing</p><h3 className="mt-1 text-lg font-semibold text-black">{THEME_SECTION_LABELS[activeSection]}</h3></div>
          {activeSection === "hero" ? <div className="space-y-4">
            <Field label="Headline" value={theme.heroTitle} multiline onChange={(value) => updateTheme({ heroTitle: value })} /><Field label="Description" value={theme.heroSubtitle} multiline onChange={(value) => updateTheme({ heroSubtitle: value })} /><Field label="Button label" value={theme.heroCtaText} onChange={(value) => updateTheme({ heroCtaText: value })} /><Field label="Button link" value={theme.heroCtaHref} onChange={(value) => updateTheme({ heroCtaHref: value })} /><Field label="Image URL" value={theme.heroImage} onChange={(value) => updateTheme({ heroImage: value })} /><label className="block text-sm font-medium">Upload hero image<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={(event) => void uploadHeroImage(event.target.files?.[0])} className="mt-2 block w-full text-xs" /></label>
          </div> : activeSection === "picks" ? <div className="space-y-4">
            <Field label="Small heading" value={theme.picksEyebrow} onChange={(value) => updateTheme({ picksEyebrow: value })} /><Field label="Heading" value={theme.picksHeading} onChange={(value) => updateTheme({ picksHeading: value })} /><Field label="Subheading" value={theme.picksSubheading} multiline onChange={(value) => updateTheme({ picksSubheading: value })} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search cakes" className="w-full rounded-lg border px-3 py-2 text-sm" /><div className="max-h-60 space-y-2 overflow-y-auto">{filteredProducts.map((product) => <label key={product.id} className="flex items-center gap-2 text-xs"><input type="checkbox" checked={theme.picksProductIds.includes(product.id)} disabled={!theme.picksProductIds.includes(product.id) && theme.picksProductIds.length >= 5} onChange={() => toggleProduct(product.id)} /><span className="min-w-0 flex-1 truncate">{product.name}</span><span>₹{product.price}</span></label>)}</div><div className="space-y-1">{selectedProducts.map((product, index) => <div key={product.id} className="flex items-center gap-1 text-xs"><span className="flex-1 truncate">{index + 1}. {product.name}</span><button type="button" onClick={() => moveProduct(index, -1)} disabled={!index}>↑</button><button type="button" onClick={() => moveProduct(index, 1)} disabled={index === selectedProducts.length - 1}>↓</button></div>)}</div><p className="text-xs text-gray-500">The store fills empty slots with lowest-priced cakes.</p>
          </div> : activeSection === "announcement" ? <div className="space-y-4"><Field label="Announcement" value={activeCopy.heading} onChange={(value) => updateCopy("heading", value)} /><Field label="Supporting message" value={activeCopy.description} onChange={(value) => updateCopy("description", value)} /></div> : <div className="space-y-4"><Field label="Eyebrow" value={activeCopy.eyebrow} onChange={(value) => updateCopy("eyebrow", value)} /><Field label="Heading" value={activeCopy.heading} onChange={(value) => updateCopy("heading", value)} /><Field label="Description" value={activeCopy.description} multiline onChange={(value) => updateCopy("description", value)} /><Field label="Button label" value={activeCopy.ctaText} onChange={(value) => updateCopy("ctaText", value)} /><Field label="Button link" value={activeCopy.ctaHref} onChange={(value) => updateCopy("ctaHref", value)} />{["categories", "service", "promos", "seo"].includes(activeSection) && <p className="text-xs text-gray-500">This block uses fixed storefront content. You can reorder or hide it here; text controls apply where the block supports a heading or link.</p>}</div>}
        </aside>
      </div>
    </div>
  );
}

function PreviewText({ copy }: { copy?: { eyebrow?: string; heading?: string; description?: string } }) {
  return <div className="px-5 py-5"><p className="text-[9px] font-bold uppercase tracking-widest text-[var(--brand-primary)]">{copy?.eyebrow}</p><div className="mt-1 flex items-end justify-between gap-2"><h3 className="text-lg font-semibold text-gray-900">{copy?.heading}</h3></div>{copy?.description && <p className="mt-1 text-xs text-gray-600">{copy.description}</p>}</div>;
}

function Field({ label, value, onChange, multiline = false }: { label: string; value: string; onChange: (value: string) => void; multiline?: boolean }) {
  return <label className="block text-sm font-medium text-gray-800">{label}{multiline ? <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={3} className="mt-1 block w-full rounded-lg border border-black/15 px-3 py-2 text-sm font-normal" /> : <input value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 block w-full rounded-lg border border-black/15 px-3 py-2 text-sm font-normal" />}</label>;
}
