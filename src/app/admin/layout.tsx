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
          <header className="h-16 border-b border-border flex items-center justify-between px-8 bg-background/50 backdrop-blur-sm sticky top-0 z-10">
            <h2 className="font-medium text-muted-foreground">Dashboard Overview</h2>
             <div className="flex items-center gap-4">
                 <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-orange-500"></div>
                 <span className="text-sm font-medium">Admin User</span>
             </div>
          </header>
          <div className="p-8">
            {children}
          </div>
      </main>
    </div>
  );
}
