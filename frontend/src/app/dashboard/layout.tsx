"use client";
import Sidebar from "@/components/dashboard/Sidebar";
import React, { useState } from "react";
import { Menu } from "lucide-react";
import { Header } from "@/components/dashboard/Header";

function layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-secondary dark:bg-neutral-950 overflow-hidden">
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-neutral-900 shadow-md z-50">
        <button onClick={() => setSidebarOpen(true)}>
          <Menu className="w-6 h-6 text-gray-700 dark:text-gray-200" />
        </button>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          Dashboard
        </h2>
      </div>

      {/* Sidebar */}
      <div className="md:w-64">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <main className="flex-1 p-4 md:ml-0">{children}</main>
    </div>
  );
}

export default layout;
