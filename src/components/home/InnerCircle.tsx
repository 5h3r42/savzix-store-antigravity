export function InnerCircle() {
  return (
    <section className="border-b border-border bg-white">
      <div className="mx-auto grid max-w-7xl md:grid-cols-3">
        {[['Free delivery over £50', 'Across the UK'], ['Easy returns', 'Clear support when you need it'], ['Trusted brands', 'Everyday essentials, well chosen']].map(([title, copy]) => (
          <div key={title} className="border-b border-border px-6 py-8 text-center last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0">
            <strong className="block text-base text-foreground">{title}</strong>
            <span className="mt-1 block text-sm text-muted-foreground">{copy}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
