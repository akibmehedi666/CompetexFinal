"use client";

import { ReactNode } from "react";
import { useStore } from "@/store/useStore";
import { hasPermission } from "@/lib/auth";
import { UserRole } from "@/types";

interface PermissionGateProps {
    requiredRoles: UserRole[];
    fallback?: ReactNode;
    children: ReactNode;
}

/**
 * PermissionGate component for feature-level access control
 * Only    renders children if the current user has one of the required roles
 */
export function PermissionGate({ requiredRoles, fallback = null, children }: PermissionGateProps) {
    const { currentUser } = useStore();

    if (!hasPermission(currentUser?.role || null, requiredRoles)) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}
