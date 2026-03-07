import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto max-h-screen">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-background/80 px-8 backdrop-blur-sm">
          <div>
            <h2 className="font-medium text-foreground">Savzix Admin</h2>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Orders and catalog operations
            </p>
          </div>
        </header>
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
