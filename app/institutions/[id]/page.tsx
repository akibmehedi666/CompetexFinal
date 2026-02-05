"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, ShieldCheck, ArrowLeft, Calendar, Users, ExternalLink, Trophy, Star } from "lucide-react";
import { toast } from "sonner";

import { Navbar } from "@/components/ui/Navbar";
import { ENDPOINTS } from "@/lib/api_config";
import { cn } from "@/lib/utils";
import { CountdownTimer } from "@/components/ui/CountdownTimer";
import { Event } from "@/types";

export default function InstitutionProfilePage() {
    const params = useParams();
    const router = useRouter();
    const institutionId = useMemo(() => String((params as any)?.id || ""), [params]);

    const [institution, setInstitution] = useState<any>(null);
    const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
    const [archiveEvents, setArchiveEvents] = useState<Event[]>([]);
    const [activeTab, setActiveTab] = useState<"upcoming" | "archive">("upcoming");
    const [loading, setLoading] = useState(true);
    const [reviewsByEventId, setReviewsByEventId] = useState<Record<string, any[]>>({});
    const [loadingReviews, setLoadingReviews] = useState(false);

    useEffect(() => {
        const load = async () => {
            if (!institutionId) return;
            setLoading(true);
            try {
                const res = await fetch(ENDPOINTS.GET_INSTITUTION(institutionId));
                const data = await res.json();
                if (data?.status === "success") {
                    setInstitution(data.institution);
                    setUpcomingEvents(Array.isArray(data.upcoming_events) ? data.upcoming_events : []);
                    setArchiveEvents(Array.isArray(data.archive_events) ? data.archive_events : []);
                } else {
                    router.push("/institutions");
                }
            } catch (e) {
                console.error(e);
                toast.error("Failed to load institution");
                router.push("/institutions");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [institutionId, router]);

    useEffect(() => {
        const loadReviews = async () => {
            if (!institutionId || activeTab !== "archive") return;
            setLoadingReviews(true);
            try {
                const res = await fetch(ENDPOINTS.GET_INSTITUTION_EVENT_REVIEWS(institutionId));
                const data = await res.json();
                const rows = data?.status === "success" && Array.isArray(data.data) ? data.data : [];
                const map: Record<string, any[]> = {};
                rows.forEach((r: any) => {
                    const eventId = String(r.event_id || "");
                    if (!eventId) return;
                    if (!map[eventId]) map[eventId] = [];
                    map[eventId].push(r);
                });
                setReviewsByEventId(map);
            } catch (e) {
                console.error(e);
                setReviewsByEventId({});
            } finally {
                setLoadingReviews(false);
            }
        };
        loadReviews();
    }, [institutionId, activeTab]);

    const displayedEvents = activeTab === "upcoming" ? upcomingEvents : archiveEvents;

    if (loading) {
        return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>;
    }
    if (!institution) return null;

    return (
        <div className="min-h-screen bg-black selection:bg-accent1/30">
            <Navbar />

            <div className="relative pt-32 pb-12 overflow-hidden border-b border-white/10">
                <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] opacity-20 blur-[100px] pointer-events-none rounded-full"
                    style={{ backgroundColor: "#00E5FF" }}
                />

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <button
                        onClick={() => router.push("/institutions")}
                        className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 group transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Directory
                    </button>

                    <div className="flex flex-col md:flex-row items-start gap-8">
                        <div className="w-32 h-32 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                            <span className="text-5xl font-black text-white">
                                {String(institution.name || "I").slice(0, 1).toUpperCase()}
                            </span>
                        </div>

                        <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-3 mb-4">
                                <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">{institution.name}</h1>
                                {institution.is_institution && (
                                    <div className="flex items-center gap-1 px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-bold rounded-full">
                                        <ShieldCheck className="w-4 h-4" /> Verified Institution
                                    </div>
                                )}
                            </div>

                            <p className="text-xl text-gray-300 mb-6 max-w-3xl leading-relaxed">
                                {institution.website ? (
                                    <>
                                        Website:{" "}
                                        <a href={institution.website} target="_blank" rel="noreferrer" className="text-accent2 underline">
                                            {institution.website}
                                        </a>
                                    </>
                                ) : (
                                    "Hosted competitive events on CompeteX."
                                )}
                            </p>

                            <div className="flex flex-wrap gap-8 text-gray-400">
                                <span className="flex items-center gap-2"><MapPin className="w-5 h-5 text-accent2" /> {institution.location || "—"}</span>
                                <span className="flex items-center gap-2"><Trophy className="w-5 h-5 text-accent2" /> {institution.total_events ?? 0} total events</span>
                                <span className="flex items-center gap-2"><Users className="w-5 h-5 text-accent2" /> {institution.upcoming_events ?? 0} upcoming</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
                <div className="flex items-center gap-8 border-b border-white/10">
                    <button
                        onClick={() => setActiveTab("upcoming")}
                        className={cn(
                            "pb-4 text-sm font-bold uppercase tracking-widest transition-all relative",
                            activeTab === "upcoming" ? "text-white" : "text-gray-500 hover:text-gray-300"
                        )}
                    >
                        Upcoming Events
                        {activeTab === "upcoming" && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent2" />}
                    </button>
                    <button
                        onClick={() => setActiveTab("archive")}
                        className={cn(
                            "pb-4 text-sm font-bold uppercase tracking-widest transition-all relative",
                            activeTab === "archive" ? "text-white" : "text-gray-500 hover:text-gray-300"
                        )}
                    >
                        Event Archive
                        {activeTab === "archive" && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent2" />}
                    </button>
                </div>

                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    <AnimatePresence mode="popLayout">
                        {displayedEvents.map((event) => (
                            <div key={event.id} className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all flex flex-col">
                                <div className="h-48 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10" />
                                    {event.image ? (
                                        <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-white/10 via-black to-black" />
                                    )}
                                    <div className="absolute top-4 right-4 z-20">
                                        <span className={cn(
                                            "px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full backdrop-blur-md border",
                                            event.status === "Live"
                                                ? "bg-green-500/20 text-green-400 border-green-500/30"
                                                : "bg-black/50 text-white border-white/10"
                                        )}>
                                            {event.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="text-xs font-bold text-accent2 uppercase tracking-widest mb-2">{event.category}</div>
                                    <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
                                    <div className="flex items-center gap-4 text-gray-400 text-sm mb-6">
                                        <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {event.date || (event.startDate ? new Date(event.startDate).toLocaleDateString() : "—")}</span>
                                    </div>

                                    <div className="mt-auto pt-6 border-t border-white/5">
                                        {activeTab === "upcoming" ? (
                                            <div className="flex items-center justify-between">
                                                <div className="text-xs text-gray-400">Starts in:</div>
                                                {event.startDate ? <CountdownTimer targetDate={event.startDate} status={event.status} size="sm" /> : <span className="text-xs text-gray-500">—</span>}
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between text-sm text-gray-300">
                                                    <span className="inline-flex items-center gap-2">
                                                        <Star className="w-4 h-4 text-yellow-400" />
                                                        {(event as any).avg_rating ? Number((event as any).avg_rating).toFixed(1) : "0.0"}
                                                    </span>
                                                    <span className="text-xs text-gray-500">{(event as any).rating_count ?? 0} reviews</span>
                                                </div>

                                                {(reviewsByEventId[event.id] || []).slice(0, 2).map((r: any) => (
                                                    <div key={r.review_id} className="bg-black/30 border border-white/10 rounded-xl p-3">
                                                        <div className="flex items-center justify-between gap-3">
                                                            <div className="flex items-center gap-2 min-w-0">
                                                                <img
                                                                    src={r.user_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(r.user_id || "u")}`}
                                                                    alt={r.user_name || "User"}
                                                                    className="w-7 h-7 rounded-full border border-white/10 bg-black/40"
                                                                />
                                                                <span className="text-sm font-bold text-white truncate">{r.user_name || "User"}</span>
                                                            </div>
                                                            <span className="text-xs text-yellow-300">{r.rating}★</span>
                                                        </div>
                                                        {r.review && (
                                                            <div className="text-xs text-gray-300 mt-2 line-clamp-3 whitespace-pre-wrap">{r.review}</div>
                                                        )}
                                                    </div>
                                                ))}

                                                {loadingReviews && (
                                                    <div className="text-xs text-gray-500">Loading reviews...</div>
                                                )}

                                                <Link
                                                    href={`/leaderboard/${event.id}`}
                                                    className="w-full flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 rounded-lg text-white text-sm font-bold uppercase tracking-wider transition-all"
                                                >
                                                    View Results <ExternalLink className="w-4 h-4" />
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </AnimatePresence>

                    {displayedEvents.length === 0 && (
                        <div className="col-span-full py-12 text-center text-gray-500 border border-dashed border-white/10 rounded-2xl">
                            No events found in {activeTab}.
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
