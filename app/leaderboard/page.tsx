"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/ui/Navbar";
import { ENDPOINTS } from "@/lib/api_config";
import { motion } from "framer-motion";
import { Search, Trophy, Calendar, Users, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Event } from "@/types";

export default function LeaderboardPage() {
    const [search, setSearch] = useState("");
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await fetch(ENDPOINTS.GET_ALL_EVENTS);
                const data = await res.json();
                setEvents(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Failed to fetch events", error);
                setEvents([]);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    const filteredEvents = events.filter(e =>
        e.title.toLowerCase().includes(search.toLowerCase()) ||
        e.category.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-black selection:bg-accent1/30">
            <Navbar />

            <div className="pt-24 pb-12 max-w-7xl mx-auto px-6">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                        Competition <span className="text-accent2">Hubs</span>
                    </h1>
                    <p className="text-gray-400 mb-8">
                        Track performance, view global rankings, and scout top talent across all active and past events.
                    </p>

                    {/* Search Bar */}
                    <div className="relative group">
                        <div className="absolute inset-0 bg-accent1/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search by event name or category..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-black/80 border border-white/10 rounded-full py-4 pl-12 pr-6 text-white text-lg focus:border-accent1 focus:outline-none transition-colors"
                            />
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Event Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredEvents.map((event, index) => (
                        <motion.div
                            key={event.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="group relative bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-accent1/50 transition-all hover:bg-white/10"
                        >
                            {/* Image Header */}
                            <div className="h-48 relative overflow-hidden">
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10" />
                                {event.image ? (
                                    <img
                                        src={event.image}
                                        alt={event.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-white/10 via-black to-black" />
                                )}
                                <div className="absolute top-4 right-4 z-20">
                                    <span className={cn(
                                        "px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full backdrop-blur-md flex items-center gap-1",
                                        event.status === "Live"
                                            ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                            : "bg-black/50 text-white border border-white/10"
                                    )}>
                                        {event.status === "Live" && (
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                        )}
                                        {event.status}
                                    </span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <div className="text-xs font-bold text-accent1 uppercase tracking-widest mb-2">{event.category}</div>
                                <h3 className="text-xl font-bold text-white mb-4 group-hover:text-accent2 transition-colors">{event.title}</h3>

                                <div className="flex items-center gap-4 text-gray-400 text-xs font-medium mb-6">
                                    <span className="flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5" /> {event.date || new Date(event.startDate).toLocaleDateString()}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Users className="w-3.5 h-3.5" /> {event.participantsCount.toLocaleString()}
                                    </span>
                                </div>

                                <Link
                                    href={`/leaderboard/${event.id}`}
                                    className="w-full flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 text-gray-300 hover:bg-accent1 hover:text-black hover:border-accent1 transition-all group/btn"
                                >
                                    <span className="font-bold uppercase text-xs tracking-wider">View Standings</span>
                                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {!loading && filteredEvents.length === 0 && (
                    <div className="text-center py-24 text-gray-500">
                        <Trophy className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>No events found matching your search.</p>
                    </div>
                )}
                {loading && (
                    <div className="text-center py-24 text-gray-500">
                        <Trophy className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>Loading events...</p>
                    </div>
                )}
            </div>
        </div>
    );
}
