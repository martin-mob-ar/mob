"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Building2,
  FileText,
  Wallet,
  HelpCircle,
  LogOut,
  Bell,
  Users
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const menuItems = [
  { label: "Resumen", icon: BarChart3, path: "/gestion-inmobiliaria" },
  { label: "Mis propiedades", icon: Building2, path: "/gestion-inmobiliaria/propiedades" },
  { label: "Interesados", icon: Users, path: "/gestion-inmobiliaria/interesados", badge: 6 },
  { label: "Mis contratos", icon: FileText, path: "/gestion-inmobiliaria/contratos" },
  { label: "Balance", icon: Wallet, path: "/gestion-inmobiliaria/balance" },
  { label: "Tickets / Soporte", icon: HelpCircle, path: "/gestion-inmobiliaria/tickets", badge: 1 },
];

const InmobiliariaPanelLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isActive = (path: string) => {
    if (path === "/gestion-inmobiliaria") {
      return pathname === "/gestion-inmobiliaria";
    }
    return pathname.startsWith(path);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-secondary/30 flex">
      {/* Sidebar */}
      <aside className="w-72 bg-card border-r border-border flex flex-col fixed h-screen">
        {/* Logo */}
        <div className="h-16 px-6 flex items-center border-b border-border">
          <Link href="/">
            <img src="/assets/mob-logo-new.png" alt="MOB" className="h-7" />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                isActive(item.path)
                  ? "bg-accent text-primary border-l-4 border-primary ml-0 pl-3"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
            <div className="h-11 w-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
              {getInitials(user?.name || "RI")}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{user?.name || "RE/MAX Argentina"}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Inmobiliaria</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-3 py-2 mt-3 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-colors w-full"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-72">
        {/* Top bar */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-end px-8 sticky top-0 z-10">
          <button className="p-2 rounded-full hover:bg-secondary transition-colors relative">
            <Bell className="h-5 w-5 text-muted-foreground" />
          </button>
        </header>

        {/* Page content */}
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default InmobiliariaPanelLayout;
