"use client";
import { useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  Landmark,
  BarChart2,
  Plus,
  Repeat,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AddTransactionSheet } from "@/components/AddTransactionSheet";
import { AddWealthSheet } from "@/components/AddWealthSheet";

const NAV = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/expenses", label: "Expenses", icon: Receipt },
  { href: "/borrow", label: "Borrow", icon: Repeat },
  { href: "/wealth", label: "Wealth", icon: Landmark },
  { href: "/analytics", label: "Stats", icon: BarChart2 },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [showTxSheet, setShowTxSheet] = useState(false);
  const [showWSheet, setShowWSheet] = useState(false);

  function handleFab() {
    if (pathname === "/wealth") setShowWSheet(true);
    else setShowTxSheet(true);
  }

  return (
    <div className="app-frame flex flex-col min-h-dvh max-w-[480px] mx-auto mt-2 mb-3">
      {/* Page content */}
      <main className="content-shell flex-1 overflow-y-auto pb-28">
        {children}
      </main>

      {/* Bottom nav bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-30 max-w-[480px] mx-auto"
        style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: "rgba(241,241,241,0.9)",
            borderTop: "1px solid rgba(255,255,255,0.86)",
            boxShadow: "0 -10px 24px rgba(185,185,185,0.46)",
            backdropFilter: "blur(16px)",
          }}
        />

        <div className="relative flex items-center px-3 pt-4 gap-3">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <button
                key={href}
                onClick={() => router.push(href)}
                className={cn("nav-tab", active && "active")}
              >
                <Icon size={20} strokeWidth={active ? 2 : 1.6} />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* FAB */}
      <button
        onClick={handleFab}
        aria-label="Add"
        className="fab-button fixed bottom-[92px] right-4 z-40 w-14 h-14 rounded-2xl flex items-center justify-center text-white transition-transform active:scale-95 md:right-[calc(50%-216px)]"
        style={{
          background: "linear-gradient(145deg, #ff6971, #ec4651)",
          boxShadow: "7px 7px 16px rgba(196,72,78,0.34), -7px -7px 16px rgba(255,255,255,0.92)",
          color: "#ffffff",
        }}
      >
        <Plus size={24} strokeWidth={2.5} />
      </button>

      <AddTransactionSheet
        open={showTxSheet}
        onClose={() => setShowTxSheet(false)}
      />
      <AddWealthSheet open={showWSheet} onClose={() => setShowWSheet(false)} />
    </div>
  );
}
