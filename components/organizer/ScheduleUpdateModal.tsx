"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Clock, Loader2, Save, ChevronDown, Check } from "lucide-react";
import { ENDPOINTS, API_BASE_URL } from "@/lib/api_config";
import { toast } from "sonner";
import { Event } from "@/types";
import { cn } from "@/lib/utils";

interface ScheduleUpdateModalProps {
    organizerId: string;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function ScheduleUpdateModal({ organizerId, isOpen, onClose, onSuccess }: ScheduleUpdateModalProps) {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const [selectedEventId, setSelectedEventId] = useState<string>("");
    const [startDate, setStartDate] = useState("");
    const [dateDisplay, setDateDisplay] = useState("");

    useEffect(() => {
        if (!isOpen || !organizerId) return;

        const fetchEvents = async () => {
            setLoading(true);
            try {
                const res = await fetch(ENDPOINTS.GET_ORGANIZER_EVENTS(organizerId));
                const data = await res.json();
                if (data.status === 'success') {
                    setEvents(data.data);
                }
            } catch (err) {
                console.error("Error fetching events:", err);
                toast.error("Failed to load your events");
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, [isOpen, organizerId]);

    // Populate fields when event is selected
    useEffect(() => {
        if (selectedEventId) {
            const event = events.find(e => e.id === selectedEventId);
            if (event) {
                // Ensure date format is compatible with datetime-local input (YYYY-MM-DDTHH:MM)
                // Assuming backend sends SQL DATETIME (YYYY-MM-DD HH:MM:SS)
                const isoString = event.startDate ? event.startDate.replace(' ', 'T').substring(0, 16) : "";
                setStartDate(isoString);
                setDateDisplay(event.date || "");
            }
        }
    }, [selectedEventId, events]);

    const handleSave = async () => {
        if (!selectedEventId || !startDate || !dateDisplay) {
            toast.error("Please fill all fields");
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch(`${API_BASE_URL}/update_event_schedule.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    event_id: selectedEventId,
                    start_date: startDate.replace('T', ' ') + ':00', // Convert back to SQL format
                    date_display: dateDisplay
                })
            });
            const data = await res.json();

            if (data.status === 'success') {
                toast.success("Schedule updated successfully!");
                onSuccess();
                onClose();
            } else {
                toast.error(data.message || "Failed to update schedule");
            }
        } catch (err) {
            console.error("Error updating schedule:", err);
            toast.error("Network error");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-y-auto"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl w-full max-w-md pointer-events-auto shadow-2xl">
                            <div className="p-6 border-b border-white/10 flex justify-between items-center">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-accent1" /> Manage Schedule
                                </h3>
                                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                {loading ? (
                                    <div className="flex justify-center py-8">
                                        <Loader2 className="w-8 h-8 animate-spin text-accent1" />
                                    </div>
                                ) : (
                                    <>
                                        <div className="relative">
                                            <label className="block text-sm font-medium text-gray-400 mb-2">Select Event</label>

                                            {/* Custom Dropdown Trigger */}
                                            <button
                                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white flex justify-between items-center hover:border-white/20 transition-colors"
                                            >
                                                <span className={selectedEventId ? "text-white" : "text-gray-500"}>
                                                    {selectedEventId ? events.find(e => e.id === selectedEventId)?.title : "-- Choose an Event --"}
                                                </span>
                                                <ChevronDown className={cn("w-4 h-4 text-gray-400 transition-transform", isDropdownOpen && "rotate-180")} />
                                            </button>

                                            {/* Custom Dropdown Options */}
                                            <AnimatePresence>
                                                {isDropdownOpen && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: -5 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -5 }}
                                                        className="absolute top-full left-0 right-0 mt-2 bg-[#0F0F0F] border border-white/10 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto"
                                                    >
                                                        {events.length === 0 ? (
                                                            <div className="p-4 text-center text-gray-500 text-sm">No events found</div>
                                                        ) : (
                                                            events.map(event => (
                                                                <button
                                                                    key={event.id}
                                                                    onClick={() => {
                                                                        setSelectedEventId(event.id);
                                                                        setIsDropdownOpen(false);
                                                                    }}
                                                                    className={cn(
                                                                        "w-full text-left px-4 py-3 text-sm transition-colors flex items-center justify-between group",
                                                                        selectedEventId === event.id
                                                                            ? "bg-accent1/10 text-accent1"
                                                                            : "text-gray-300 hover:bg-white/5 hover:text-white"
                                                                    )}
                                                                >
                                                                    <span>{event.title}</span>
                                                                    {selectedEventId === event.id && (
                                                                        <Check className="w-4 h-4 text-accent1" />
                                                                    )}
                                                                </button>
                                                            ))
                                                        )}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        {selectedEventId && (
                                            <div className="animate-in fade-in slide-in-from-top-4 duration-300 space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-400 mb-2">New Start Date & Time</label>
                                                    <div className="relative">
                                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                                        <input
                                                            type="datetime-local"
                                                            value={startDate}
                                                            onChange={(e) => setStartDate(e.target.value)}
                                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 pl-10 text-white focus:border-accent1 outline-none"
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-400 mb-2">Display Date String</label>
                                                    <input
                                                        type="text"
                                                        value={dateDisplay}
                                                        onChange={(e) => setDateDisplay(e.target.value)}
                                                        placeholder="e.g. Jan 24-26, 2026"
                                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-accent1 outline-none"
                                                    />
                                                    <p className="text-xs text-gray-500 mt-1">This text is shown on the event card.</p>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            <div className="p-6 border-t border-white/10 flex justify-end gap-2">
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors text-sm font-bold"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={submitting || !selectedEventId}
                                    className="flex items-center gap-2 px-6 py-2 bg-accent1 text-black rounded-lg font-bold text-sm hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
