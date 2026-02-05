"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Clock, MessageSquare, Calendar } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/store/useStore";
import { ENDPOINTS } from "@/lib/api_config";

type MentorRequestRow = {
    id: string;
    status: "pending" | "accepted" | "rejected";
    created_at: string;
    message?: string | null;
    topic?: string | null;
    proposed_slots: string[];
    mentee_id: string;
    mentee_name: string;
    mentee_avatar?: string | null;
    mentee_university?: string | null;
};

export function MentorshipRequests() {
    const { currentUser } = useStore();
    const [requests, setRequests] = useState<MentorRequestRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const fetchRequests = async () => {
        if (!currentUser?.id) return;
        setLoading(true);
        try {
            const res = await fetch(ENDPOINTS.GET_MENTOR_REQUESTS(currentUser.id, "pending"));
            const data = await res.json();
            if (data?.status === "success" && Array.isArray(data.data)) {
                setRequests(data.data);
            } else {
                setRequests([]);
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to load requests");
            setRequests([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!currentUser?.id) return;
        fetchRequests();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser?.id]);

    const handleAction = async (id: string, action: "accept" | "reject") => {
        if (!currentUser?.id) return;
        setProcessingId(id);
        try {
            const res = await fetch(ENDPOINTS.RESPOND_MENTORSHIP_REQUEST, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ request_id: id, mentor_user_id: currentUser.id, action })
            });
            const data = await res.json();
            if (data?.status === "success") {
                toast.success(action === "accept" ? "Request accepted! Session created." : "Request declined.");
                setRequests((prev) => prev.filter((r) => r.id !== id));
            } else {
                toast.error(data?.message || "Failed to update request");
            }
        } catch (err) {
            console.error(err);
            toast.error("Network error");
        } finally {
            setProcessingId(null);
        }
    };

    const prettySince = useMemo(() => {
        const now = Date.now();
        return (iso: string) => {
            const t = new Date(iso).getTime();
            if (!Number.isFinite(t)) return "Recently";
            const days = Math.max(0, Math.floor((now - t) / (1000 * 60 * 60 * 24)));
            return days === 0 ? "Today" : `${days} day${days === 1 ? "" : "s"} ago`;
        };
    }, []);

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-white mb-6">Incoming Requests</h2>

            <AnimatePresence>
                {loading ? (
                    <div className="text-center py-12 text-gray-500 border border-dashed border-white/10 rounded-xl">
                        Loading requests...
                    </div>
                ) : requests.length > 0 ? (
                    requests.map((request) => (
                        <motion.div
                            key={request.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                            className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col md:flex-row gap-6"
                        >
                            {/* Mentee Info */}
                            <div className="flex items-start gap-4 md:w-1/3">
                                <img
                                    src={request.mentee_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(request.mentee_name || "Mentee")}`}
                                    alt={request.mentee_name}
                                    className="w-12 h-12 rounded-full bg-white/10"
                                />
                                <div>
                                    <h3 className="font-bold text-white">{request.mentee_name}</h3>
                                    {request.topic && (
                                        <span className="text-xs px-2 py-1 bg-accent1/10 text-accent1 rounded border border-accent1/20 mt-1 inline-block">
                                            {request.topic}
                                        </span>
                                    )}
                                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> Requested {prettySince(request.created_at)}
                                    </p>
                                    {request.mentee_university && (
                                        <p className="text-xs text-gray-500 mt-1">{request.mentee_university}</p>
                                    )}
                                </div>
                            </div>

                            {/* Details */}
                            <div className="flex-1 space-y-3">
                                <div className="bg-black/40 rounded-lg p-3 text-sm text-gray-300 border border-white/5">
                                    <MessageSquare className="w-3 h-3 text-gray-500 inline mr-2" />
                                    "{request.message || "No message."}"
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {(request.proposed_slots || []).map(slot => (
                                        <span key={slot} className="flex items-center gap-1 text-xs px-2 py-1 bg-white/5 rounded text-gray-400 border border-white/10">
                                            <Calendar className="w-3 h-3" /> {slot}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex md:flex-col gap-2 justify-center min-w-[120px]">
                                <button
                                    onClick={() => handleAction(request.id, "accept")}
                                    disabled={processingId === request.id}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-accent1 text-black font-bold text-sm rounded-lg hover:bg-white transition-colors"
                                >
                                    <Check className="w-4 h-4" /> Accept
                                </button>
                                <button
                                    onClick={() => handleAction(request.id, "reject")}
                                    disabled={processingId === request.id}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 font-bold text-sm rounded-lg border border-red-500/20 hover:bg-red-500 hover:text-white transition-colors"
                                >
                                    <X className="w-4 h-4" /> Decline
                                </button>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="text-center py-20 text-gray-500">
                        <p>No pending requests.</p>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
