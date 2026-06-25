"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Package,
  Warehouse,
  ShoppingCart,
  CreditCard,
  Truck,
  BarChart3,
  LogOut,
  Fish,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { removeToken } from "@/lib/api";

export const navItems: {
  href: string;
  label: string;
  icon: LucideIcon;
  mobileNav?: boolean;
}[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    mobileNav: true,
  },
  { href: "/orders", label: "Đơn hàng", icon: ShoppingCart, mobileNav: true },
  { href: "/customers", label: "Khách hàng", icon: Users, mobileNav: true },
  { href: "/debts", label: "Công nợ", icon: CreditCard, mobileNav: true },
  { href: "/purchases", label: "Nhập hàng", icon: Package },
  { href: "/inventory", label: "Tồn kho", icon: Warehouse },
  { href: "/shippers", label: "Ship", icon: Truck },
  { href: "/statistics", label: "Thống kê", icon: BarChart3 },
];

interface SidebarProps {
  onNavigate?: () => void;
  showClose?: boolean;
  className?: string;
}

export function Sidebar({ onNavigate, showClose, className }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    removeToken();
    router.push("/login");
  };

  const handleNav = () => {
    onNavigate?.();
  };

  return (
    <aside
      className={cn(
        "flex h-full w-64 flex-col border-r border-gray-200 bg-white",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-gray-200 p-4 lg:p-6">
        <div className="flex items-center gap-2">
          <Fish className="h-8 w-8 shrink-0 text-blue-600" />
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold text-gray-900">
              Chả Cá Lý Sơn
            </h1>
            <p className="text-xs text-gray-500">Quản lý bán hàng</p>
          </div>
        </div>
        {showClose && (
          <button
            type="button"
            onClick={onNavigate}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
            aria-label="Đóng menu"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3 lg:p-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleNav}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors lg:py-2.5",
                active
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-200 p-3 lg:p-4">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 lg:py-2.5"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
