"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const ROTATION_INTERVAL_MS = 6_000;

const heroSlides = [
  {
    name: "Beauty & Skincare",
    eyebrow: "Beauty & Skincare",
    heading: "Beauty essentials for every routine.",
    description:
      "Shop cosmetics, nails, and skincare essentials from trusted brands with fast UK dispatch and secure checkout.",
    href: "/c/beauty-skincare",
    desktopSrc: "/home/premium-catalogue-hero-v2.png",
    mobileSrc: "/home/premium-catalogue-hero-v2.png",
    desktopImageClass: "object-contain object-right",
    alt: "Five SAVZIX beauty and personal care products arranged in a premium studio setting",
  },
  {
    name: "Fragrance",
    eyebrow: "Fragrance",
    heading: "Find a fragrance worth remembering.",
    description:
      "Explore women’s, men’s, luxury, and celebrity scents, with fragrance picks for everyday wear and thoughtful gifting.",
    href: "/c/fragrance",
    desktopSrc: "/categories/fragrance-hero-wide.png",
    mobileSrc: "/categories/fragrance-hero.png",
    desktopImageClass: "object-cover object-center",
    alt: "Luxury fragrance bottles arranged on a midnight and champagne studio set",
  },
  {
    name: "Gift Sets",
    eyebrow: "Gift Sets",
    heading: "Beautiful gifts, ready to give.",
    description:
      "Discover ready-to-gift beauty, fragrance, toiletries, and alcohol sets for celebrations, occasions, and everyday surprises.",
    href: "/c/gift-sets",
    desktopSrc: "/categories/gift-sets-hero-wide.png",
    mobileSrc: "/categories/gift-sets-hero.png",
    desktopImageClass: "object-cover object-center",
    alt: "Premium beauty and fragrance gift sets arranged with burgundy ribbon",
  },
  {
    name: "Toiletries",
    eyebrow: "Toiletries",
    heading: "Daily care made simple.",
    description:
      "Shop bathing, dental, hair, hygiene, and family toiletries from brands you know for the essentials your home needs.",
    href: "/c/toiletries",
    desktopSrc: "/categories/toiletries-hero-wide.png",
    mobileSrc: "/categories/toiletries-hero.png",
    desktopImageClass: "object-cover object-center",
    alt: "Everyday toiletries arranged in a fresh mint and white studio",
  },
] as const;

const trustHighlights = ["Fast UK Dispatch", "Secure Checkout", "Easy Returns"];

export function Hero() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isInteractionPaused, setIsInteractionPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const activeSlide = heroSlides[activeIndex];

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => setPrefersReducedMotion(mediaQuery.matches);

    updateMotionPreference();
    mediaQuery.addEventListener("change", updateMotionPreference);

    return () => mediaQuery.removeEventListener("change", updateMotionPreference);
  }, []);

  useEffect(() => {
    if (isInteractionPaused || prefersReducedMotion) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % heroSlides.length);
    }, ROTATION_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [isInteractionPaused, prefersReducedMotion]);

  const showSlide = (index: number) => {
    setActiveIndex((index + heroSlides.length) % heroSlides.length);
  };

  const handleBlur = (event: React.FocusEvent<HTMLElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setIsInteractionPaused(false);
    }
  };

  return (
    <>
      <section
        aria-roledescription="carousel"
        aria-label="Featured SAVZIX categories"
        className="relative overflow-hidden bg-background"
        onMouseEnter={() => setIsInteractionPaused(true)}
        onMouseLeave={() => setIsInteractionPaused(false)}
        onFocusCapture={() => setIsInteractionPaused(true)}
        onBlurCapture={handleBlur}
      >
        <div aria-hidden="true" className="absolute inset-0 z-0 hidden lg:block">
          {heroSlides.map((slide, index) => (
            <div
              key={slide.name}
              className={`absolute inset-0 transition-opacity duration-500 ease-out ${
                index === activeIndex ? "opacity-100" : "opacity-0"
              }`}
            >
              <Image
                src={slide.desktopSrc}
                alt=""
                fill
                priority={index === 0}
                sizes="(min-width: 1024px) 100vw, 1px"
                className={`${slide.desktopImageClass} brightness-[1.02] contrast-[1.02]`}
              />
            </div>
          ))}
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.98)_0%,rgba(255,255,255,0.94)_36%,rgba(255,255,255,0.58)_52%,rgba(255,255,255,0)_64%)]" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background via-background/35 to-transparent" />
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-[1440px] items-center px-6 py-10 sm:py-12 lg:min-h-[25rem] lg:px-10 lg:py-14">
          <div className="max-w-[34rem] space-y-5 text-left lg:space-y-6">
            <p className="sr-only">{activeSlide.alt}</p>
            <span className="text-primary text-xs font-bold uppercase tracking-[0.18em]">
              {activeSlide.eyebrow}
            </span>
            <h1 className="text-4xl font-bold leading-[1.02] tracking-tight text-foreground sm:text-5xl lg:text-5xl">
              {activeSlide.heading}
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-muted-foreground lg:text-lg">
              {activeSlide.description}
            </p>
            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap sm:gap-5 lg:pt-4">
              <Link
                href={activeSlide.href}
                className="rounded-lg bg-foreground px-6 py-3 text-center text-sm font-bold text-primary-foreground transition-colors hover:bg-[#0b1f33]"
              >
                Shop {activeSlide.name}
              </Link>
              <Link
                href="/shop"
                className="rounded-lg border border-border bg-white px-6 py-3 text-center text-sm font-bold text-foreground transition-colors hover:border-primary hover:text-primary"
              >
                Browse all categories
              </Link>
            </div>

          </div>
        </div>

        <div aria-hidden="true" className="relative h-60 w-full sm:h-80 lg:hidden">
          {heroSlides.map((slide, index) => (
            <div
              key={slide.name}
              className={`absolute inset-0 transition-opacity duration-500 ease-out ${
                index === activeIndex ? "opacity-100" : "opacity-0"
              }`}
            >
              <Image
                src={slide.mobileSrc}
                alt=""
                fill
                priority={index === 0}
                sizes="(max-width: 1023px) 100vw, 1px"
                className="object-cover object-center brightness-[1.02] contrast-[1.02] sm:object-contain sm:object-center"
              />
            </div>
          ))}
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-background to-transparent" />
        </div>

        <div
          className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 lg:bottom-6"
          role="group"
          aria-label="Choose a category slide"
        >
          {heroSlides.map((slide, index) => (
            <button
              key={slide.name}
              type="button"
              onClick={() => showSlide(index)}
              className={`h-2.5 w-2.5 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                index === activeIndex ? "bg-primary" : "bg-border hover:bg-muted-foreground"
              }`}
              aria-label={`Show ${slide.name}`}
              aria-current={index === activeIndex ? "true" : undefined}
            />
          ))}
        </div>
      </section>

      <section className="border-b border-border bg-muted">
        <div className="mx-auto max-w-7xl px-6 py-5">
          <div className="grid gap-4 text-sm text-muted-foreground sm:grid-cols-3 sm:gap-6">
            {trustHighlights.map((highlight) => (
              <p key={highlight} className="text-center font-semibold">
                {highlight}
              </p>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
