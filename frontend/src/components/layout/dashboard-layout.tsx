"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Fish } from "lucide-react";
import { getToken } from "@/lib/api";
import { Sidebar } from "./sidebar";
import { MobileNav } from "./mobile-nav";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop sidebar */}
      <div className="hidden lg:block lg:shrink-0">
        <div className="fixed inset-y-0 left-0 w-64">
          <Sidebar />
        </div>
      </div>

      {/* Mobile drawer */}
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-50 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Đóng menu"
        />
      )}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-[min(100vw-3rem,16rem)] transition-transform duration-300 lg:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar
          showClose
          onNavigate={() => setSidebarOpen(false)}
          className="shadow-xl"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col lg:ml-64">
        {/* Mobile header */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-gray-200 bg-white px-4 lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
            aria-label="Mở menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Fish className="h-6 w-6 text-blue-600" />
          <span className="truncate font-semibold text-gray-900">
            Chả Cá Lý Sơn
          </span>
        </header>

        <main className="flex-1 overflow-x-hidden p-4 pb-24 md:p-6 lg:p-8 lg:pb-8">
          {children}
        </main>
      </div>

      <MobileNav onOpenMenu={() => setSidebarOpen(true)} />
    </div>
  );
}
