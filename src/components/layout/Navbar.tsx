"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Session } from "@supabase/supabase-js";
import { ChevronDown, ChevronRight, Menu, Search, ShoppingBag, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { categories, type Category } from "@/config/categories";

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
  const defaultDesktopCategory = categories[0];
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false); // ADDED: expose admin dashboard entry points in the storefront nav.
  const [desktopMenuOpen, setDesktopMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDesktopCategorySlug, setActiveDesktopCategorySlug] = useState(
    defaultDesktopCategory?.slug ?? "",
  );
  const [activeDesktopChildSlug, setActiveDesktopChildSlug] = useState(
    defaultDesktopCategory?.children?.[0]?.slug ?? "",
  );
  const [openMobileSections, setOpenMobileSections] = useState<
    Record<string, boolean>
  >({});

  const desktopMenuRef = useRef<HTMLDivElement>(null);
  const mobileDrawerRef = useRef<HTMLDivElement>(null);
  const mobileCloseButtonRef = useRef<HTMLButtonElement>(null);
  const activeDesktopCategory =
    categories.find((category) => category.slug === activeDesktopCategorySlug) ??
    defaultDesktopCategory;
  const activeDesktopChildren = activeDesktopCategory?.children ?? [];
  const activeDesktopChild =
    activeDesktopChildren.find((item) => item.slug === activeDesktopChildSlug) ??
    activeDesktopChildren[0];
  const activeDesktopGrandchildren = activeDesktopChild?.children ?? [];
  const hasDesktopGrandchildren = activeDesktopGrandchildren.length > 0;

  const handleNavigate = () => {
    setDesktopMenuOpen(false);
    setMobileMenuOpen(false);
  };

  const selectDesktopCategory = (slug: string) => {
    const nextCategory =
      categories.find((category) => category.slug === slug) ?? defaultDesktopCategory;

    setActiveDesktopCategorySlug(nextCategory?.slug ?? "");
    setActiveDesktopChildSlug(nextCategory?.children?.[0]?.slug ?? "");
  };

  const selectDesktopChild = (slug: string) => {
    setActiveDesktopChildSlug(slug);
  };

  const toggleMobileSection = (slug: string) => {
    setOpenMobileSections((previous) => ({
      ...previous,
      [slug]: !previous[slug],
    }));
  };

  useEffect(() => {
    let isActive = true;
    let authStateVersion = 0;
    let profileLookupTimer: ReturnType<typeof setTimeout> | null = null;
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

    const syncAuthState = (session: Session | null) => {
      if (!isActive) {
        return;
      }

      const stateVersion = ++authStateVersion;
      const user = session?.user ?? null;

      setIsAuthenticated(Boolean(user));
      setIsAdminUser(false);
      setMounted(true);

      if (profileLookupTimer) {
        clearTimeout(profileLookupTimer);
        profileLookupTimer = null;
      }

      if (!user) {
        return;
      }

      // Supabase holds its auth lock while this callback runs. Defer any
      // additional client request until the callback has returned.
      profileLookupTimer = setTimeout(() => {
        profileLookupTimer = null;

        if (!isActive || stateVersion !== authStateVersion) {
          return;
        }

        void (async () => {
          const { data: profile, error } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .maybeSingle();

          if (!isActive || stateVersion !== authStateVersion) {
            return;
          }

          if (error) {
            console.error("Unable to load the current user's profile:", error);
          }

          setIsAdminUser(profile?.role === "admin");
        })();
      }, 0);
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      syncAuthState(session);
    });

    return () => {
      isActive = false;
      if (profileLookupTimer) {
        clearTimeout(profileLookupTimer);
      }
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
      <nav className="fixed z-50 w-full border-b border-border bg-white shadow-sm">
        <div className="hidden bg-foreground px-4 py-2 text-center text-xs font-semibold text-white sm:block">Free UK delivery on orders over £50 <span className="mx-2">•</span> Secure checkout <span className="mx-2">•</span> Easy returns</div>
        <div className="mx-auto grid h-20 max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-6 md:grid-cols-[auto_minmax(18rem,42rem)_auto] md:gap-6">
          <Link
            href="/"
            aria-label="SAVZIX home"
            className="inline-flex justify-self-start rounded-md transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <BrandLogo
              variant="horizontal"
              priority
              className="h-8 w-auto md:h-9"
            />
          </Link>

          <div
            ref={desktopMenuRef}
            className="relative hidden w-full max-w-xl justify-self-center md:block"
          >
            <form action="/shop" className="flex h-11 w-full items-center gap-3 rounded-lg border border-transparent bg-muted px-4 focus-within:border-primary">
              <Search className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
              <input name="q" type="search" placeholder="Search skincare, beauty and everyday essentials" className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground" />
            </form>
            <button
              type="button"
              aria-haspopup="true"
              aria-expanded={desktopMenuOpen}
              aria-controls="shop-mega-menu"
              onClick={() => setDesktopMenuOpen((previous) => !previous)}
              className="hidden"
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
              className={`absolute left-1/2 top-[calc(100%+0.85rem)] w-[min(96vw,78rem)] -translate-x-1/2 overflow-hidden rounded-[2rem] border border-border bg-background shadow-[0_24px_70px_rgba(26,26,24,0.14)] transition-all duration-200 ${
                desktopMenuOpen
                  ? "visible translate-y-0 opacity-100"
                  : "invisible -translate-y-1 opacity-0"
              }`}
            >
              <nav aria-label="Shop categories" className="bg-background">
                <div className="flex items-center justify-between border-b border-border px-6 py-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
                      Shop by department
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Browse the Savzix range by category and collection.
                    </p>
                  </div>

                  <Link
                    href="/shop"
                    onClick={handleNavigate}
                    className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    View all products
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>

                <div
                  className={`grid min-h-[30rem] ${
                    hasDesktopGrandchildren
                      ? "grid-cols-[18rem_18rem_minmax(0,1fr)]"
                      : "grid-cols-[18rem_minmax(0,1fr)]"
                  }`}
                >
                  <div className="border-r border-border bg-muted/45 px-4 py-5">
                    <ul className="space-y-1">
                      {categories.map((category) => {
                        const isActive = category.slug === activeDesktopCategory?.slug;

                        return (
                          <li key={category.slug}>
                            <Link
                              href={category.href}
                              onClick={handleNavigate}
                              onMouseEnter={() => selectDesktopCategory(category.slug)}
                              onFocus={() => selectDesktopCategory(category.slug)}
                              className={`flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3 text-left text-[1.05rem] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                                isActive
                                  ? "bg-[#dbe6ef] text-foreground"
                                  : "text-foreground hover:bg-background"
                              }`}
                            >
                              <span>{category.name}</span>
                              <ChevronRight
                                className={`h-4 w-4 transition-transform ${
                                  isActive ? "text-primary" : "text-muted-foreground"
                                }`}
                              />
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  <div
                    className={`px-5 py-6 ${hasDesktopGrandchildren ? "border-r border-border" : ""}`}
                  >
                    <div className="mb-5 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                          {activeDesktopCategory?.name}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Start with the main collections in this department.
                        </p>
                      </div>
                      {activeDesktopCategory ? (
                        <Link
                          href={activeDesktopCategory.href}
                          onClick={handleNavigate}
                          className="text-xs font-semibold uppercase tracking-[0.2em] text-primary transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        >
                          View all
                        </Link>
                      ) : null}
                    </div>

                    {activeDesktopChildren.length > 0 ? (
                      <ul className="space-y-2">
                        {activeDesktopChildren.map((item) => {
                          const isActive = item.slug === activeDesktopChild?.slug;

                          return (
                            <li key={item.slug}>
                              <Link
                                href={item.href}
                                onClick={handleNavigate}
                                onMouseEnter={() => selectDesktopChild(item.slug)}
                                onFocus={() => selectDesktopChild(item.slug)}
                                className={`flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-base transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                                  isActive
                                    ? "bg-[#dbe6ef] text-foreground"
                                    : "text-foreground hover:bg-muted/50 hover:text-foreground"
                                }`}
                              >
                                <span>{item.name}</span>
                                <ChevronRight
                                  className={`h-4 w-4 ${
                                    isActive ? "text-primary" : "text-muted-foreground"
                                  }`}
                                />
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <div className="rounded-2xl bg-muted/45 px-4 py-5 text-sm text-muted-foreground">
                        Browse everything inside {activeDesktopCategory?.name?.toLowerCase()}.
                      </div>
                    )}
                  </div>

                  {hasDesktopGrandchildren ? (
                    <div className="px-6 py-6">
                      <div className="mb-5 flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                            {activeDesktopChild?.name}
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Browse the next level inside this section.
                          </p>
                        </div>
                        {activeDesktopChild ? (
                          <Link
                            href={activeDesktopChild.href}
                            onClick={handleNavigate}
                            className="text-xs font-semibold uppercase tracking-[0.2em] text-primary transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                          >
                            View all
                          </Link>
                        ) : null}
                      </div>

                      <ul className="space-y-2">
                        {activeDesktopGrandchildren.map((item) => (
                          <li key={item.slug}>
                            <Link
                              href={item.href}
                              onClick={handleNavigate}
                              className="flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-base text-foreground transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            >
                              <span>{item.name}</span>
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
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
              href={
                isAuthenticated
                  ? isAdminUser
                    ? "/admin"
                    : "/account"
                  : "/login"
              }
              className="hidden text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:inline-flex"
            >
              {isAuthenticated ? (isAdminUser ? "Admin" : "Account") : "Login"}
            </Link>
            {mounted && isAuthenticated && isAdminUser && (
              <Link
                href="/account"
                className="hidden text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:inline-flex"
              >
                Account
              </Link>
            )}
            {mounted && isAuthenticated && (
              <SignOutButton
                className="hidden text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:inline-flex"
                onSignedOut={() => {
                  setIsAuthenticated(false);
                  setIsAdminUser(false);
                }}
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
        <div className="overflow-x-auto border-t border-border bg-white scrollbar-none">
          <div className="mx-auto flex w-max min-w-full max-w-7xl px-4 md:justify-center md:px-6">
            {categories.map((category) => (
              <Link key={category.slug} href={category.href} className="whitespace-nowrap border-b-2 border-transparent px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary">
                {category.name}
              </Link>
            ))}
            <Link href="/shop" className="whitespace-nowrap border-b-2 border-transparent px-4 py-3 text-sm font-semibold text-primary transition-colors hover:border-primary">Offers</Link>
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
            {mounted && (
              <div className="mb-4 rounded-2xl border border-border bg-background px-4 py-3">
                <Link
                  href={
                    isAuthenticated
                      ? isAdminUser
                        ? "/admin"
                        : "/account"
                      : "/login"
                  }
                  onClick={handleNavigate}
                  className="block text-sm font-semibold uppercase tracking-[0.16em] text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  {isAuthenticated ? (isAdminUser ? "Admin Dashboard" : "My Account") : "Login"}
                </Link>
                {isAuthenticated && isAdminUser ? (
                  <Link
                    href="/account"
                    onClick={handleNavigate}
                    className="mt-2 block text-xs uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    Customer account
                  </Link>
                ) : null}
              </div>
            )}

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
