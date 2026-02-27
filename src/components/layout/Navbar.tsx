"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, Menu, ShoppingBag, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { categories, type Category } from "@/config/categories";

function renderDesktopSubcategories(
  items: Category[] | undefined,
  onNavigate: () => void,
) {
  if (!items?.length) {
    return (
      <p className="text-sm text-muted-foreground">
        Browse this category collection.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.slug}>
          <Link
            href={item.href}
            onClick={onNavigate}
            className="text-sm font-medium text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {item.name}
          </Link>

          {item.children?.length ? (
            <ul className="mt-2 space-y-1 border-l border-border pl-3">
              {item.children.map((child) => (
                <li key={child.slug}>
                  <Link
                    href={child.href}
                    onClick={onNavigate}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    {child.name}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

function renderMobileSubcategories(
  items: Category[] | undefined,
  onNavigate: () => void,
) {
  if (!items?.length) {
    return null;
  }

  return (
    <ul className="mt-3 space-y-2">
      {items.map((item) => (
        <li key={item.slug}>
          <Link
            href={item.href}
            onClick={onNavigate}
            className="block rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {item.name}
          </Link>

          {item.children?.length ? (
            <ul className="mt-1 space-y-1 border-l border-border pl-3">
              {item.children.map((child) => (
                <li key={child.slug}>
                  <Link
                    href={child.href}
                    onClick={onNavigate}
                    className="block rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    {child.name}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

export function Navbar() {
  const { openCart, cartCount } = useCart();
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [desktopMenuOpen, setDesktopMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openMobileSections, setOpenMobileSections] = useState<
    Record<string, boolean>
  >({});

  const desktopMenuRef = useRef<HTMLDivElement>(null);
  const mobileDrawerRef = useRef<HTMLDivElement>(null);
  const mobileCloseButtonRef = useRef<HTMLButtonElement>(null);

  const handleNavigate = () => {
    setDesktopMenuOpen(false);
    setMobileMenuOpen(false);
  };

  const toggleMobileSection = (slug: string) => {
    setOpenMobileSections((previous) => ({
      ...previous,
      [slug]: !previous[slug],
    }));
  };

  useEffect(() => {
    let isActive = true;
    const supabase = createBrowserSupabaseClient();
    if (!supabase) {
      queueMicrotask(() => {
        if (isActive) {
          setMounted(true);
        }
      });

      return () => {
        isActive = false;
      };
    }

    const hydrateAuthState = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!isActive) {
        return;
      }

      setIsAuthenticated(Boolean(user));
      setMounted(true);
    };

    void hydrateAuthState();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isActive) {
        return;
      }

      setIsAuthenticated(Boolean(session?.user));
    });

    return () => {
      isActive = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!desktopMenuOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (desktopMenuRef.current?.contains(target)) {
        return;
      }

      setDesktopMenuOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDesktopMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [desktopMenuOpen]);

  useEffect(() => {
    if (!mobileMenuOpen) {
      return;
    }

    const previousActiveElement = document.activeElement as HTMLElement | null;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    mobileCloseButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setMobileMenuOpen(false);
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const drawer = mobileDrawerRef.current;
      if (!drawer) {
        return;
      }

      const focusable = drawer.querySelectorAll<HTMLElement>(
        "a[href], button:not([disabled]), [tabindex]:not([tabindex='-1'])",
      );

      if (focusable.length === 0) {
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey) {
        if (!active || active === first || !drawer.contains(active)) {
          event.preventDefault();
          last.focus();
        }
        return;
      }

      if (!active || active === last || !drawer.contains(active)) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
      previousActiveElement?.focus();
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <nav className="fixed z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto grid h-20 max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-6">
          <Link
            href="/"
            className="justify-self-start font-serif text-4xl italic lowercase tracking-tight text-[#b38407] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background md:text-5xl"
          >
            savzix
          </Link>

          <div
            ref={desktopMenuRef}
            className="relative hidden justify-self-center md:block"
            onMouseEnter={() => setDesktopMenuOpen(true)}
            onMouseLeave={() => setDesktopMenuOpen(false)}
          >
            <button
              type="button"
              aria-haspopup="true"
              aria-expanded={desktopMenuOpen}
              aria-controls="shop-mega-menu"
              onClick={() => setDesktopMenuOpen((previous) => !previous)}
              className="inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Shop
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  desktopMenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            <div
              id="shop-mega-menu"
              className={`absolute left-1/2 top-[calc(100%+0.75rem)] w-[min(92vw,76rem)] max-h-[calc(100vh-8rem)] -translate-x-1/2 overflow-y-auto rounded-3xl border border-border bg-card p-6 shadow-2xl transition-all duration-200 ${
                desktopMenuOpen
                  ? "visible translate-y-0 opacity-100"
                  : "invisible -translate-y-1 opacity-0"
              }`}
            >
              <nav aria-label="Shop categories">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
                  {categories.map((category) => (
                    <section
                      key={category.slug}
                      className="max-h-[28rem] overflow-y-auto rounded-2xl border border-border/60 bg-background/40 p-4"
                    >
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <Link
                          href={category.href}
                          onClick={handleNavigate}
                          className="text-base font-semibold text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                        >
                          {category.name}
                        </Link>
                        <Link
                          href={category.href}
                          onClick={handleNavigate}
                          className="text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                        >
                          View all
                        </Link>
                      </div>

                      {renderDesktopSubcategories(category.children, handleNavigate)}
                    </section>
                  ))}
                </div>
              </nav>
            </div>
          </div>

          <div className="flex items-center justify-self-end gap-2 sm:gap-4">
            <button
              type="button"
              aria-label="Open category menu"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-category-drawer"
              onClick={() => {
                setDesktopMenuOpen(false);
                setMobileMenuOpen(true);
              }}
              className="inline-flex rounded-full border border-border p-2 text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            <Link
              href={isAuthenticated ? "/account" : "/login"}
              className="hidden text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:inline-flex"
            >
              {isAuthenticated ? "Account" : "Login"}
            </Link>
            {mounted && isAuthenticated && (
              <SignOutButton
                className="hidden text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:inline-flex"
                onSignedOut={() => setIsAuthenticated(false)}
              />
            )}
            <button
              onClick={openCart}
              className="relative rounded-full p-2 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="Open cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {mounted && cartCount > 0 && (
                <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      <div
        className={`fixed inset-0 z-[70] md:hidden ${
          mobileMenuOpen ? "" : "pointer-events-none"
        }`}
        aria-hidden={!mobileMenuOpen}
      >
        <button
          type="button"
          aria-label="Close menu backdrop"
          className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${
            mobileMenuOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setMobileMenuOpen(false)}
        />

        <aside
          id="mobile-category-drawer"
          ref={mobileDrawerRef}
          role="dialog"
          aria-modal="true"
          aria-label="Shop categories"
          className={`absolute left-0 top-0 h-full w-[88vw] max-w-sm border-r border-border bg-card p-5 shadow-2xl transition-transform duration-200 ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">
              Shop
            </p>
            <button
              ref={mobileCloseButtonRef}
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-full border border-border p-2 text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="Close category menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav aria-label="Mobile shop categories" className="h-[calc(100%-3rem)] overflow-y-auto pr-1">
            <ul className="space-y-2">
              {categories.map((category) => {
                const isOpen = Boolean(openMobileSections[category.slug]);
                const sectionId = `mobile-section-${category.slug}`;

                return (
                  <li key={category.slug} className="rounded-xl border border-border/60">
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={sectionId}
                      onClick={() => toggleMobileSection(category.slug)}
                      className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      <span>{category.name}</span>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    <div
                      id={sectionId}
                      className={`grid overflow-hidden transition-all duration-200 ${
                        isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                      }`}
                    >
                      <div className="min-h-0 border-t border-border px-2 pb-3 pt-2">
                        <Link
                          href={category.href}
                          onClick={handleNavigate}
                          className="block rounded-lg px-3 py-2 text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:bg-muted hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        >
                          View all
                        </Link>

                        {renderMobileSubcategories(category.children, handleNavigate)}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>
      </div>
    </>
  );
}
