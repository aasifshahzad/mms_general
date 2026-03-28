"use client";

import React, { createContext, useState, useContext, useEffect } from "react";

interface RoleContextType {
  role: string | null;
  setRole: (role: string) => void;
  clearRole: () => void;
  isLoading: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize role from sessionStorage on mount
  useEffect(() => {
    const storedRole = sessionStorage.getItem("userRole");
    if (storedRole) {
      setRole(storedRole);
    }
    setIsLoading(false);
  }, []);

  const setRoleAndStore = (newRole: string) => {
    setRole(newRole);
    sessionStorage.setItem("userRole", newRole);
  };

  const clearRole = () => {
    setRole(null);
    sessionStorage.removeItem("userRole");
  };

  return (
    <RoleContext.Provider
      value={{
        role,
        setRole: setRoleAndStore,
        clearRole,
        isLoading,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
}
