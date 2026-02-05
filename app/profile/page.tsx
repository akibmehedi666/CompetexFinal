"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/ui/Navbar";
import { OrganizerPortal } from "@/components/dashboard/OrganizerPortal";
import { ParticipantDashboard } from "@/components/dashboard/ParticipantDashboard";
import { SponsorDashboard } from "@/components/dashboard/SponsorDashboard";
import { RecruiterDashboard } from "@/components/dashboard/RecruiterDashboard";
import { normalizeRole, getDashboardRoute } from "@/lib/auth";

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Load user from local storage
        const stored = localStorage.getItem("competex_user_session");
        if (stored) {
            try {
                const userData = JSON.parse(stored);
                userData.role = normalizeRole(userData.role || "Participant");
                setUser(userData);
            } catch (e) {
                console.error("Error parsing user:", e);
                router.push("/login");
            }
        } else {
            router.push("/login");
        }
        setLoading(false);
    }, [router]);

    useEffect(() => {
        // Redirect to appropriate dashboard based on role
        if (user && !loading) {
            const normalizedRole = normalizeRole(user.role || "Participant");
            router.push(getDashboardRoute(normalizedRole));
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-white">Loading...</div>
            </div>
        );
    }

    if (!user) return null;

    // This page now redirects to role-specific dashboards
    return null;
}
