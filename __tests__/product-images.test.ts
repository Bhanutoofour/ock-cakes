import { describe, expect, it } from "vitest";
import { getProductImageUrl } from "@/lib/product-images";

describe("legacy product photos", () => {
  it("restores distinct original assets instead of assigning one cake to every product", () => {
    const ids = ["8ee0e2_3907cb6c92fa4fc9a54b64cd3b864339", "8ee0e2_6d2282b5275f43d2a8b1daa57fd27ddf"];
    const urls = ids.map((id) => getProductImageUrl(`https://occasionkart.com/wp-content/uploads/2025/08/${id}mv2.jpg`));
    expect(urls).toEqual(ids.map((id) => `https://static.wixstatic.com/media/${id}~mv2.jpg`));
    expect(new Set(urls).size).toBe(2);
  });
  it("preserves local images and uses an honest placeholder for unrecoverable legacy photos", () => {
    expect(getProductImageUrl("/images/cake.jpg")).toBe("/images/cake.jpg");
    expect(getProductImageUrl("https://occasionkart.com/wp-content/uploads/2025/06/unknown.jpg")).toBe("/images/product-unavailable.svg");
  });
});
