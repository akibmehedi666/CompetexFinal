"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, MapPin, Users, Handshake, Loader2, ArrowRight } from "lucide-react";
import { API_BASE_URL } from "@/lib/api_config";
import { SponsorshipRequestModal } from "@/components/dashboard/SponsorshipRequestModal";

export function SponsorUpcomingEvents() {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/get_upcoming_events_for_sponsors.php`);
                const data = await res.json();
                if (data.status === 'success') {
                    setEvents(data.data);
                }
            } catch (err) {
                console.error("Error fetching events:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    const handleSponsorClick = (event: any) => {
        setSelectedEvent(event);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-accent1" /> Upcoming Events
                </h2>
                <button className="text-xs text-gray-400 hover:text-white flex items-center gap-1 transition-colors">
                    View All <ArrowRight className="w-3 h-3" />
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
                </div>
            ) : events.length === 0 ? (
                <div className="p-8 border border-dashed border-white/10 rounded-xl text-center text-gray-500">
                    No upcoming events found.
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {events.map((event, i) => (
                        <motion.div
                            key={event.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-all group"
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-wide">
                                            Upcoming
                                        </span>
                                        <span className="text-xs text-gray-400 flex items-center gap-1">
                                            <Calendar className="w-3 h-3" /> {event.date_display || new Date(event.start_date).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-bold text-white group-hover:text-accent1 transition-colors">
                                        {event.title}
                                    </h3>

                                    <div className="flex flex-wrap gap-4 text-xs text-gray-400">
                                        <span className="flex items-center gap-1">
                                            <Users className="w-3 h-3" /> {event.participants_count} Participants
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <MapPin className="w-3 h-3" /> {event.venue || "Online"}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            By <span className="text-gray-300">{event.organizer_name}</span>
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleSponsorClick(event)}
                                    className="px-5 py-2.5 bg-yellow-500 text-black font-bold text-sm rounded-lg hover:bg-yellow-400 transition-shadow shadow-[0_0_15px_rgba(234,179,8,0.2)] flex items-center gap-2 whitespace-nowrap"
                                >
                                    <Handshake className="w-4 h-4" /> Sponsor This Event
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            <SponsorshipRequestModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                event={selectedEvent}
            />
        </div>
    );
}
