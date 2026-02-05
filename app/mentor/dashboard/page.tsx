"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/ui/Navbar";
import { MentorDashboard } from "@/components/dashboard/MentorDashboard";
import { useStore } from "@/store/useStore";
import { normalizeRole } from "@/lib/auth";

function MentorDashboardContent() {
    const router = useRouter();
    const { currentUser } = useStore();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            // Load user from store or localStorage, then refresh from DB via get_profile
            let baseUser: any | null = currentUser ?? null;

            if (!baseUser && typeof window !== "undefined") {
                const stored = localStorage.getItem("competex_user_session");
                if (stored) {
                    try {
                        baseUser = JSON.parse(stored);
                    } catch {
                        router.push("/login");
                        return;
                    }
                }
            }

            if (!baseUser) {
                router.push("/login");
                return;
            }

            const role = normalizeRole(baseUser.role);
            if (role !== "Mentor") {
                router.push("/dashboard");
                return;
            }

            baseUser.role = role;
            if (!cancelled) setUser(baseUser);

            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost/Competex/api";
                const res = await fetch(`${apiUrl}/get_profile.php?user_id=${encodeURIComponent(baseUser.id)}`);
                const data = await res.json();
                if (!cancelled && data?.status === "success" && data.user) {
                    const refreshed = { ...baseUser, ...data.user };
                    refreshed.role = normalizeRole(refreshed.role);
                    setUser(refreshed);
                    if (typeof window !== "undefined") {
                        localStorage.setItem("competex_user_session", JSON.stringify(refreshed));
                    }
                }
            } catch {
                // Keep base user if refresh fails
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        load();
        return () => {
            cancelled = true;
        };
    }, [currentUser, router]);

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
            <MentorDashboard user={user} setUser={setUser} />
        </div>
    );
}

export default function MentorDashboardPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>}>
            <MentorDashboardContent />
        </Suspense>
    );
}
