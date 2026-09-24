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
            className="object-cover object-[68%_center] brightness-[1.02] contrast-[1.02]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.96)_0%,rgba(255,255,255,0.88)_30%,rgba(255,255,255,0.48)_52%,rgba(255,255,255,0.06)_76%,rgba(255,255,255,0)_88%)]"></div>
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background via-background/35 to-transparent"></div>
        </div>

        <div className="relative z-10 mx-auto flex min-h-[28rem] w-full max-w-[1440px] items-center px-6 py-16 lg:px-10 lg:py-20">
          <div className="max-w-[38rem] space-y-6 text-left">
            <span className="text-primary text-xs font-bold uppercase tracking-[0.18em]">
              Beauty, Skincare, Toiletries, Essentials
            </span>
            <h1 className="text-4xl font-bold leading-[1.02] tracking-tight text-foreground md:text-6xl">
              Trusted essentials, clearly priced.
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
              Shop skincare, cosmetics, and daily essentials from trusted brands with fast UK
              dispatch and secure checkout.
            </p>
            <div className="flex flex-col gap-4 pt-4 sm:flex-row sm:flex-wrap sm:gap-5">
              <Link
                href="/c/beauty-skincare"
                className="rounded-lg bg-foreground px-6 py-3 text-center text-sm font-bold text-primary-foreground transition-colors hover:bg-[#0b1f33]"
              >
                Shop Beauty
              </Link>
              <Link
                href="/c/beauty-skincare/skin-care"
                className="rounded-lg border border-border bg-white px-6 py-3 text-center text-sm font-bold text-foreground transition-colors hover:border-primary hover:text-primary"
              >
                Shop Skin Care
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-muted">
        <div className="mx-auto max-w-7xl px-6 py-5">
            <div className="grid gap-4 text-sm text-muted-foreground sm:grid-cols-3 sm:gap-6">
              {trustHighlights.map((highlight) => (
                <p
                  key={highlight}
                  className="text-center font-semibold"
                >
                  {highlight}
                </p>
              ))}
            </div>
        </div>
      </section>
    </>
  );
}
