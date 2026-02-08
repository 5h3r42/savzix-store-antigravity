export default async function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="py-32 px-6 text-center">
      <h1 className="text-4xl font-light mb-4 text-foreground">Product Detail: <span className="text-primary italic font-serif">{id}</span></h1>
      <p className="text-muted-foreground max-w-lg mx-auto">Luxury formulation details, ingredients, and usage instructions coming soon.</p>
    </div>
  );
}
