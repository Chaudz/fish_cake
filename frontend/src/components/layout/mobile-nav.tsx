"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { navItems } from "./sidebar";

interface MobileNavProps {
  onOpenMenu: () => void;
}

export function MobileNav({ onOpenMenu }: MobileNavProps) {
  const pathname = usePathname();
  const bottomItems = navItems.filter((item) => item.mobileNav);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white pb-safe lg:hidden">
      <div className="grid grid-cols-5">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-1 py-2.5 text-[10px] font-medium",
                active ? "text-blue-600" : "text-gray-500",
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="truncate">{item.label.split(" ")[0]}</span>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={onOpenMenu}
          className="flex flex-col items-center gap-1 px-1 py-2.5 text-[10px] font-medium text-gray-500"
        >
          <Menu className="h-5 w-5" />
          <span>Thêm</span>
        </button>
      </div>
    </nav>
  );
}
