"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/ui/Navbar";
import { ParticipantDashboard } from "@/components/dashboard/ParticipantDashboard";
import { SponsorDashboard } from "@/components/dashboard/SponsorDashboard";
import { RecruiterDashboard } from "@/components/dashboard/RecruiterDashboard";
import { useStore } from "@/store/useStore";
import { normalizeRole, sanitizeUserData } from "@/lib/auth";
import { UserRole } from "@/types";

function DashboardContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { currentUser } = useStore();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Load user from store or localStorage
        if (currentUser) {
            setUser(currentUser);
            setLoading(false);
        } else if (typeof window !== 'undefined') {
            const stored = localStorage.getItem("competex_user_session");
            if (stored) {
                try {
                    const userData = JSON.parse(stored);
                    const sanitizedUser = sanitizeUserData(userData);
                    setUser(sanitizedUser);
                } catch (e) {
                    console.error("Error parsing user:", e);
                    // Clear cookies on error to prevent loops
                    document.cookie = "competex_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                    document.cookie = "competex_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                    router.push("/login");
                }
            } else {
                // No local session but accessed dashboard (likely via middleware redirect due to leftover cookie)
                // Force clear cookies to break the loop
                document.cookie = "competex_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                document.cookie = "competex_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                router.push("/login");
            }
            setLoading(false);
        }
    }, [currentUser, router]);

    useEffect(() => {
        const tabParam = searchParams.get("tab");
        if (tabParam) {
            // Handle tab params if needed
        }
    }, [searchParams]);

    const userRole = user ? normalizeRole(user.role || "Participant") : null;

    useEffect(() => {
        if (userRole === "Organizer") {
            router.push("/organizer/dashboard");
        }
    }, [userRole, router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-white">Loading...</div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-black pt-24 pb-12 px-6">
            <Navbar />

            {userRole === "Participant" && (
                <ParticipantDashboard user={user} setUser={setUser} />
            )}
            {userRole === "Sponsor" && (
                <SponsorDashboard user={user} />
            )}
            {userRole === "Recruiter" && (
                <RecruiterDashboard user={user} />
            )}
        </div>
    );
}

export default function DashboardPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-white">Loading...</div>
            </div>
        }>
            <DashboardContent />
        </Suspense>
    );
}
