import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { HomeHeroCarousel } from "@/components/store/home-hero-carousel";

describe("HomeHeroCarousel", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    cleanup();
  });

  it("shows the first banner with its call to action", () => {
    render(<HomeHeroCarousel />);

    expect(screen.getByText("Same-day delivery across Hyderabad in selected pincodes")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Order now" }).getAttribute("href")).toBe(
      "/cakes?category=Regular%20Birthday%20Cakes",
    );
  });

  it("auto-advances slides every 5 seconds", () => {
    render(<HomeHeroCarousel />);
    const track = screen.getByTestId("home-hero-track");

    expect(track.getAttribute("style")).toContain("translateX(-0%)");

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(track.getAttribute("style")).toContain("translateX(-100%)");

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(track.getAttribute("style")).toContain("translateX(-200%)");
  });

  it("moves to selected slide when indicator is clicked", () => {
    render(<HomeHeroCarousel />);
    const track = screen.getByTestId("home-hero-track");

    fireEvent.click(screen.getByRole("button", { name: "Go to slide 3" }));
    expect(track.getAttribute("style")).toContain("translateX(-200%)");
  });

  it("moves with the previous and next arrows, wrapping around", () => {
    render(<HomeHeroCarousel />);
    const track = screen.getByTestId("home-hero-track");

    fireEvent.click(screen.getByRole("button", { name: "Previous slide" }));
    expect(track.getAttribute("style")).toContain("translateX(-300%)");

    fireEvent.click(screen.getByRole("button", { name: "Next slide" }));
    expect(track.getAttribute("style")).toContain("translateX(-0%)");
  });
});
