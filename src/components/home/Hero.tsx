import Image from "next/image";
import Link from "next/link";

const trustHighlights = [
  "Fast UK Dispatch",
  "Secure Checkout",
  "Easy Returns",
];

export function Hero() {
  return (
    <>
      <section className="relative overflow-hidden bg-background">
        <div className="absolute inset-0 z-0">
          <Image
            src="/home/main-home-hero.png"
            alt="Curated SAVZIX product selection arranged on a warm neutral surface"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[68%_center] brightness-[1.02] contrast-[1.05]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(248,246,239,0.92)_0%,rgba(248,246,239,0.8)_26%,rgba(248,246,239,0.42)_46%,rgba(248,246,239,0.08)_66%,rgba(248,246,239,0)_82%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(181,138,18,0.08),_transparent_34%)]"></div>
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background via-background/35 to-transparent"></div>
        </div>

        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-[1440px] items-center px-6 py-16 lg:px-10 lg:py-20">
          <div className="max-w-[46rem] space-y-8 text-left animate-fade-in-up">
            <span className="text-primary text-sm font-bold uppercase tracking-[0.5em]">
              Beauty, Skincare, Toiletries, Essentials
            </span>
            <h1 className="text-5xl font-light leading-[0.95] tracking-tight text-foreground md:text-7xl">
              Everyday Beauty. <br />
              <span className="font-serif italic text-primary">Trusted Essentials.</span>
            </h1>
            <p className="max-w-xl text-lg font-light leading-relaxed text-foreground/68 md:text-2xl">
              Shop skincare, cosmetics, and daily essentials from trusted brands with fast UK
              dispatch and secure checkout.
            </p>
            <div className="flex flex-col gap-4 pt-4 sm:flex-row sm:flex-wrap sm:gap-5">
              <Link
                href="/c/beauty-skincare"
                className="rounded-full bg-primary px-8 py-4 text-center text-sm font-bold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Shop Beauty
              </Link>
              <Link
                href="/c/beauty-skincare/skin-care"
                className="rounded-full border border-foreground/20 px-8 py-4 text-center text-sm font-bold uppercase tracking-widest text-foreground transition-colors hover:border-primary hover:text-primary"
              >
                Shop Skin Care
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-[linear-gradient(90deg,#e9dec6_0%,#f3ead9_52%,#e7dcc4_100%)]">
        <div className="mx-auto max-w-7xl px-6 py-6 sm:py-7">
          <div className="border-t border-foreground/10 pt-6">
            <div className="grid gap-4 text-sm text-muted-foreground sm:grid-cols-3 sm:gap-6">
              {trustHighlights.map((highlight) => (
                <p
                  key={highlight}
                  className="text-center font-medium tracking-[0.28em] uppercase"
                >
                  {highlight}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
