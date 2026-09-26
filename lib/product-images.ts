const PRODUCT_IMAGE_PROXY_PATH = "/api/image-proxy";
const FALLBACK_IMAGE = "/images/product-unavailable.svg";
const BLOCKED_PREFIXES = [
  "https://occasionkart.com/wp-content/uploads",
  "https://your-new-storage-domain",
  "https://placeholder.invalid",
];

function isHttpUrl(value: string) {
  return value.startsWith("http://") || value.startsWith("https://");
}

function shouldProxyProductImages() {
  const value = (process.env.PRODUCT_IMAGE_PROXY_ENABLED ?? "").trim().toLowerCase();
  if (!value) {
    return true;
  }
  return value === "1" || value === "true" || value === "yes";
}

function isBlockedSourceUrl(value: string) {
  return BLOCKED_PREFIXES.some((prefix) => value.startsWith(prefix));
}

export function getProductImageUrl(input: string | null | undefined) {
  const trimmed = (input ?? "").trim();
  if (!trimmed) {
    return FALLBACK_IMAGE;
  }

  if (trimmed.startsWith("/")) {
    return trimmed;
  }

  const normalized = trimmed.startsWith("//") ? `https:${trimmed}` : trimmed;
  if (!isHttpUrl(normalized)) {
    return FALLBACK_IMAGE;
  }

  // The WordPress migration removed the tilde from original Wix asset names.
  // Recover the exact asset ID before the retired WordPress host is blocked.
  const originalAsset = normalized.match(
    /^https:\/\/(?:www\.)?occasionkart\.com\/wp-content\/uploads\/\d{4}\/\d{2}\/([a-f0-9]+_[a-f0-9]{32})~?mv2\.(jpg|jpeg|png|webp)$/i,
  );
  if (originalAsset) {
    return `https://static.wixstatic.com/media/${originalAsset[1]}~mv2.${originalAsset[2]}`;
  }

  if (isBlockedSourceUrl(normalized)) {
    return FALLBACK_IMAGE;
  }

  if (!shouldProxyProductImages()) {
    return normalized;
  }

  return `${PRODUCT_IMAGE_PROXY_PATH}?src=${encodeURIComponent(normalized)}`;
}
