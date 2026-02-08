"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  BarChart3, 
  ShoppingBag, 
  Users, 
  Settings, 
  Package, 
  LogOut,
  LayoutDashboard
} from "lucide-react";

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingBag },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Customers', href: '/admin/customers', icon: Users },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col w-64 border-r border-border bg-card min-h-screen">
      <div className="p-6 flex items-center gap-2 border-b border-border">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="font-bold text-primary-foreground">S</span>
        </div>
        <span className="font-bold text-xl tracking-tight">Savzix Admin</span>
      </div>
      
      <div className="flex-1 py-6 flex flex-col gap-1 px-3">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? "bg-primary text-primary-foreground font-semibold" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? "text-primary-foreground" : "group-hover:text-primary"}`} />
              {item.name}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-border">
        <button className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:text-red-400 hover:bg-red-400/10 w-full rounded-xl transition-all">
            <LogOut className="w-5 h-5" />
            Sign Out
        </button>
      </div>
    </div>
  );
}
