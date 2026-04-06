import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, FileText, GitBranch, Users, Cpu, User, Menu, X, LogOut, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface TitanNavbarProps {
  userRole?: "entreprise" | "facilitateur" | "admin";
  onLogout?: () => void;
}

const allLinks = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["entreprise", "facilitateur", "admin"] },
  { path: "/besoins", label: "Mes Besoins", icon: FileText, roles: ["entreprise", "admin"] },
  { path: "/pipeline", label: "Pipeline", icon: GitBranch, roles: ["entreprise", "facilitateur", "admin"] },
  { path: "/facilitateur", label: "Hub Facilitateur", icon: Users, roles: ["facilitateur", "admin"] },
  { path: "/ia-prospection", label: "IA Prospection", icon: Cpu, roles: ["entreprise", "admin"] },
  { path: "/admin", label: "Admin", icon: Shield, roles: ["admin"] },
  { path: "/account", label: "Mon Compte", icon: User, roles: ["entreprise", "facilitateur", "admin"] },
];

const TitanNavbar: React.FC<TitanNavbarProps> = ({ userRole = "entreprise", onLogout }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const links = allLinks.filter((l) => l.roles.includes(userRole));

  const NavContent = () => (
    <>
      <div className="p-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <span className="text-accent-foreground font-bold text-sm">W</span>
          </div>
          <span className="text-lg font-bold text-sidebar-foreground">WIINUP</span>
        </Link>
      </div>
      <nav className="flex-1 px-3 space-y-1">
        {links.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
            >
              <link.icon className="h-5 w-5" />
              {link.label}
            </Link>
          );
        })}
      </nav>
      {onLogout && (
        <div className="p-3 border-t border-sidebar-border">
          <button onClick={onLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 w-full transition-colors">
            <LogOut className="h-5 w-5" />
            Déconnexion
          </button>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-60 lg:fixed lg:inset-y-0 bg-sidebar z-40">
        <NavContent />
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-sidebar flex items-center justify-between px-4 z-40">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
            <span className="text-accent-foreground font-bold text-xs">W</span>
          </div>
          <span className="text-base font-bold text-sidebar-foreground">WIINUP</span>
        </Link>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="text-sidebar-foreground">
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-foreground/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-sidebar flex flex-col">
            <NavContent />
          </aside>
        </div>
      )}
    </>
  );
};

export default TitanNavbar;
