"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import type { Product } from "@/lib/store-schema";
import type { StorefrontTheme } from "@/lib/server/storefront-theme";

export function AdminThemeEditor({ initialProducts, initialTheme }: { initialProducts: Product[]; initialTheme: StorefrontTheme }) {
  const router = useRouter();
  const [products] = useState(initialProducts);
  const [theme, setTheme] = useState(initialTheme);
  const [search, setSearch] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const selectedProducts = useMemo(
    () => theme.picksProductIds.map((id) => products.find((product) => product.id === id)).filter((product): product is Product => Boolean(product)),
    [products, theme.picksProductIds],
  );
  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return products.filter((product) =>
      (!query || `${product.name} ${product.category} ${product.categories.join(" ")}`.toLowerCase().includes(query)) &&
      product.price > 0,
    );
  }, [products, search]);

  const update = (key: keyof StorefrontTheme, value: string | string[]) => setTheme((current) => ({ ...current, [key]: value }));
  const toggleProduct = (id: string) => update(
    "picksProductIds",
    theme.picksProductIds.includes(id)
      ? theme.picksProductIds.filter((item) => item !== id)
      : [...theme.picksProductIds, id].slice(0, 12),
  );
  const moveProduct = (index: number, direction: -1 | 1) => {
    const next = [...theme.picksProductIds];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    update("picksProductIds", next);
  };
  const save = async () => {
    setPending(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/admin/theme", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(theme),
      });
      const payload = await response.json() as { data?: StorefrontTheme; error?: string };
      if (!response.ok || !payload.data) throw new Error(payload.error ?? "Unable to save theme.");
      setTheme(payload.data);
      setMessage("Homepage theme saved and published.");
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save theme.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 rounded-[22px] border border-black/10 bg-white p-6 shadow-sm">
        <div>
          <p className="section-kicker">Storefront</p>
          <h2 className="mt-2 text-[2rem] font-semibold text-black">Theme editor</h2>
          <p className="mt-2 max-w-[68ch] leading-7 text-[var(--text-secondary)]">Choose the cakes and copy for the homepage featured collection. Changes go live when you save.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/" target="_blank" className="rounded-full border border-black/10 px-5 py-3 font-semibold text-[var(--foreground)]">Preview store ↗</Link>
          <button type="button" onClick={() => void save()} disabled={pending} className="rounded-full bg-[var(--brand-primary)] px-6 py-3 font-semibold text-white disabled:opacity-60">{pending ? "Saving…" : "Save and publish"}</button>
        </div>
      </div>

      {message && <p role="status" className="rounded-xl bg-green-50 px-4 py-3 text-green-800">{message}</p>}
      {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-red-800">{error}</p>}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <section className="space-y-5 rounded-[22px] border border-black/10 bg-white p-6 shadow-sm">
          <div><h3 className="text-xl font-semibold text-black">Featured collection</h3><p className="mt-1 text-sm text-[var(--text-secondary)]">Edit the section text that appears above your selected cakes.</p></div>
          <label className="block space-y-2"><span className="text-sm font-semibold">Small heading</span><input value={theme.picksEyebrow} onChange={(event) => update("picksEyebrow", event.target.value)} maxLength={80} className="w-full rounded-xl border border-black/15 px-4 py-3" /></label>
          <label className="block space-y-2"><span className="text-sm font-semibold">Heading</span><input value={theme.picksHeading} onChange={(event) => update("picksHeading", event.target.value)} maxLength={100} className="w-full rounded-xl border border-black/15 px-4 py-3" /></label>
          <label className="block space-y-2"><span className="text-sm font-semibold">Subheading</span><textarea value={theme.picksSubheading} onChange={(event) => update("picksSubheading", event.target.value)} maxLength={180} rows={3} className="w-full rounded-xl border border-black/15 px-4 py-3" /></label>
          <div className="rounded-2xl bg-[#fff8f3] p-5"><p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand-primary)]">Live preview</p><p className="mt-3 text-sm font-semibold text-[var(--brand-primary)]">{theme.picksEyebrow || "Small heading"}</p><h4 className="mt-1 text-2xl font-semibold text-black">{theme.picksHeading || "Section heading"}</h4>{theme.picksSubheading && <p className="mt-2 text-sm text-[var(--text-secondary)]">{theme.picksSubheading}</p>}<p className="mt-3 text-sm text-[var(--text-secondary)]">{selectedProducts.length} cakes selected · displayed in your chosen order</p></div>
          <div className="flex items-center justify-between gap-3 border-t border-black/10 pt-5"><div><p className="font-semibold text-black">Need to add a cake?</p><p className="text-sm text-[var(--text-secondary)]">Create a product and upload its image first.</p></div><Link href="/admin/products" className="shrink-0 rounded-full border border-black/10 px-4 py-2 text-sm font-semibold text-[var(--brand-primary)]">Open products</Link></div>
        </section>

        <section className="rounded-[22px] border border-black/10 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-end justify-between gap-3"><div><h3 className="text-xl font-semibold text-black">Choose homepage cakes</h3><p className="mt-1 text-sm text-[var(--text-secondary)]">Select up to 12 priced cakes. Reorder the selected list to control the storefront order.</p></div><span className="rounded-full bg-[#f6f7fb] px-3 py-2 text-sm font-semibold">{theme.picksProductIds.length}/12 selected</span></div>
          <div className="mt-5"><label htmlFor="theme-product-search" className="sr-only">Search products</label><input id="theme-product-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search cakes by name or category" className="w-full rounded-xl border border-black/15 px-4 py-3" /></div>
          <div className="mt-4 max-h-[350px] space-y-2 overflow-y-auto pr-1">
            {filteredProducts.map((product) => {
              const selected = theme.picksProductIds.includes(product.id);
              return <label key={product.id} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 ${selected ? "border-[var(--brand-primary)] bg-[#fff8f3]" : "border-black/10"}`}><input type="checkbox" checked={selected} disabled={!selected && theme.picksProductIds.length >= 12} onChange={() => toggleProduct(product.id)} className="h-4 w-4 accent-[var(--brand-primary)]" /><img src={product.image} alt="" className="h-14 w-14 rounded-lg object-cover" /><span className="min-w-0 flex-1"><span className="block truncate font-semibold text-black">{product.name}</span><span className="block truncate text-xs text-[var(--text-secondary)]">{product.categories.join(" · ") || product.category}</span></span><span className="text-sm font-semibold">₹{product.price.toLocaleString("en-IN")}</span></label>;
            })}
            {filteredProducts.length === 0 && <p className="py-8 text-center text-sm text-[var(--text-secondary)]">No priced cakes match your search.</p>}
          </div>
          <div className="mt-6 border-t border-black/10 pt-5"><h4 className="font-semibold text-black">Storefront order</h4><div className="mt-3 space-y-2">{selectedProducts.map((product, index) => <div key={product.id} className="flex items-center gap-3 rounded-xl bg-[#f6f7fb] p-3"><span className="w-6 text-center text-sm font-semibold text-[var(--text-secondary)]">{index + 1}</span><span className="min-w-0 flex-1 truncate text-sm font-semibold">{product.name}</span><button type="button" aria-label={`Move ${product.name} up`} onClick={() => moveProduct(index, -1)} disabled={index === 0} className="rounded-lg border border-black/10 px-3 py-1 disabled:opacity-30">↑</button><button type="button" aria-label={`Move ${product.name} down`} onClick={() => moveProduct(index, 1)} disabled={index === selectedProducts.length - 1} className="rounded-lg border border-black/10 px-3 py-1 disabled:opacity-30">↓</button><button type="button" onClick={() => toggleProduct(product.id)} className="px-2 text-sm font-semibold text-red-700">Remove</button></div>)}{selectedProducts.length === 0 && <p className="rounded-xl bg-[#f6f7fb] p-4 text-sm text-[var(--text-secondary)]">Choose cakes above. With no manual selection, the store will show its five lowest priced cakes.</p>}</div></div>
        </section>
      </div>
    </div>
  );
}
