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
        <div className="absolute inset-0 z-0 hidden lg:block">
          <Image
            src="/home/premium-catalogue-hero-v2.png"
            alt="Five SAVZIX beauty and personal care products arranged in a premium studio setting"
            fill
            priority
            sizes="(min-width: 1024px) 100vw, 1px"
            className="object-contain object-right brightness-[1.02] contrast-[1.02]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.96)_0%,rgba(255,255,255,0.88)_30%,rgba(255,255,255,0.4)_48%,rgba(255,255,255,0)_60%)]"></div>
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background via-background/35 to-transparent"></div>
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-[1440px] items-center px-6 py-10 sm:py-12 lg:min-h-[28rem] lg:px-10 lg:py-20">
          <div className="max-w-[38rem] space-y-5 text-left lg:space-y-6">
            <span className="text-primary text-xs font-bold uppercase tracking-[0.18em]">
              Beauty, Skincare, Toiletries, Essentials
            </span>
            <h1 className="text-4xl font-bold leading-[1.02] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Trusted essentials, clearly priced.
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-muted-foreground lg:text-lg">
              Shop skincare, cosmetics, and daily essentials from trusted brands with fast UK
              dispatch and secure checkout.
            </p>
            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap sm:gap-5 lg:pt-4">
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

        <div className="relative h-60 w-full sm:h-80 lg:hidden">
          <Image
            src="/home/premium-catalogue-hero-v2.png"
            alt=""
            fill
            priority
            sizes="(max-width: 1023px) 100vw, 1px"
            className="object-cover object-[68%_center] brightness-[1.02] contrast-[1.02] sm:object-contain sm:object-right"
          />
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-background to-transparent" />
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
