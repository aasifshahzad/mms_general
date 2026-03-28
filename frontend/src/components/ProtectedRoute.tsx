"use client";

import { useRole } from "@/context/RoleContext";
import { canAccessRoute } from "@/utils/rolePermissions";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * ProtectedRoute component that checks if user has access to current route
 * If unauthorized, redirects to /unauthorized (403 page)
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { role, isLoading } = useRole();
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    // Allow access to non-dashboard routes without role check
    if (!pathname.startsWith("/dashboard")) {
      setIsAuthorized(true);
      return;
    }

    // Check if user has access to this route
    const hasAccess = canAccessRoute(role, pathname);

    if (!hasAccess) {
      // Redirect to unauthorized page
      router.push("/unauthorized");
      return;
    }

    setIsAuthorized(true);
  }, [pathname, role, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null; // Will redirect, so return nothing
  }

  return <>{children}</>;
}
