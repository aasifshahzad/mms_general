'use client'
import { useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import { Menu } from "lucide-react";

function Layout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="relative">
      {/* Menu button for mobile - Hide only when sidebar is open */}
      {!isSidebarOpen && (
        <button
          className="md:hidden fixed top-4 left-4 z-50 bg-gray-800 text-white p-2 rounded"
          onClick={() => setIsSidebarOpen(true)}
        >
          <Menu className="w-6 h-6" />
        </button>
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-gray-900 text-white shadow-lg transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform z-50`}
      >
        <Sidebar />
        {/* Close button inside the sidebar */}
        <button
          className="md:hidden absolute top-4 right-4 text-white"
          onClick={() => setIsSidebarOpen(false)}
        >
          <p className="text-2xl text-black dark:text-white">✕</p>
        </button>
      </div>

      {/* Main content */}
      <div className="md:ml-64 bg-secondary dark:bg-neutral-950 min-h-screen">
        {children}
      </div>
    </div>
  );
}

export default Layout;
