import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {/* Mobile: full width with smaller padding. Desktop: unchanged max-w-[90rem] */}
      <main className="w-full max-w-[90rem] mx-auto px-3 sm:px-8 py-4 sm:py-8">
        <Outlet />
      </main>
    </div>
  );
}