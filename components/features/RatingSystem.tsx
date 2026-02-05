"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Send, Search, Trophy, Calendar, MapPin } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { ENDPOINTS } from "@/lib/api_config";
import { useStore } from "@/store/useStore";

type ReviewableEvent = {
    id: string;
    title: string;
    category?: string | null;
    mode?: string | null;
    status?: string | null;
    date?: string | null;
    startDate?: string | null;
    venue?: string | null;
    avg_rating: number;
    rating_count: number;
    has_review: boolean;
};

export function RatingSystem() {
    const { currentUser, initAuth } = useStore();
    const [events, setEvents] = useState<ReviewableEvent[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
    const [rating, setRating] = useState<number>(0);
    const [hoveredRating, setHoveredRating] = useState<number>(0);
    const [feedback, setFeedback] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        initAuth();
    }, [initAuth]);

    useEffect(() => {
        const load = async () => {
            if (!currentUser?.id) {
                setEvents([]);
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const res = await fetch(ENDPOINTS.GET_USER_REVIEWABLE_EVENTS(currentUser.id));
                const data = await res.json();
                if (data?.status === "success" && Array.isArray(data.data)) {
                    setEvents(
                        data.data.map((e: any) => ({
                            id: String(e.id),
                            title: String(e.title || ""),
                            category: e.category ?? null,
                            mode: e.mode ?? null,
                            status: e.status ?? null,
                            date: e.date ?? null,
                            startDate: e.startDate ?? null,
                            venue: e.venue ?? null,
                            avg_rating: Number(e.avg_rating || 0),
                            rating_count: Number(e.rating_count || 0),
                            has_review: Boolean(e.has_review),
                        }))
                    );
                } else {
                    setEvents([]);
                }
            } catch (e) {
                console.error(e);
                setEvents([]);
                toast.error("Failed to load reviewable events");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [currentUser?.id]);

    const filteredEvents = useMemo(() => {
        const q = searchTerm.toLowerCase();
        return events.filter((e) => (e.title || "").toLowerCase().includes(q));
    }, [events, searchTerm]);

    const selectedEvent = useMemo(
        () => (selectedEventId ? events.find((e) => e.id === selectedEventId) || null : null),
        [events, selectedEventId]
    );

    const resetForm = () => {
        setSubmitted(false);
        setRating(0);
        setHoveredRating(0);
        setFeedback("");
        setSelectedEventId(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!currentUser?.id) {
            toast.error("You must be logged in to rate an event.");
            return;
        }
        if (!selectedEventId || rating === 0) {
            toast.error("Please select an event and provide a rating.");
            return;
        }

        const ev = events.find((x) => x.id === selectedEventId);
        if (!ev) return;
        if (ev.has_review) {
            toast.success("You already reviewed this event.");
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch(ENDPOINTS.SUBMIT_EVENT_REVIEW, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    event_id: selectedEventId,
                    user_id: currentUser.id,
                    rating,
                    review: feedback,
                }),
            });
            const data = await res.json().catch(() => null);
            if (res.ok && data?.status === "success") {
                setEvents((prev) => prev.map((x) => (x.id === selectedEventId ? { ...x, has_review: true } : x)));
                setSubmitted(true);
                toast.success("Thank you for your feedback!");
                return;
            }
            if (res.status === 409) {
                setEvents((prev) => prev.map((x) => (x.id === selectedEventId ? { ...x, has_review: true } : x)));
                setSubmitted(true);
                toast.success("Thank you!");
                return;
            }
            toast.error(data?.message || "Failed to submit review");
        } catch (err) {
            console.error(err);
            toast.error("Network error submitting review");
        } finally {
            setSubmitting(false);
        }
    };

    if (!currentUser?.id) {
        return (
            <div className="w-full max-w-3xl mx-auto p-10 text-center bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl">
                <Trophy className="w-14 h-14 text-gray-700 mx-auto mb-4" />
                <div className="text-white font-bold text-xl mb-2">Login Required</div>
                <div className="text-gray-400">Login to rate completed events you registered for.</div>
            </div>
        );
    }

    if (submitted) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-3xl mx-auto flex flex-col items-center justify-center p-16 text-center bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.3)]"
            >
                <div className="w-20 h-20 bg-accent2/10 rounded-full flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(170,255,0,0.2)]">
                    <Send className="w-10 h-10 text-accent2" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-3">Feedback Submitted!</h3>
                <p className="text-gray-400 max-w-lg text-lg mb-8">
                    Your rating helps improve future events.
                </p>
                <button
                    onClick={resetForm}
                    className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white rounded-full transition-all border border-white/10 font-bold tracking-wide hover:scale-105"
                >
                    Rate Another Event
                </button>
            </motion.div>
        );
    }

    return (
        <div className="w-full space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-4xl font-bold text-white mb-2 tracking-tight">
                        Rate an <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent1 to-accent2">Event</span>
                    </h2>
                    <p className="text-gray-400 max-w-xl text-lg">
                        Ratings are available only for completed events you registered for.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-5 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl h-[600px] flex flex-col"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="text-lg font-bold text-white">Completed Events</div>
                        <div className="text-xs text-gray-500">{events.length} total</div>
                    </div>

                    <div className="relative mb-4">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                        <input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search events..."
                            className="w-full bg-black/60 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-gray-700 focus:border-accent1 outline-none"
                        />
                    </div>

                    <div className="flex-1 overflow-y-auto pr-1 space-y-3">
                        {loading ? (
                            <div className="text-gray-500 text-sm py-10 text-center">Loading...</div>
                        ) : filteredEvents.length === 0 ? (
                            <div className="text-gray-500 text-sm py-10 text-center">
                                No completed registered events available for rating.
                            </div>
                        ) : (
                            <AnimatePresence mode="popLayout">
                                {filteredEvents.map((event) => {
                                    const selected = selectedEventId === event.id;
                                    return (
                                        <motion.button
                                            key={event.id}
                                            layout
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            onClick={() => setSelectedEventId(event.id)}
                                            className={cn(
                                                "w-full text-left p-4 rounded-xl border transition-all group",
                                                selected
                                                    ? "bg-accent1/10 border-accent1/30"
                                                    : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                                            )}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <div className="text-white font-bold truncate">{event.title}</div>
                                                    <div className="text-xs text-gray-400 mt-1 flex items-center gap-3">
                                                        <span className="inline-flex items-center gap-1">
                                                            <Calendar className="w-3.5 h-3.5" />
                                                            {event.date || (event.startDate ? new Date(event.startDate).toLocaleDateString() : "TBA")}
                                                        </span>
                                                        <span className="inline-flex items-center gap-1 truncate">
                                                            <MapPin className="w-3.5 h-3.5" />
                                                            {event.venue || "—"}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="text-right whitespace-nowrap">
                                                    <div className="text-xs text-gray-500">{event.avg_rating.toFixed(1)}★</div>
                                                    <div className="text-[11px] text-gray-600">{event.rating_count} reviews</div>
                                                    {event.has_review && (
                                                        <div className="mt-2 text-[11px] font-bold text-green-400">Reviewed</div>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.button>
                                    );
                                })}
                            </AnimatePresence>
                        )}
                    </div>
                </motion.div>

                <motion.form
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onSubmit={handleSubmit}
                    className="lg:col-span-7 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden h-[600px] flex flex-col"
                >
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-accent1/5 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-accent2/5 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10 flex-1 flex flex-col">
                        {!selectedEvent ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 space-y-4">
                                <Trophy className="w-16 h-16 text-gray-700 opacity-50" />
                                <p className="text-lg">Select an event from the left to start rating</p>
                            </div>
                        ) : selectedEvent.has_review ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 space-y-4">
                                <div className="text-white font-bold text-xl">Already Reviewed</div>
                                <p className="text-sm text-gray-400 text-center">
                                    You already submitted a rating for <span className="text-white font-bold">{selectedEvent.title}</span>.
                                </p>
                            </div>
                        ) : (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col space-y-8">
                                <div>
                                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                        <span className="w-1 h-6 bg-accent1 rounded-full" />
                                        Rate Your Experience
                                    </h3>
                                    <p className="text-gray-400 text-sm mt-1 ml-3">
                                        How was {selectedEvent.title}?
                                    </p>
                                </div>

                                <div className="space-y-4 border-b border-white/10 pb-8">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="flex gap-3">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onMouseEnter={() => setHoveredRating(star)}
                                                    onMouseLeave={() => setHoveredRating(0)}
                                                    onClick={() => setRating(star)}
                                                    className="group p-1 focus:outline-none transition-transform hover:scale-110 active:scale-95"
                                                >
                                                    <Star
                                                        className={cn(
                                                            "w-12 h-12 transition-all duration-200",
                                                            star <= (hoveredRating || rating)
                                                                ? "fill-accent2 text-accent2 drop-shadow-[0_0_15px_rgba(170,255,0,0.5)]"
                                                                : "text-gray-700 group-hover:text-gray-500"
                                                        )}
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                        <div className="text-sm text-gray-400">
                                            {rating > 0 ? `You rated: ${rating}/5` : "Click a star to rate"}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm font-bold text-white uppercase tracking-widest">Your Review (optional)</label>
                                    <textarea
                                        value={feedback}
                                        onChange={(e) => setFeedback(e.target.value)}
                                        rows={6}
                                        className="w-full bg-black/60 border border-white/10 rounded-xl p-4 text-white placeholder:text-gray-700 focus:border-accent1 outline-none"
                                        placeholder="Share what you liked and what could be improved..."
                                    />
                                </div>

                                <div className="mt-auto pt-6">
                                    <button
                                        disabled={submitting}
                                        type="submit"
                                        className="w-full py-4 bg-accent1 text-black font-bold uppercase tracking-widest rounded-xl hover:bg-white transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                                    >
                                        {submitting ? "Submitting..." : (
                                            <>
                                                Submit Feedback <Send className="w-4 h-4" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </motion.form>
            </div>
        </div>
    );
}

