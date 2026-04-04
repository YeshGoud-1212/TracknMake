import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-[90rem] mx-auto px-20 py-2">
        <Outlet />
      </main>
    </div>
  );
}
