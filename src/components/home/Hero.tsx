export function Hero() {
  return (
    <section className="relative h-[90vh] flex items-center justify-center text-center overflow-hidden">
      {/* Background with Gradient */}
      <div className="absolute inset-0 z-0 bg-background">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/20 via-background to-background opacity-50 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 space-y-8 animate-fade-in-up">
        <span className="text-primary tracking-[0.5em] text-sm uppercase font-bold">Radiance Redefined</span>
        <h1 className="text-5xl md:text-7xl font-light tracking-tight text-foreground leading-tight">
          Experience the pinnacle of <br />
          <span className="font-serif italic text-primary">skincare innovation.</span>
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground font-light max-w-2xl mx-auto">
          High-performance formulas crafted for a luminous, timeless complexion to reveal your inner glow.
        </p>
        <div className="pt-8 flex justify-center gap-6">
          <button className="px-8 py-4 bg-primary text-primary-foreground text-sm font-bold uppercase tracking-widest hover:bg-primary/90 transition-colors rounded-full">
            Shop Collection
          </button>
          <button className="px-8 py-4 border border-foreground/20 text-foreground text-sm font-bold uppercase tracking-widest hover:border-primary hover:text-primary transition-colors rounded-full">
            Our Story
          </button>
        </div>
      </div>
    </section>
  );
}
