"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { User } from "@/types";
import { Users, Calendar, Settings, Clock, CheckCircle, BarChart } from "lucide-react";
import { MentorshipRequests } from "@/components/dashboard/mentor/MentorshipRequests";
import { SessionManager } from "@/components/dashboard/mentor/SessionManager";
import { MentorProfileEditor } from "@/components/dashboard/mentor/MentorProfileEditor";
import { useSearchParams } from "next/navigation";

interface MentorDashboardProps {
    user: User;
    setUser: (user: User) => void;
}

export function MentorDashboard({ user, setUser }: MentorDashboardProps) {
    const searchParams = useSearchParams();
    const defaultTab = searchParams.get("tab") as "requests" | "sessions" | "settings" | "overview" || "overview";
    const [activeTab, setActiveTab] = useState(defaultTab);

    const displayName = user.mentor_name || user.name || "Mentor";
    const displaySubtitle = user.mentor_position && user.mentor_company
        ? `${user.mentor_position} at ${user.mentor_company}`
        : "Mentor at CompeteX";

    return (
        <div className="max-w-7xl mx-auto py-8 px-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">{displayName}</h1>
                    <p className="text-gray-400">{displaySubtitle} • Guide & inspire the next generation.</p>
                </div>
                {activeTab === "overview" && (
                    <div className="flex gap-3">
                        <button className="px-6 py-2 bg-accent1 text-black font-bold uppercase tracking-wider rounded-lg hover:bg-white transition-all shadow-[0_0_15px_rgba(0,229,255,0.3)] flex items-center gap-2">
                            <Calendar className="w-4 h-4" /> Schedule Session
                        </button>
                    </div>
                )}
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2 border-b border-white/10">
                {[
                    { id: "overview", label: "Overview", icon: BarChart },
                    { id: "requests", label: "Requests", icon: Users },
                    { id: "sessions", label: "Sessions", icon: Calendar },
                    { id: "settings", label: "Profile & Settings", icon: Settings }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={cn(
                            "flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-sm uppercase tracking-wider transition-all whitespace-nowrap",
                            activeTab === tab.id
                                ? "bg-accent1 text-black shadow-[0_0_15px_rgba(0,229,255,0.3)]"
                                : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                        )}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="min-h-[500px]">
                {activeTab === "overview" && (
                    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
                        {/* Stats Grid - Moved here */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <StatCard icon={Users} label="Active Mentees" value="12" color="text-accent1" />
                            <StatCard icon={Clock} label="Pending Requests" value="5" color="text-yellow-500" />
                            <StatCard icon={CheckCircle} label="Completed Sessions" value="48" color="text-green-500" />
                            <StatCard icon={BarChart} label="Total Earnings" value="$2,400" color="text-purple-500" />
                        </div>

                        <div className="text-center py-20 bg-white/5 rounded-xl border border-white/10">
                            <BarChart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">Activity Analytics</h3>
                            <p className="text-gray-400">Detailed mentorship insights coming soon.</p>
                        </div>
                    </div>
                )}

                {activeTab === "requests" && <MentorshipRequests />}

                {activeTab === "sessions" && <SessionManager />}

                {activeTab === "settings" && (
                    <MentorProfileEditor user={user} setUser={setUser} />
                )}
            </div>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any, label: string, value: string, color: string }) {
    return (
        <div className="bg-white/5 border border-white/10 p-6 rounded-xl flex items-center justify-between hover:border-white/20 transition-all">
            <div>
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">{label}</p>
                <h3 className="text-3xl font-bold text-white font-mono">{value}</h3>
            </div>
            <div className={`p-3 bg-white/5 rounded-lg ${color}`}>
                <Icon className="w-6 h-6" />
            </div>
        </div>
    );
}
