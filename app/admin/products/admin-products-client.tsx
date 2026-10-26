"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import type { Product, ProductFlavorOption, ProductWeightOption } from "@/lib/store-schema";
import {
  DEFAULT_FLAVOR_OPTIONS,
  extractBaseWeightFromDescription,
  getGeneratedWeightOptions,
  slugifyOptionId,
} from "@/lib/store-schema";

type ProductFormValues = {
  name: string;
  slug: string;
  category: string;
  flavor: string;
  price: string;
  serves: string;
  leadTime: string;
  image: string;
  accent: string;
  categories: string;
  highlights: string;
  description: string;
  variantBaseWeightKg: string;
  variantMaxWeightKg: string;
  weightOptions: ProductWeightOption[];
  flavorOptions: ProductFlavorOption[];
};

const defaultServes = "Serves 6-8";

const emptyForm: ProductFormValues = {
  name: "",
  slug: "",
  category: "",
  flavor: "",
  price: "",
  serves: defaultServes,
  leadTime: "Same day",
  image: "",
  accent: "from-rose-100 via-orange-50 to-amber-100",
  categories: "",
  highlights: "Freshly baked, Hyderabad delivery",
  description: "",
  variantBaseWeightKg: "",
  variantMaxWeightKg: "",
  weightOptions: [],
  flavorOptions: [...DEFAULT_FLAVOR_OPTIONS],
};

function toFormValues(product: Product): ProductFormValues {
  const sortedWeights = [...product.weightOptions].sort((left, right) => left.kilograms - right.kilograms);
  const baseWeightKg = sortedWeights[0]?.kilograms ?? extractBaseWeightFromDescription(product.description);
  const maxWeightKg = sortedWeights.at(-1)?.kilograms ?? (baseWeightKg ? Math.max(4, baseWeightKg) : undefined);

  return {
    name: product.name,
    slug: product.slug,
    category: product.category,
    flavor: product.flavor,
    price: String(product.price),
    serves: product.serves,
    leadTime: product.leadTime,
    image: product.image,
    accent: product.accent,
    categories: product.categories.join(", "),
    highlights: product.highlights.join(", "),
    description: product.description,
    variantBaseWeightKg: baseWeightKg ? String(baseWeightKg) : "",
    variantMaxWeightKg: maxWeightKg ? String(maxWeightKg) : "",
    weightOptions: product.weightOptions,
    flavorOptions: product.flavorOptions,
  };
}

function buildPayload(values: ProductFormValues) {
  const basePrice = Number(values.price);
  const baseWeightKg = Number(values.variantBaseWeightKg);
  const maxWeightKg = Number(values.variantMaxWeightKg);
  const variantsEnabled =
    Number.isFinite(baseWeightKg) &&
    baseWeightKg > 0 &&
    Number.isFinite(maxWeightKg) &&
    maxWeightKg >= baseWeightKg;

  return {
    name: values.name,
    slug: values.slug,
    category: values.category,
    flavor: values.flavor,
    price: Number(values.price),
    serves: values.serves,
    leadTime: values.leadTime,
    image: values.image,
    accent: values.accent,
    categories: values.categories,
    highlights: values.highlights,
    description: values.description,
    weightOptions: variantsEnabled
      ? getGeneratedWeightOptions(basePrice, baseWeightKg, maxWeightKg, values.serves)
      : [],
    flavorOptions: variantsEnabled ? values.flavorOptions : [],
  };
}

function createFlavorOption(label = "", pricePerKg = 0): ProductFlavorOption {
  return {
    id: slugifyOptionId(label || "flavor"),
    label,
    pricePerKg,
  };
}

export function AdminProductsClient({ initialProducts }: { initialProducts: Product[] }) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [catalogSearch, setCatalogSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [view, setView] = useState<"list" | "edit">("list");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [values, setValues] = useState<ProductFormValues>(emptyForm);
  const [isPending, setIsPending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const baseWeightKg = Number(values.variantBaseWeightKg);
  const maxWeightKg = Number(values.variantMaxWeightKg);
  const variantsEnabled =
    Number.isFinite(baseWeightKg) &&
    baseWeightKg > 0 &&
    Number.isFinite(maxWeightKg) &&
    maxWeightKg >= baseWeightKg;
  const generatedWeightOptions = useMemo(() => {
    const basePrice = Number(values.price);
    if (!Number.isFinite(basePrice) || basePrice <= 0 || !variantsEnabled) {
      return [];
    }

    return getGeneratedWeightOptions(basePrice, baseWeightKg, maxWeightKg, values.serves);
  }, [baseWeightKg, maxWeightKg, values.price, values.serves, variantsEnabled]);

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === selectedId) ?? null,
    [products, selectedId],
  );
  const visibleProducts = useMemo(() => {
    const query = catalogSearch.trim().toLowerCase();
    return products.filter((product) =>
      (categoryFilter === "all" || product.categories.some((category) => category.toLowerCase() === categoryFilter.toLowerCase()) || product.category.toLowerCase() === categoryFilter.toLowerCase()) &&
      (!query || [product.name, product.slug, product.category, ...product.categories].join(" ").toLowerCase().includes(query)),
    );
  }, [catalogSearch, categoryFilter, products]);
  const catalogCategories = useMemo(() => [...new Set(products.flatMap((product) => [...product.categories, product.category]).filter(Boolean))].sort((a, b) => a.localeCompare(b)), [products]);

  const startCreate = () => {
    setView("edit");
    setSelectedId(null);
    setValues(emptyForm);
    setError("");
    setSuccess("");
  };

  const startEdit = (product: Product) => {
    setView("edit");
    setSelectedId(product.id);
    setValues(toFormValues(product));
    setError("");
    setSuccess("");
  };

  const updateValue = (key: keyof ProductFormValues, value: string) => {
    setValues((current) => {
      if (key === "variantBaseWeightKg") {
        const nextBaseWeight = Number(value);
        const currentMaxWeight = Number(current.variantMaxWeightKg);
        const nextMaxWeight =
          Number.isFinite(nextBaseWeight) && nextBaseWeight > 0
            ? !Number.isFinite(currentMaxWeight) || currentMaxWeight < nextBaseWeight
              ? String(Math.max(4, nextBaseWeight))
              : current.variantMaxWeightKg
            : "";

        return {
          ...current,
          variantBaseWeightKg: value,
          variantMaxWeightKg: nextMaxWeight,
        };
      }

      return { ...current, [key]: value };
    });
  };

  const replaceFlavorOptions = (flavorOptions: ProductFlavorOption[]) => {
    setValues((current) => ({ ...current, flavorOptions }));
  };

  const loadStandardFlavors = () => {
    replaceFlavorOptions([...DEFAULT_FLAVOR_OPTIONS]);
  };

  const addFlavorOption = () => {
    replaceFlavorOptions([...values.flavorOptions, createFlavorOption()]);
  };

  const updateFlavorOption = (
    index: number,
    key: keyof ProductFlavorOption,
    value: string,
  ) => {
    replaceFlavorOptions(
      values.flavorOptions.map((option, optionIndex) => {
        if (optionIndex !== index) {
          return option;
        }

        if (key === "label") {
          return {
            ...option,
            label: value,
            id: slugifyOptionId(value || option.id),
          };
        }

        return {
          ...option,
          pricePerKg: Number(value),
        };
      }),
    );
  };

  const removeFlavorOption = (index: number) => {
    replaceFlavorOptions(values.flavorOptions.filter((_, optionIndex) => optionIndex !== index));
  };

  const handleImageUpload = async (file: File) => {
    setError("");
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/uploads", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json()) as {
        data?: { url: string };
        error?: string;
      };

      if (!response.ok || !payload.data) {
        throw new Error(payload.error ?? "Unable to upload the image.");
      }

      setValues((current) => ({ ...current, image: payload.data!.url }));
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Something went wrong while uploading the image.",
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsPending(true);

    try {
      const isEdit = Boolean(selectedId);
      const response = await fetch(
        isEdit ? `/api/admin/products/${selectedId}` : "/api/admin/products",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(buildPayload(values)),
        },
      );

      const payload = (await response.json()) as {
        data?: Product;
        error?: string;
      };

      if (!response.ok || !payload.data) {
        throw new Error(payload.error ?? "Unable to save this product.");
      }

      const savedProduct = payload.data;

      if (isEdit) {
        setProducts((current) =>
          current.map((product) => (product.id === savedProduct.id ? savedProduct : product)),
        );
        setSuccess("Product updated.");
      } else {
        setProducts((current) => [savedProduct, ...current]);
        setSelectedId(savedProduct.id);
        setSuccess("Product created.");
      }

      setValues(toFormValues(savedProduct));
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Something went wrong while saving the product.",
      );
    } finally {
      setIsPending(false);
    }
  };

  if (view === "list") {
    return (
      <div className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><p className="text-sm font-semibold text-[var(--brand-primary)]">Catalog</p><h2 className="mt-1 text-3xl font-semibold text-black">Products</h2><p className="mt-2 text-sm text-[var(--text-secondary)]">{products.length} cakes in your catalog</p></div>
          <button type="button" onClick={startCreate} className="rounded-xl bg-[var(--brand-primary)] px-5 py-3 text-sm font-semibold text-white shadow-sm">Add product</button>
        </div>
        <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-black/10 p-4 sm:flex-row">
            <label className="relative min-w-0 flex-1"><span className="sr-only">Search products</span><span aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">⌕</span><input type="search" value={catalogSearch} onChange={(event) => setCatalogSearch(event.target.value)} placeholder="Search products by name, slug, or category" className="w-full rounded-xl border border-black/15 py-3 pl-9 pr-3 text-sm outline-none focus:border-[var(--brand-primary)]" /></label>
            <label className="sm:w-56"><span className="sr-only">Filter by category</span><select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="w-full rounded-xl border border-black/15 bg-white px-3 py-3 text-sm"><option value="all">All categories</option>{catalogCategories.map((category) => <option key={category} value={category}>{category}</option>)}</select></label>
          </div>
          <div className="flex items-center justify-between px-4 py-3 text-xs text-gray-500"><span>{visibleProducts.length} results</span><span>Click a cake to edit</span></div>
          <div className="hidden grid-cols-[minmax(240px,1fr)_minmax(130px,0.45fr)_120px] gap-4 border-y bg-gray-50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 md:grid"><span>Product</span><span>Category</span><span className="text-right">Starting price</span></div>
          <div className="divide-y divide-black/5">
            {visibleProducts.map((product) => (
              <button key={product.id} type="button" onClick={() => startEdit(product)} className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 text-left transition hover:bg-[#fffaf6] md:grid-cols-[minmax(240px,1fr)_minmax(130px,0.45fr)_120px] md:gap-4 md:px-5">
                <span className="flex min-w-0 items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}<img src={product.image} alt="" className="h-12 w-12 shrink-0 rounded-lg border border-black/10 object-cover" />
                  <span className="min-w-0"><span className="block truncate text-sm font-semibold text-gray-900">{product.name}</span><span className="mt-1 block truncate text-xs text-gray-500">{product.slug}</span></span>
                </span>
                <span className="hidden truncate text-sm text-gray-600 md:block">{product.category}</span>
                <span className="text-right text-sm font-semibold text-gray-900"><span className="md:hidden block text-[10px] font-normal text-gray-500">From</span>₹{product.price.toLocaleString("en-IN")}</span>
                <span className="col-span-2 truncate text-xs text-gray-500 md:hidden">{product.category}</span>
              </button>
            ))}
            {visibleProducts.length === 0 && <p className="p-8 text-center text-sm text-gray-500">No cakes match this search. Try another name or category.</p>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-5">
      <section className="min-w-0 rounded-[22px] border border-[rgba(0,0,0,0.12)] bg-white p-4 shadow-[0_10px_24px_rgba(0,0,0,0.08)] sm:p-6 xl:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <button type="button" onClick={() => setView("list")} className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--brand-primary)]">← Products</button>
            <h2 className="text-[1.6rem] font-semibold text-black">
              {selectedProduct ? selectedProduct.name : "Add product"}
            </h2>
            <p className="mt-2 text-[0.98rem] text-[var(--text-secondary)]">
              Upload the cake image, set the default cake weight price, and control
              automatic weight and flavor variants per cake.
            </p>
          </div>
          {selectedProduct ? (
            <a
              href={`/cakes/${selectedProduct.slug}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-[rgba(0,0,0,0.12)] px-5 py-3 text-[0.95rem] font-semibold text-[var(--foreground)]"
            >
              Preview Product
            </a>
          ) : null}
        </div>

        <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-[0.9rem] font-semibold text-[var(--foreground)]">Name</span>
              <input
                required
                value={values.name}
                className="w-full rounded-[14px] border border-[rgba(0,0,0,0.12)] px-4 py-3"
                onChange={(event) => updateValue("name", event.target.value)}
              />
            </label>

            <label className="space-y-2">
              <span className="text-[0.9rem] font-semibold text-[var(--foreground)]">Slug</span>
              <input
                required
                value={values.slug}
                className="w-full rounded-[14px] border border-[rgba(0,0,0,0.12)] px-4 py-3"
                onChange={(event) => updateValue("slug", event.target.value)}
              />
            </label>

            <label className="space-y-2">
              <span className="text-[0.9rem] font-semibold text-[var(--foreground)]">Category</span>
              <input
                required
                value={values.category}
                className="w-full rounded-[14px] border border-[rgba(0,0,0,0.12)] px-4 py-3"
                onChange={(event) => updateValue("category", event.target.value)}
              />
            </label>

            <label className="space-y-2">
              <span className="text-[0.9rem] font-semibold text-[var(--foreground)]">Lead Time</span>
              <input
                value={values.leadTime}
                className="w-full rounded-[14px] border border-[rgba(0,0,0,0.12)] px-4 py-3"
                onChange={(event) => updateValue("leadTime", event.target.value)}
              />
            </label>

            <label className="space-y-2">
              <span className="text-[0.9rem] font-semibold text-[var(--foreground)]">Base Price (Default Weight)</span>
              <input
                required
                type="number"
                min="0"
                value={values.price}
                className="w-full rounded-[14px] border border-[rgba(0,0,0,0.12)] px-4 py-3"
                onChange={(event) => updateValue("price", event.target.value)}
              />
            </label>

            <label className="space-y-2">
              <span className="text-[0.9rem] font-semibold text-[var(--foreground)]">Serves</span>
              <input
                value={values.serves}
                className="w-full rounded-[14px] border border-[rgba(0,0,0,0.12)] px-4 py-3"
                onChange={(event) => updateValue("serves", event.target.value)}
              />
            </label>

            <label className="space-y-2 sm:col-span-2">
              <span className="text-[0.9rem] font-semibold text-[var(--foreground)]">Accent</span>
              <input
                value={values.accent}
                className="w-full rounded-[14px] border border-[rgba(0,0,0,0.12)] px-4 py-3"
                onChange={(event) => updateValue("accent", event.target.value)}
              />
            </label>
          </div>

          <div className="space-y-3 rounded-[18px] border border-[rgba(0,0,0,0.08)] bg-[var(--background)] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[1rem] font-semibold text-[var(--foreground)]">Product Image</p>
                <p className="mt-1 text-[0.92rem] text-[var(--text-secondary)]">
                  Upload an image from your device instead of pasting a URL.
                </p>
              </div>
              <label className="rounded-full bg-[var(--brand-primary)] px-5 py-3 text-[0.95rem] font-semibold text-white">
                {isUploading ? "Uploading..." : "Upload Image"}
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,.gif"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) {
                      void handleImageUpload(file);
                    }
                  }}
                />
              </label>
            </div>

            {values.image ? (
              <div className="overflow-hidden rounded-[18px] border border-[rgba(0,0,0,0.08)] bg-white p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={values.image}
                  alt={values.name || "Uploaded product"}
                  className="h-[220px] w-full rounded-[14px] object-cover object-center"
                />
                <p className="mt-3 break-all text-[0.88rem] text-[var(--text-secondary)]">{values.image}</p>
              </div>
            ) : null}
          </div>

          <div className="space-y-4 rounded-[18px] border border-[rgba(0,0,0,0.08)] bg-[var(--background)] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[1rem] font-semibold text-[var(--foreground)]">Weight Variants</p>
                <p className="mt-1 text-[0.92rem] text-[var(--text-secondary)]">
                  Set the starting cake weight and the maximum weight. The system
                  calculates each larger option automatically using the same per-Kg rate.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-[0.9rem] font-semibold text-[var(--foreground)]">Default Weight (Kg)</span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={values.variantBaseWeightKg}
                  placeholder="1"
                  className="w-full rounded-[14px] border border-[rgba(0,0,0,0.12)] px-4 py-3"
                  onChange={(event) => updateValue("variantBaseWeightKg", event.target.value)}
                />
              </label>

              <label className="space-y-2">
                <span className="text-[0.9rem] font-semibold text-[var(--foreground)]">Maximum Weight (Kg)</span>
                <input
                  type="number"
                  min={values.variantBaseWeightKg || "1"}
                  step="1"
                  value={values.variantMaxWeightKg}
                  placeholder="4"
                  className="w-full rounded-[14px] border border-[rgba(0,0,0,0.12)] px-4 py-3"
                  onChange={(event) => updateValue("variantMaxWeightKg", event.target.value)}
                />
              </label>
            </div>

            {!variantsEnabled ? (
              <p className="rounded-[14px] bg-[var(--surface-accent)] px-4 py-3 text-[0.92rem] text-[#8b5a3c]">
                Enter a default weight and maximum weight to enable cake variants. Example:
                default `2` and maximum `4` gives `2 Kg`, `3 Kg`, and `4 Kg`.
              </p>
            ) : (
              <div className="space-y-3">
                {generatedWeightOptions.map((option) => (
                  <div
                    key={option.id}
                    className="grid gap-3 rounded-[16px] border border-[rgba(0,0,0,0.08)] bg-white p-4 md:grid-cols-[1fr_1fr_1fr]"
                  >
                    <div className="rounded-[12px] border border-[rgba(0,0,0,0.08)] px-4 py-3 text-[0.96rem] text-[var(--foreground)]">
                      {option.label}
                    </div>
                    <div className="rounded-[12px] border border-[rgba(0,0,0,0.08)] px-4 py-3 text-[0.96rem] text-[var(--foreground)]">
                      {option.kilograms} Kg
                    </div>
                    <div className="rounded-[12px] border border-[rgba(0,0,0,0.08)] px-4 py-3 text-[0.96rem] font-semibold text-[var(--foreground)]">
                      Rs. {option.price}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4 rounded-[18px] border border-[rgba(0,0,0,0.08)] bg-[var(--background)] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[1rem] font-semibold text-[var(--foreground)]">Flavor Add-ons</p>
                <p className="mt-1 text-[0.92rem] text-[var(--text-secondary)]">
                  Price is added per Kg based on the selected flavor.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  className="rounded-full border border-[rgba(0,0,0,0.12)] px-4 py-2 text-[0.92rem] font-semibold text-[var(--foreground)]"
                  onClick={loadStandardFlavors}
                  disabled={!variantsEnabled}
                >
                  Load Standard Flavor List
                </button>
                <button
                  type="button"
                  className="rounded-full bg-[var(--brand-primary)] px-4 py-2 text-[0.92rem] font-semibold text-white"
                  onClick={addFlavorOption}
                  disabled={!variantsEnabled}
                >
                  Add Flavor
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {values.flavorOptions.map((option, index) => (
                <div
                  key={`${option.id}-${index}`}
                  className="grid min-w-0 gap-3 rounded-[16px] border border-[rgba(0,0,0,0.08)] bg-white p-3 sm:p-4 sm:grid-cols-2 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto]"
                >
                  <input
                    value={option.label}
                    placeholder="Flavor name"
                    className="min-w-0 w-full rounded-[12px] border border-[rgba(0,0,0,0.12)] px-3 py-3 sm:px-4"
                    onChange={(event) => updateFlavorOption(index, "label", event.target.value)}
                  />
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={option.pricePerKg}
                    placeholder="200"
                    className="min-w-0 w-full rounded-[12px] border border-[rgba(0,0,0,0.12)] px-3 py-3 sm:px-4"
                    onChange={(event) =>
                      updateFlavorOption(index, "pricePerKg", event.target.value)
                    }
                  />
                  <button
                    type="button"
                  className="rounded-full border border-[rgba(0,0,0,0.12)] px-4 py-3 text-[0.92rem] font-semibold text-[var(--foreground)]"
                  onClick={() => removeFlavorOption(index)}
                  disabled={!variantsEnabled}
                >
                  Remove
                </button>
                </div>
              ))}
            </div>
          </div>

          <label className="space-y-2">
            <span className="text-[0.9rem] font-semibold text-[var(--foreground)]">Categories</span>
            <input
              value={values.categories}
              placeholder="Birthday, Kids Cake, Theme Cake"
              className="w-full rounded-[14px] border border-[rgba(0,0,0,0.12)] px-4 py-3"
              onChange={(event) => updateValue("categories", event.target.value)}
            />
          </label>

          <label className="space-y-2">
            <span className="text-[0.9rem] font-semibold text-[var(--foreground)]">Highlights</span>
            <input
              value={values.highlights}
              placeholder="Freshly baked, Hyderabad delivery"
              className="w-full rounded-[14px] border border-[rgba(0,0,0,0.12)] px-4 py-3"
              onChange={(event) => updateValue("highlights", event.target.value)}
            />
          </label>

          <label className="space-y-2">
            <span className="text-[0.9rem] font-semibold text-[var(--foreground)]">Description</span>
            <textarea
              rows={7}
              value={values.description}
              className="w-full rounded-[14px] border border-[rgba(0,0,0,0.12)] px-4 py-3"
              onChange={(event) => updateValue("description", event.target.value)}
            />
          </label>

          {error ? (
            <p className="rounded-[14px] bg-[#fff3f0] px-4 py-3 text-[0.95rem] text-[#b93815]">
              {error}
            </p>
          ) : null}

          {success ? (
            <p className="rounded-[14px] bg-[#f1fff1] px-4 py-3 text-[0.95rem] text-[#2f8f2f]">
              {success}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <button
              disabled={isPending || isUploading}
              className="rounded-full bg-[var(--brand-primary)] px-6 py-3 text-[1rem] font-semibold text-white disabled:opacity-70"
            >
              {isPending
                ? selectedProduct
                  ? "Saving..."
                  : "Creating..."
                : selectedProduct
                  ? "Save Product"
                  : "Create Product"}
            </button>
            <button
              type="button"
              className="rounded-full border border-[rgba(0,0,0,0.12)] px-6 py-3 text-[1rem] font-semibold text-[var(--foreground)]"
              onClick={startCreate}
            >
              Clear Form
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
