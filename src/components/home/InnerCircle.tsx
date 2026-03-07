export function InnerCircle() {
  return (
    <section className="bg-card border-b border-border py-32 text-center">
      <div className="max-w-4xl mx-auto px-6 space-y-8">
        <h2 className="text-4xl md:text-5xl font-light tracking-tight text-foreground">
          Join the <span className="text-primary italic font-serif">SAVZIX</span> Inner Circle
        </h2>
        <p className="text-lg text-muted-foreground font-light max-w-xl mx-auto">
          Get early access to new arrivals, limited offers, and everyday essentials
          across beauty, fragrance, and wellness.{" "}
          <span className="font-medium text-foreground">
            Enjoy 15% off your first order
          </span>{" "}
          when you subscribe.
        </p>
        
        <form className="max-w-md mx-auto flex flex-col md:flex-row gap-4">
          <input 
            type="email" 
            placeholder="Your Email Address" 
            className="flex-1 px-6 py-4 bg-background border border-border rounded-full focus:outline-none focus:border-primary transition-colors text-sm"
          />
          <button className="px-8 py-4 bg-primary text-primary-foreground font-bold uppercase tracking-widest text-sm rounded-full hover:bg-primary/90 transition-colors">
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
}
