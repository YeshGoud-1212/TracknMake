import { Link, useLocation } from "react-router-dom";
import { Grid3X3, CalendarCheck } from "lucide-react";

const navItems = [
  { to: "/year-view", label: "Year View", icon: Grid3X3 },
  { to: "/timetable", label: "Timetable", icon: CalendarCheck },
];

export default function Navbar() {
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 bg-background/80 backdrop-blur-md border-b border-border">
      <Link to="/" className="flex items-center gap-2">
        <img src="/logo.png" alt="logo" className="w-6 h-6 rounded-sm object-cover" />
        <span className="text-foreground font-semibold text-sm tracking-wide">
          Home<span className="text-primary">.</span>
        </span>
      </Link>

      <div className="flex items-center gap-1">
        {navItems.map((item) => {
          const active = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all duration-200 ${
                active
                  ? "bg-secondary text-foreground border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <item.icon className="w-3.5 h-3.5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
