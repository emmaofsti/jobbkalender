"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, LayoutGrid, ListTodo, Users } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import TaskModal from "@/components/TaskModal";
import DataManagement from "@/components/DataManagement";
import { cn } from "@/utils/cn";

const navItems = [
  { href: "/day", label: "Dag", icon: CalendarDays },
  { href: "/tasks", label: "Oppgaver", icon: ListTodo },
  { href: "/week", label: "Uke", icon: LayoutGrid },
  { href: "/customers", label: "Kunder", icon: Users }
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen px-6 py-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-muted">Jobbkalender</div>
            <h1 className="font-display text-3xl text-text">Planlegg uten støy</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <DataManagement />
            <ThemeToggle />
            <nav className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-card px-3 py-2 shadow-soft">
              {navItems.map((item) => {
                const active = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition",
                      active ? "bg-accent/15 text-accent" : "text-muted hover:bg-accent/10"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </header>
        {children}
      </div>
      <TaskModal />
    </div>
  );
}
