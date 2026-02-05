"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { OrganizerPortal } from "@/components/dashboard/OrganizerPortal";
import { Navbar } from "@/components/ui/Navbar";
import { normalizeRole } from "@/lib/auth";

export default function OrganizerDashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check authentication and role
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem("competex_user_session");
            if (stored) {
                try {
                    const userData = JSON.parse(stored);
                    const normalizedRole = normalizeRole(userData.role || "Participant");

                    // Redirect if not an organizer
                    if (normalizedRole !== "Organizer") {
                        router.push("/dashboard");
                        return;
                    }

                    setUser(userData);
                } catch (e) {
                    console.error("Error parsing user:", e);
                    router.push("/login");
                }
            } else {
                router.push("/login");
            }
        }
        setLoading(false);
    }, [router]);

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
        <div className="min-h-screen bg-black">
            <Navbar />
            <div className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
                <OrganizerPortal />
            </div>
        </div>
    );
}
