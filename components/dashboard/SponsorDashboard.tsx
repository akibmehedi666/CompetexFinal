import { motion } from "framer-motion";
import { DollarSign, Handshake, Users, Plus, TrendingUp, Calendar, Zap, LayoutDashboard, Settings, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { User } from "@/types";
// import { DemographicsChart } from "@/components/dashboard/DemographicsChart"; // Replaced
import { SponsorUpcomingEvents } from "@/components/dashboard/SponsorUpcomingEvents";
import { SponsorProfileEditor } from "@/components/dashboard/SponsorProfileEditor";
import { SponsorshipRequestsManager } from "@/components/dashboard/SponsorshipRequestsManager";
import { SponsorshipRolesManager } from "@/components/dashboard/SponsorshipRolesManager";
import { useState, useEffect } from "react";

interface SponsorDashboardProps {
    user: User;
}

export function SponsorDashboard({ user }: SponsorDashboardProps) {
    const [activeTab, setActiveTab] = useState<"overview" | "roles" | "requests" | "profile">("overview");
    const [profileData, setProfileData] = useState<any>(user);

    useEffect(() => {
        if (user?.id) {
            fetch(`http://localhost/Competex/api/get_profile.php?user_id=${user.id}`)
                .then(res => res.json())
                .then(data => {
                    if (data.status === 'success') {
                        setProfileData(data.user);
                    }
                })
                .catch(err => console.error("Failed to fetch dashboard profile", err));
        }
    }, [user?.id]);

    const displayName = profileData?.company_name || profileData?.university || profileData?.name || "Sponsor";
    const displayBio = profileData?.sponsor_bio || profileData?.bio || "Manage your investments, roles, and track event performance.";

    return (
        <div className="min-h-screen max-w-7xl mx-auto px-6 py-8">
            {/* Top Navigation */}
            <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">{displayName}</h1>
                    <p className="text-gray-400">{displayBio}</p>
                </div>
                {activeTab === "overview" && (
                    <button className="px-6 py-2 bg-yellow-500 text-black font-bold uppercase tracking-wider rounded-lg hover:bg-yellow-400 transition-all shadow-[0_0_15px_rgba(234,179,8,0.3)] flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Create Campaign
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-8 border-b border-white/10 overflow-x-auto">
                <TabButton active={activeTab === "overview"} onClick={() => setActiveTab("overview")} icon={LayoutDashboard} label="Overview" />
                <TabButton active={activeTab === "roles"} onClick={() => setActiveTab("roles")} icon={Shield} label="Sponsorship Roles" />
                <TabButton active={activeTab === "requests"} onClick={() => setActiveTab("requests")} icon={Handshake} label="Requests" />
                <TabButton active={activeTab === "profile"} onClick={() => setActiveTab("profile")} icon={Settings} label="Profile Settings" />
            </div>

            {/* Content Area */}
            <div className="animate-in fade-in zoom-in-95 duration-300">
                {activeTab === "overview" && <OverviewTab />}
                {activeTab === "roles" && <SponsorshipRolesManager />}
                {activeTab === "requests" && <SponsorshipRequestsManager />}
                {activeTab === "profile" && <SponsorProfileEditor user={user} />}
            </div>
        </div>
    );
}

function TabButton({ active, onClick, icon: Icon, label }: any) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex items-center gap-2 px-6 py-4 border-b-2 font-bold text-sm transition-all whitespace-nowrap",
                active
                    ? "border-yellow-500 text-yellow-500 bg-yellow-500/5"
                    : "border-transparent text-gray-400 hover:text-white hover:bg-white/5"
            )}
        >
            <Icon className="w-4 h-4" />
            {label}
        </button>
    );
}

function OverviewTab() {
    return (
        <div className="space-y-8">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard icon={DollarSign} label="Total Invested" value="$124,500" color="text-yellow-400" bg="bg-yellow-500/10" border="border-yellow-500/20" />
                <StatCard icon={Handshake} label="Active Deals" value="12" color="text-blue-400" bg="bg-blue-500/10" border="border-blue-500/20" />
                <StatCard icon={Users} label="Brand Reach" value="450k+" color="text-green-400" bg="bg-green-500/10" border="border-green-500/20" />
                <StatCard icon={TrendingUp} label="Avg. ROI" value="240%" color="text-purple-400" bg="bg-purple-500/10" border="border-purple-500/20" />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column (Charts & Tables) */}
                <div className="lg:col-span-2 space-y-8">
                    <SponsorUpcomingEvents />

                    {/* Active Sponsorships */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Zap className="w-5 h-5 text-yellow-500" /> Active Campaigns
                        </h2>

                        <div className="space-y-4">
                            {[
                                { name: "UIU CSE Fest", amount: "$5,000", status: "Active", reach: "12k", date: "Jan 02, 2026" },
                                { name: "BUET RoboCarnival 2026", amount: "$12,000", status: "Pending", reach: "8k", date: "Jan 04, 2026" },
                                { name: "AI Bangladesh Summit", amount: "$8,500", status: "Active", reach: "25k", date: "Dec 10, 2025" },
                            ].map((deal, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between hover:bg-white/10 transition-colors"
                                >
                                    <div>
                                        <h3 className="font-bold text-white">{deal.name}</h3>
                                        <div className="flex items-center gap-4 text-xs text-gray-400 mt-1">
                                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {deal.date}</span>
                                            <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {deal.reach} Reach</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-bold text-yellow-400">{deal.amount}</div>
                                        <span className={cn(
                                            "text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border",
                                            deal.status === 'Active' ? "text-green-400 border-green-500/30 bg-green-500/10" : "text-orange-400 border-orange-500/30 bg-orange-500/10"
                                        )}>
                                            {deal.status}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recommended Events */}
                <div className="lg:col-span-1 space-y-6">
                    <h2 className="text-xl font-bold text-white">Recommended for You</h2>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
                        <p className="text-sm text-gray-400">Based on your industry focus (Tech, AI), here are upcoming events looking for sponsors.</p>
                        <div className="space-y-3">
                            {["Digital Bangladesh Expo", "UIU CodeSprint", "Dhaka Art Summit"].map((event, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-black/40 rounded-lg border border-white/5">
                                    <span className="text-sm font-medium text-white">{event}</span>
                                    <button className="text-xs font-bold text-yellow-500 hover:text-yellow-400">View</button>
                                </div>
                            ))}
                        </div>
                        <button className="w-full py-2 bg-white/5 hover:bg-white/10 text-gray-300 text-sm rounded-lg transition-colors">
                            Browse All Events
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, color, bg, border }: any) {
    return (
        <div className={cn("p-6 rounded-xl border bg-backdrop-blur-sm", bg, border)}>
            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-3 bg-black/40", color)}>
                <Icon className="w-6 h-6" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">{value}</div>
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</div>
        </div>
    );
}
