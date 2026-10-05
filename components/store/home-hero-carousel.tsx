"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { HeroDecorations, type HeroDecor } from "./hero-decorations";

type HeroSlide = {
  title: [string, string];
  subtitle: string;
  ctaText: string;
  ctaHref: string;
  image: string;
  imageAlt: string;
  background: string;
  decor: HeroDecor;
  dark?: boolean;
};

const HERO_SLIDES: HeroSlide[] = [
  {
    title: ["Birthday Cakes,", "Delivered Today"],
    subtitle: "Same-day delivery across Hyderabad in selected pincodes",
    ctaText: "Order now",
    ctaHref: "/cakes?category=Regular%20Birthday%20Cakes",
    image: "/images/home/floral.jpg",
    imageAlt: "Pink drip birthday cake topped with an ice cream cone",
    background: "#fbefec",
    decor: {
      bunting: ["#f2b8c6", "#e3c07f", "#f8dfd2", "#c98a96"],
      balloons: ["#f4bcc8", "#dcb46c", "#fdf3ee"],
      confetti: ["#e8a3b3", "#d9b26a", "#f4c7b5"],
    },
  },
  {
    title: ["Rich Chocolate,", "Every Layer"],
    subtitle: "Truffle, drip and Black Forest favourites, freshly baked",
    ctaText: "Shop chocolate",
    ctaHref: "/cakes?category=Chocolate%20Truffle",
    image: "/images/home/celebration.jpg",
    imageAlt: "Chocolate drip cake with piped chocolate rosettes",
    background: "#f4ebe3",
    decor: {
      bunting: ["#7a1f22", "#d9b26a", "#f1e3d3", "#a8553f"],
      confetti: ["#d9b26a", "#8a4b32", "#e8cfb4"],
    },
  },
  {
    title: ["Anniversary &", "Wedding Cakes"],
    subtitle: "Tiered designs with fresh-flower details for your big day",
    ctaText: "Explore designs",
    ctaHref: "/cakes?category=Wedding%20cakes",
    image: "/images/home/wedding.jpg",
    imageAlt: "Four-tier white wedding cake decorated with pink roses",
    background: "#f8f1ec",
    decor: {
      balloons: ["#fbf3ee", "#e8c9a2", "#f3c6cf"],
      confetti: ["#d9b26a", "#f0c4cc", "#e8d6c0"],
    },
  },
  {
    title: ["Your Theme,", "Our Bake"],
    subtitle: "Share a photo or idea and we'll design a custom cake for you",
    ctaText: "Design your cake",
    ctaHref: "/custom-orders",
    image: "/images/home/party.jpg",
    imageAlt: "Rainbow layer cake covered in sprinkles, sliced to show colourful layers",
    background: "#121a23",
    decor: {
      bunting: ["#f25f5c", "#ffd166", "#5ec2b7", "#9b7ede"],
      confetti: ["#f25f5c", "#ffd166", "#5ec2b7", "#9b7ede"],
    },
    dark: true,
  },
];

const AUTO_SCROLL_MS = 5000;

function Arrow({ direction }: { direction: "left" | "right" }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d={direction === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} />
    </svg>
  );
}

export function HomeHeroCarousel() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const totalSlides = HERO_SLIDES.length;

  const goTo = useCallback(
    (index: number) => setActiveSlide((index + totalSlides) % totalSlides),
    [totalSlides],
  );

  useEffect(() => {
    if (paused) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % totalSlides);
    }, AUTO_SCROLL_MS);

    return () => window.clearInterval(intervalId);
  }, [paused, totalSlides, activeSlide]);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured cakes"
      className="relative overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={(event) => {
        touchStartX.current = event.touches[0].clientX;
      }}
      onTouchEnd={(event) => {
        if (touchStartX.current === null) {
          return;
        }
        const distance = event.changedTouches[0].clientX - touchStartX.current;
        if (Math.abs(distance) > 40) {
          goTo(activeSlide + (distance < 0 ? 1 : -1));
        }
        touchStartX.current = null;
      }}
    >
      <div
        data-testid="home-hero-track"
        className="flex transition-transform duration-700 ease-out motion-reduce:transition-none"
        style={{ transform: `translateX(-${activeSlide * 100}%)` }}
      >
        {HERO_SLIDES.map((slide, index) => {
          const active = index === activeSlide;
          return (
            <article
              key={slide.ctaHref}
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${totalSlides}`}
              aria-hidden={!active}
              className="relative h-[290px] w-full shrink-0 overflow-hidden sm:h-[360px] lg:h-[440px]"
              style={{ backgroundColor: slide.background }}
            >
              <div className="absolute inset-y-0 right-0 w-[62%] [mask-image:linear-gradient(to_right,transparent,black_38%)] lg:w-[58%]">
                <Image
                  src={slide.image}
                  alt={slide.imageAlt}
                  fill
                  priority={index === 0}
                  sizes="(min-width: 1024px) 58vw, 62vw"
                  className="object-cover object-center"
                />
              </div>
              <HeroDecorations decor={slide.decor} />

              <div className="relative mx-auto flex h-full max-w-[1500px] items-center px-5 sm:px-16 lg:px-24">
                <div className="max-w-[54%] sm:max-w-[48%]">
                  <h2
                    className={`text-[1.55rem] leading-[1.08] tracking-[-0.02em] sm:text-[2.6rem] lg:text-[3.6rem] ${
                      slide.dark ? "text-white" : "text-[var(--brand-primary)]"
                    }`}
                    style={{ fontFamily: "var(--font-sans)", fontWeight: 800 }}
                  >
                    {slide.title[0]}
                    <br />
                    {slide.title[1]}
                  </h2>
                  <p
                    className={`mt-3 max-w-[30rem] text-[0.85rem] leading-snug sm:mt-4 sm:text-[1.15rem] lg:text-[1.35rem] ${
                      slide.dark ? "text-white/85" : "text-[var(--foreground)]"
                    }`}
                  >
                    {slide.subtitle}
                  </p>
                  <Link
                    href={slide.ctaHref}
                    tabIndex={active ? undefined : -1}
                    className="mt-5 inline-flex whitespace-nowrap rounded-full px-5 py-2.5 text-[0.8rem] font-bold uppercase tracking-[0.04em] shadow-[0_8px_18px_rgba(0,0,0,0.16)] transition hover:opacity-90 sm:mt-7 sm:px-7 sm:py-3.5 sm:text-[1rem]"
                    // Inline colours keep the global brand-button rule (8px corners) off this pill.
                    style={{
                      backgroundColor: slide.dark ? "#fff" : "var(--brand-primary)",
                      color: slide.dark ? "var(--brand-primary)" : "#fff",
                    }}
                  >
                    {slide.ctaText}
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => goTo(activeSlide - 1)}
        aria-label="Previous slide"
        className="absolute left-3 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[var(--foreground)] shadow-[0_4px_14px_rgba(0,0,0,0.15)] transition hover:scale-105 sm:flex lg:left-5"
      >
        <Arrow direction="left" />
      </button>
      <button
        type="button"
        onClick={() => goTo(activeSlide + 1)}
        aria-label="Next slide"
        className="absolute right-3 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[var(--foreground)] shadow-[0_4px_14px_rgba(0,0,0,0.15)] transition hover:scale-105 sm:flex lg:right-5"
      >
        <Arrow direction="right" />
      </button>

      <div className="absolute bottom-4 left-5 flex items-center gap-2 sm:bottom-6 sm:left-10">
        {HERO_SLIDES.map((slide, index) => (
          <button
            key={slide.ctaHref}
            type="button"
            onClick={() => goTo(index)}
            aria-label={`Go to slide ${index + 1}`}
            aria-current={activeSlide === index}
            className={`h-2.5 rounded-full transition-all ${
              activeSlide === index ? "w-9" : "w-2.5"
            }`}
            style={{
              backgroundColor: HERO_SLIDES[activeSlide].dark
                ? activeSlide === index ? "#fff" : "rgba(255,255,255,0.45)"
                : activeSlide === index ? "var(--brand-primary)" : "rgba(0,0,0,0.2)",
            }}
          />
        ))}
      </div>
    </section>
  );
}
