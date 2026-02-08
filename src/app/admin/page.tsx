export default function AdminPage() {
  return (
    <div className="py-20 px-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-foreground uppercase tracking-widest border-b border-border pb-4">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-8 bg-card border border-border rounded-xl">
           <h3 className="text-xl font-bold mb-4 text-primary">Overview</h3>
           <p className="text-muted-foreground text-sm">Create and manage your skincare products, track inventory, and analyze sales performance.</p>
        </div>
        <div className="p-8 bg-card border border-border rounded-xl">
           <h3 className="text-xl font-bold mb-4 text-primary">Orders</h3>
           <p className="text-muted-foreground text-sm">View recent customer orders and update fulfillment status.</p>
        </div>
        <div className="p-8 bg-card border border-border rounded-xl">
           <h3 className="text-xl font-bold mb-4 text-primary">Customers</h3>
           <p className="text-muted-foreground text-sm">Manage customer profiles and loyalty program details.</p>
        </div>
      </div>
    </div>
  );
}
