"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/ui/Navbar";
import { ENDPOINTS } from "@/lib/api_config";
import { motion } from "framer-motion";
import { Trophy, Calendar, Users, ArrowLeft, Medal, Crown, Search, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { Event } from "@/types";
import { useStore } from "@/store/useStore";
import { EditLeaderboardModal } from "@/components/leaderboard/EditLeaderboardModal";

interface LeaderboardEntry {
    rank: number;
    name: string;
    score: number;
    avatar?: string | null;
    institution?: string | null;
}

export default function EventLeaderboardPage() {
    const params = useParams();
    const router = useRouter();
    const { currentUser, initAuth } = useStore();
    const [event, setEvent] = useState<Event | null>(null);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [canEdit, setCanEdit] = useState(false);
    const [editOpen, setEditOpen] = useState(false);

    const eventId = useMemo(
        () => (Array.isArray(params.eventId) ? params.eventId[0] : params.eventId),
        [params.eventId]
    );

    const filteredLeaderboard = useMemo(() => (
        leaderboard.filter(entry =>
            entry.name.toLowerCase().includes(search.toLowerCase()) ||
            (entry.institution && entry.institution.toLowerCase().includes(search.toLowerCase()))
        )
    ), [leaderboard, search]);

    useEffect(() => {
        initAuth();
    }, [initAuth]);

    const fetchLeaderboard = async (id: string) => {
        const leaderboardRes = await fetch(ENDPOINTS.GET_EVENT_LEADERBOARD(id));
        const leaderboardData = await leaderboardRes.json();
        if (leaderboardData.status === "success" && Array.isArray(leaderboardData.data)) {
            setLeaderboard(leaderboardData.data);
        } else {
            setLeaderboard([]);
        }
    };

    useEffect(() => {
        if (!eventId) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const [eventRes] = await Promise.all([
                    fetch(ENDPOINTS.GET_EVENT(eventId)),
                ]);

                const eventData = await eventRes.json();

                if (eventData.status === "success" && eventData.event) {
                    setEvent(eventData.event);
                } else {
                    setEvent(null);
                }

                await fetchLeaderboard(eventId);
            } catch (error) {
                console.error("Failed to fetch leaderboard data", error);
                setEvent(null);
                setLeaderboard([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [eventId]);

    useEffect(() => {
        const check = async () => {
            if (!eventId || !currentUser?.id) {
                setCanEdit(false);
                return;
            }
            if (currentUser.role !== "Organizer") {
                setCanEdit(false);
                return;
            }

            try {
                const res = await fetch(ENDPOINTS.CHECK_EVENT_OWNERSHIP(eventId, currentUser.id));
                const data = await res.json();
                setCanEdit(Boolean(data?.is_owner));
            } catch (err) {
                console.error(err);
                setCanEdit(false);
            }
        };
        check();
    }, [eventId, currentUser?.id, currentUser?.role]);

    useEffect(() => {
        if (!loading && !event) {
            router.push("/leaderboard");
        }
    }, [loading, event, router]);

    if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>;
    if (!event) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Event not found.</div>;

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1: return <Crown className="w-5 h-5 text-yellow-500 fill-yellow-500 animate-pulse" />;
            case 2: return <Medal className="w-5 h-5 text-gray-300 fill-gray-300" />;
            case 3: return <Medal className="w-5 h-5 text-amber-700 fill-amber-700" />;
            default: return <span className="text-gray-500 font-mono font-bold">#{rank}</span>;
        }
    };

    return (
        <div className="min-h-screen bg-black selection:bg-accent1/30">
            <Navbar />
            <EditLeaderboardModal
                isOpen={editOpen}
                onClose={() => setEditOpen(false)}
                eventId={eventId || ""}
                organizerId={currentUser?.id || ""}
                onSaved={() => { if (eventId) fetchLeaderboard(eventId); }}
            />

            <div className="pt-24 pb-12 max-w-7xl mx-auto px-6">
                {/* Back Button */}
                <button
                    onClick={() => router.push("/leaderboard")}
                    className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 group transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Hubs
                </button>

                {/* Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12 border-b border-white/10 pb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-accent1/10 text-accent1 border border-accent1/20">
                                {event.category}
                            </span>
                            <span className={cn(
                                "text-xs font-bold uppercase tracking-wider",
                                event.status === 'Live' ? "text-green-500" : "text-gray-500"
                            )}>
                                {event.status}
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{event.title}</h1>
                        <div className="flex gap-6 text-gray-400 text-sm">
                            <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-accent2" /> {event.date || new Date(event.startDate).toLocaleDateString()}</span>
                            <span className="flex items-center gap-2"><Users className="w-4 h-4 text-accent2" /> {event.participantsCount.toLocaleString()} Participants</span>
                        </div>
                    </div>

                    <div className="flex w-full md:w-auto gap-3 items-center">
                        <div className="relative w-full md:w-auto">
                            <input
                                type="text"
                                placeholder="Find participant..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full md:w-64 bg-white/5 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-white hover:border-white/20 focus:border-accent1 focus:outline-none transition-all"
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                        </div>
                        {canEdit && (
                            <button
                                onClick={() => setEditOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-accent1/10 hover:bg-accent1/20 text-accent1 border border-accent1/20 rounded-lg text-sm font-bold transition-colors whitespace-nowrap"
                            >
                                <Pencil className="w-4 h-4" /> Edit Leaderboard
                            </button>
                        )}
                    </div>
                </div>

                {/* Leaderboard Table */}
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm">
                    {/* Table Header */}
                    <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/10 bg-black/40 text-xs font-bold uppercase text-gray-500 tracking-wider">
                        <div className="col-span-1 text-center">Rank</div>
                        <div className="col-span-5 md:col-span-4">Participant / Team</div>
                        <div className="hidden md:block col-span-4">Institution</div>
                        <div className="col-span-6 md:col-span-3 text-right">Score</div>
                    </div>

                    {/* Table Body */}
                    {filteredLeaderboard.length > 0 ? (
                        <div className="divide-y divide-white/5">
                            {filteredLeaderboard.map((entry, index) => (
                                <motion.div
                                    key={entry.name}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={cn(
                                        "grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/5 transition-colors group",
                                        entry.rank === 1 ? "bg-gradient-to-r from-yellow-500/10 to-transparent" : "",
                                        entry.rank === 2 ? "bg-gradient-to-r from-gray-300/10 to-transparent" : "",
                                        entry.rank === 3 ? "bg-gradient-to-r from-amber-700/10 to-transparent" : ""
                                    )}
                                >
                                    {/* Rank */}
                                    <div className="col-span-1 flex justify-center">
                                        {getRankIcon(entry.rank)}
                                    </div>

                                    {/* Participant */}
                                    <div className="col-span-5 md:col-span-4 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-black border border-white/10 overflow-hidden flex-shrink-0 flex items-center justify-center text-xs font-bold text-white">
                                            {entry.avatar ? (
                                                <img src={entry.avatar} alt={entry.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span>{entry.name.substring(0, 2).toUpperCase()}</span>
                                            )}
                                        </div>
                                        <span className={cn(
                                            "font-bold truncate",
                                            entry.rank === 1 ? "text-yellow-500" :
                                                entry.rank === 2 ? "text-gray-300" :
                                                    entry.rank === 3 ? "text-amber-600" : "text-white"
                                        )}>
                                            {entry.name}
                                        </span>
                                    </div>

                                    {/* Institution */}
                                    <div className="hidden md:block col-span-4 text-gray-400 text-sm">
                                        {entry.institution || "—"}
                                    </div>

                                    {/* Score */}
                                    <div className="col-span-6 md:col-span-3 text-right font-mono font-bold text-accent1">
                                        {entry.score.toLocaleString()}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-24 text-center">
                            <Trophy className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-500 mb-2">No Results Found</h3>
                            <p className="text-gray-600">Try adjusting your search or check back later.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
