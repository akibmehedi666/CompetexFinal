"use client";

import { useState, useEffect } from "react";
import { Plus, Users, Calendar, TrendingUp, LayoutDashboard, Settings, Handshake, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/store/useStore";
import { ENDPOINTS } from "@/lib/api_config";
import { EventCreationWizard } from "@/components/organizer/EventCreationWizard";
import { ParticipantManager } from "@/components/organizer/ParticipantManager";
import { EventAnalytics } from "@/components/organizer/EventAnalytics";
import { SponsorDiscovery } from "@/components/organizer/SponsorDiscovery";

import { OrganizerProfile } from "@/components/organizer/OrganizerProfile";
import { ManageEvent } from "@/components/organizer/ManageEvent";
import { EventRequestsModal } from "@/components/organizer/EventRequestsModal";
import { ScheduleUpdateModal } from "@/components/organizer/ScheduleUpdateModal";

export function OrganizerPortal() {
    const { currentUser } = useStore();
    const [activeTab, setActiveTab] = useState<"overview" | "events" | "participants" | "analytics" | "manage" | "profile" | "sponsors">("overview");
    const [showWizard, setShowWizard] = useState(false);
    const [showRequests, setShowRequests] = useState(false);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [selectedEventId, setSelectedEventId] = useState<string>("");

    if (showWizard) {
        return (
            <EventCreationWizard
                onComplete={() => setShowWizard(false)}
                onCancel={() => setShowWizard(false)}
            />
        );
    }

    const renderContent = () => {
        switch (activeTab) {
            case "overview": return <OverviewTab
                onManage={() => setActiveTab("manage")}
                onAnalytics={() => setActiveTab("analytics")}
                onReviewRequests={(id) => { setSelectedEventId(id); setShowRequests(true); }}
                onUpdateSchedule={() => setShowScheduleModal(true)}
            />;
            case "participants": return <ParticipantManager />;
            case "analytics": return <EventAnalytics />;
            case "manage": return <ManageEvent onEdit={() => setActiveTab("events")} />;
            case "profile": return <OrganizerProfile />;
            case "sponsors": return <SponsorDiscovery />;
            default: return <div className="text-white">Module coming soon...</div>;
        }
    };

    return (
        <div className="min-h-screen">
            <ScheduleUpdateModal
                isOpen={showScheduleModal}
                onClose={() => setShowScheduleModal(false)}
                organizerId={currentUser?.id || ""}
                onSuccess={() => { /* Refresh logic if needed */ }}
            />
            <EventRequestsModal
                isOpen={showRequests}
                onClose={() => setShowRequests(false)}
                eventId={selectedEventId}
                organizerId={currentUser?.id}
            />
            {/* Top Navigation Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Organizer Dashboard</h1>
                    <p className="text-gray-400">Manage your events, track performance, and engage with participants.</p>
                </div>
                <button
                    onClick={() => setShowWizard(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-accent1 text-black rounded-xl font-bold uppercase tracking-wider hover:bg-white transition-all shadow-[0_0_20px_rgba(0,229,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]"
                >
                    <Plus className="w-5 h-5" /> Create Event
                </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 mb-8 border-b border-white/10 overflow-x-auto">
                <TabButton
                    active={activeTab === "overview"}
                    onClick={() => setActiveTab("overview")}
                    icon={LayoutDashboard}
                    label="Overview"
                />
                <TabButton
                    active={activeTab === "participants"}
                    onClick={() => setActiveTab("participants")}
                    icon={Users}
                    label="Participants"
                />
                <TabButton
                    active={activeTab === "analytics"}
                    onClick={() => setActiveTab("analytics")}
                    icon={TrendingUp}
                    label="Analytics"
                />
                <TabButton
                    active={activeTab === "profile"}
                    onClick={() => setActiveTab("profile")}
                    icon={Settings}
                    label="Profile"
                />
                <TabButton
                    active={activeTab === "sponsors"}
                    onClick={() => setActiveTab("sponsors")}
                    icon={Handshake}
                    label="Find Sponsors"
                />
            </div>

            <div className="animate-in fade-in zoom-in-95 duration-300">
                {renderContent()}
            </div>
        </div>
    );
}

function TabButton({ active, onClick, icon: Icon, label, disabled }: any) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={cn(
                "flex items-center gap-2 px-6 py-4 border-b-2 font-bold text-sm transition-all whitespace-nowrap",
                active
                    ? "border-accent1 text-accent1 bg-accent1/5"
                    : "border-transparent text-gray-400 hover:text-white hover:bg-white/5",
                disabled && "opacity-50 cursor-not-allowed hover:bg-transparent hover:text-gray-400"
            )}
        >
            <Icon className="w-4 h-4" />
            {label}
        </button>
    );
}

// ... imports
// ... imports

function OverviewTab({ onAnalytics, onManage, onReviewRequests, onUpdateSchedule }: { onAnalytics: () => void, onManage: () => void, onReviewRequests: (eventId: string) => void, onUpdateSchedule: () => void }) {
    const { currentUser } = useStore();
    const [events, setEvents] = useState<any[]>([]);
    const [sentSponsorshipRequests, setSentSponsorshipRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser) return;
        const fetchData = async () => {
            try {
                // Fetch Events
                const resEvents = await fetch(ENDPOINTS.GET_ORGANIZER_EVENTS(currentUser.id));
                const dataEvents = await resEvents.json();
                if (dataEvents.status === 'success') {
                    setEvents(Array.isArray(dataEvents.data) ? dataEvents.data : []);
                }

                // Fetch Sent Sponsorship Requests (Organizer -> Sponsor)
                const resSponsors = await fetch(ENDPOINTS.GET_ORGANIZER_SENT_SPONSORSHIP_REQUESTS(currentUser.id));
                const dataSponsors = await resSponsors.json();
                if (dataSponsors.status === 'success') {
                    setSentSponsorshipRequests(Array.isArray(dataSponsors.data) ? dataSponsors.data : []);
                }
            } catch (err) {
                console.error(err);
                setEvents([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [currentUser]);

    const pendingEvents = events.filter(e => e.pending_requests > 0);

    return (
        <div className="space-y-6">
            {loading ? (
                <div className="text-gray-500">Loading overview...</div>
            ) : events.length === 0 ? (
                <div className="p-12 border border-dashed border-white/10 rounded-2xl text-center">
                    <h3 className="text-xl font-bold text-white mb-2">No Events Created Yet</h3>
                    <p className="text-gray-400 mb-6">Create your first event to get started.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Active/Latest Event Card (Featured) */}
                    <div className="md:col-span-2">
                        <FeaturedEventCard event={events[0]} />
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 h-fit">
                        <h3 className="font-bold text-white mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                            <QuickActionButton onClick={() => onReviewRequests("all")} icon={Users} label="Review New Applications" badge={pendingEvents.reduce((acc, e) => acc + parseInt(e.pending_requests || 0), 0).toString()} />
                            <QuickActionButton onClick={onUpdateSchedule} icon={Calendar} label="Update Schedule" />
                            <QuickActionButton icon={LayoutDashboard} label="Judge Dashboard" />
                        </div>
                    </div>
                </div>
            )}

            {/* Other Events list (Horizontal Scroll if more than 1) */}
            {events.length > 1 && (
                <div className="space-y-4">
                    <h3 className="font-bold text-white text-lg">Your Event History</h3>
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                        {events.slice(1).map((event) => (
                            <CompactEventCard key={event.id} event={event} />
                        ))}
                    </div>
                </div>
            )}



            {/* Sent Sponsorship Requests Section (Organizer -> Sponsor) */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-400" /> Sent Sponsorship Requests
                </h3>
                {sentSponsorshipRequests.length === 0 ? (
                    <div className="text-gray-500 text-sm">No sponsorship requests sent yet.</div>
                ) : (
                    <div className="space-y-4">
                        {sentSponsorshipRequests.map((req) => (
                            <div key={req.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center font-bold text-white overflow-hidden">
                                        {(req.sponsor_name || "S").toString().charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white">{req.sponsor_name || "Sponsor"}</h4>
                                        <p className="text-sm text-gray-400">
                                            Requested <span className="text-green-400 font-bold">${req.requested_amount}</span> for <span className="text-accent1">{req.event_title}</span>
                                        </p>
                                        {req.message ? (
                                            <p className="text-xs text-gray-500 mt-2">
                                                {req.message.length > 140 ? `${req.message.slice(0, 140)}...` : req.message}
                                            </p>
                                        ) : null}
                                        <p className="text-xs text-gray-500 mt-2">{new Date(req.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={cn(
                                        "px-3 py-1 rounded-full text-xs font-bold uppercase border",
                                        req.status === "accepted"
                                            ? "bg-green-500/10 text-green-400 border-green-500/20"
                                            : req.status === "rejected"
                                                ? "bg-red-500/10 text-red-400 border-red-500/20"
                                                : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                                    )}>
                                        {req.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Pending Requests Section (Requested by User) */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                    <Users className="w-5 h-5 text-accent1" /> Pending Join Requests
                </h3>

                {loading ? (
                    <div className="text-gray-500">Loading events...</div>
                ) : pendingEvents.length === 0 ? (
                    <div className="text-gray-500 text-sm">No pending requests for any event.</div>
                ) : (
                    <div className="space-y-4">
                        {pendingEvents.map(event => (
                            <div key={event.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                                <div>
                                    <h4 className="font-bold text-white">{event.title}</h4>
                                    <p className="text-sm text-gray-400">Starts: {new Date(event.start_date).toLocaleDateString()}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-bold rounded-full border border-yellow-500/30">
                                        {event.pending_requests} Pending
                                    </span>
                                    <button
                                        onClick={() => onReviewRequests(event.id)}
                                        className="px-4 py-2 bg-accent1 text-black text-sm font-bold rounded-lg hover:bg-white transition-colors"
                                    >
                                        Review
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Recent Activity */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="font-bold text-white mb-6">Recent Activity</h3>
                {/* ... existing activity items ... */}
                <div className="space-y-4">
                    <ActivityItem
                        icon={Users}
                        title="New Team Registered"
                        desc="Team 'Neural Net' joined CyberHack 2025"
                        time="2 mins ago"
                    />
                    {/* ... */}
                </div>
            </div>
        </div >
    );
}

function StatBox({ label, value }: { label: string, value: string }) {
    return (
        <div className="bg-black/40 rounded-lg p-3 border border-white/5">
            <div className="text-xl font-bold text-white font-mono">{value}</div>
            <div className="text-[10px] text-gray-500 uppercase">{label}</div>
        </div>
    );
}

function QuickActionButton({ icon: Icon, label, badge, onClick }: any) {
    return (
        <button
            onClick={onClick}
            className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-colors group"
        >
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-black/40 flex items-center justify-center text-gray-400 group-hover:text-white transition-colors">
                    <Icon className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium text-gray-300 group-hover:text-white">{label}</span>
            </div>
            {badge && (
                <span className="px-2 py-0.5 bg-accent1 text-black text-[10px] font-bold rounded-full">
                    {badge}
                </span>
            )}
        </button>
    );
}

function FeaturedEventCard({ event }: { event: any }) {
    return (
        <div className="bg-[#111] border border-white/10 rounded-2xl p-6 relative overflow-hidden group h-full flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent1/5 rounded-full blur-[80px]" />

            {/* Background Image if exists */}
            {event.image && (
                <div className="absolute inset-0 opacity-20">
                    <img src={event.image} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-[#111]/80 to-transparent" />
                </div>
            )}

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <span className={cn(
                            "px-3 py-1 text-xs font-bold uppercase rounded-full border mb-3 inline-block",
                            event.status === 'Live' ? "bg-green-500/10 text-green-400 border-green-500/20" :
                                event.status === 'Upcoming' ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                                    "bg-gray-500/10 text-gray-400 border-gray-500/20"
                        )}>
                            {event.status}
                        </span>
                        <h2 className="text-2xl font-bold text-white mb-1">{event.title}</h2>
                        <p className="text-gray-400 text-sm">{event.date_display || new Date(event.start_date).toLocaleDateString()}</p>
                    </div>
                </div>
            </div>

            <div className="relative z-10 flex gap-4 mt-4">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Users className="w-4 h-4 text-accent1" />
                    <span>{event.pending_requests || 0} Requests</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Users className="w-4 h-4 text-accent2" />
                    <span>{event.registration_type}</span>
                </div>
            </div>
        </div>
    );
}

function CompactEventCard({ event }: { event: any }) {
    return (
        <div className="min-w-[300px] w-[300px] bg-white/5 border border-white/10 p-4 rounded-xl hover:bg-white/10 transition-colors">
            <div className="flex justify-between items-start mb-2">
                <span className={cn(
                    "text-[10px] font-bold uppercase px-2 py-0.5 rounded border",
                    event.status === 'Live' ? "text-green-400 border-green-500/30 bg-green-500/10" : "text-gray-400 border-gray-500/30"
                )}>
                    {event.status}
                </span>
                <span className="text-[10px] text-gray-500">{new Date(event.created_at).toLocaleDateString()}</span>
            </div>
            <h4 className="font-bold text-white mb-1 truncate" title={event.title}>{event.title}</h4>
            <p className="text-xs text-gray-400 mb-3">{event.date_display}</p>

            <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {event.registration_type}</span>
                <span className="flex items-center gap-1"><LayoutDashboard className="w-3 h-3" /> {event.mode}</span>
            </div>
        </div>
    );
}

function ActivityItem({ icon: Icon, title, desc, time, highlight }: any) {
    return (
        <div className="flex gap-4 items-start">
            <div className={cn(
                "w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-1",
                highlight ? "bg-accent1/20 text-accent1" : "bg-white/5 text-gray-400"
            )}>
                <Icon className="w-4 h-4" />
            </div>
            <div>
                <h4 className={cn("text-sm font-bold", highlight ? "text-accent1" : "text-white")}>{title}</h4>
                <p className="text-sm text-gray-400">{desc}</p>
                <div className="text-xs text-gray-600 mt-1">{time}</div>
            </div>
        </div>
    );
}
