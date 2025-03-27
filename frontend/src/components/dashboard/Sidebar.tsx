"use client";

import React, { useState } from "react";
import { GoDotFill } from "react-icons/go";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  GraduationCap,
  Hand,
  LayoutDashboard,
  Moon,
  Sun,
  UserCog2,
  LogOut,
} from "lucide-react";

type MenuItem = {
  id: number;
  name: string;
  icon: React.ElementType;
  path: string;
  hasSubmenu?: boolean;
  submenu?: {
    id: number;
    name: string;
    path: string;
    icon: React.ElementType;
  }[];
};

const menuList: MenuItem[] = [
  {
    id: 1,
    name: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
  },
  {
    id: 2,
    name: "Student",
    icon: GraduationCap,
    path: "/dashboard/students",
  },
  {
    id: 3,
    name: "Attendance",
    icon: Hand,
    path: "/dashboard/attendance",
    hasSubmenu: true,
    submenu: [
      {
        id: 8,
        name: "Mark Attendance",
        icon: GoDotFill,
        path: "/dashboard/attendance/mark_attendance",
      },
      {
        id: 9,
        name: "View Attendance",
        icon: GoDotFill,
        path: "/dashboard/attendance/view_attendance",
      },
    ],
  },
  {
    id: 4,
    name: "Setup",
    icon: UserCog2,
    path: "/dashboard/settings",
    hasSubmenu: true,
    submenu: [
      {
        id: 5,
        name: "Class Name",
        icon: GoDotFill,
        path: "/dashboard/setup/class_name",
      },
      {
        id: 6,
        name: "Class Timings",
        icon: GoDotFill,
        path: "/dashboard/setup/class_timings",
      },
      {
        id: 7,
        name: "Teacher",
        icon: GoDotFill,
        path: "/dashboard/setup/teacher",
      },
    ],
  },
  {
    id: 5,
    name: "Logout",
    icon: LogOut,
    path: "/login",
  },
];

const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [openSubmenu, setOpenSubmenu] = useState<number | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const toggleSubmenu = (id: number) =>
    setOpenSubmenu(openSubmenu === id ? null : id);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    localStorage.removeItem('username');
    router.push('/login');
  };

  return (
    <div className="w-64 h-screen bg-white dark:bg-neutral-950 border-r border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
        <Image
          src="/logo.svg"
          alt="Logo"
          width={180}
          height={50}
          className="dark:invert"
        />
      </div>

      <div className="p-4">
        <div className="flex items-center space-x-4 mb-6">
          <Image
            src="/image.png"
            alt="User"
            width={40}
            height={40}
            className="rounded-full"
          />
          <div>
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              User
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              sample@gmail.com
            </p>
          </div>
        </div>

        <nav>
          {menuList.map((item) => (
            <div key={item.id}>
              {item.hasSubmenu ? (
                <button
                  onClick={() => toggleSubmenu(item.id)}
                  className={`w-full flex items-center justify-between p-2 rounded-lg mb-1 ${
                    pathname.startsWith(item.path)
                      ? "bg-primary text-primary-foreground"
                      : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800"
                  }`}
                >
                  <div className="flex items-center">
                    <item.icon className="w-5 h-5 mr-3" />
                    <span>{item.name}</span>
                  </div>
                </button>
              ) : item.name === "Logout" ? (
                <button
                  onClick={handleLogout}
                  className={`flex items-center p-2 rounded-lg mb-1 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  <span>{item.name}</span>
                </button>
              ) : (
                <Link
                  href={item.path}
                  className={`flex items-center p-2 rounded-lg mb-1 ${
                    pathname === item.path
                      ? "bg-primary text-primary-foreground"
                      : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800"
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  <span>{item.name}</span>
                </Link>
              )}
              {item.hasSubmenu && openSubmenu === item.id && (
                <div className="ml-6 mt-1 space-y-1">
                  {item.submenu?.map((subItem) => (
                    <Link
                      key={subItem.id}
                      href={subItem.path}
                      className={`flex p-2 rounded-lg ${
                        pathname === subItem.path
                          ? "bg-primary text-primary-foreground dark:hover:bg-neutral-800"
                          : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800"
                      }`}
                    >
                      <subItem.icon className="w-4 h-4 mt-0.5 mr-2" />
                      {subItem.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>

      <div className="absolute bottom-4 left-4">
        <button
          onClick={() => {
            setIsDarkMode(!isDarkMode);
            document.documentElement.classList.toggle("dark");
          }}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
        >
          {isDarkMode ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
