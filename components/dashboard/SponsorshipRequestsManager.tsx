"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, MapPin, CheckCircle, XCircle, MessageSquare, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

// Simplified Type matching Backend
interface SponsorshipRequest {
    id: string;
    event_id: string;
    event_title: string;
    event_description?: string | null;
    date_display?: string | null;
    start_date?: string | null;
    venue?: string | null;
    mode?: string | null;
    category?: string | null;
    image?: string | null;
    organizer_id: string;
    organizer_name: string;
    status: 'pending' | 'accepted' | 'rejected';
    requested_amount: string;
    message?: string | null;
    created_at: string;
}

import { ENDPOINTS } from "@/lib/api_config";
import { toast } from "sonner";
import { useStore } from "@/store/useStore";

export function SponsorshipRequestsManager() {
    const { currentUser } = useStore();
    const [requests, setRequests] = useState<SponsorshipRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "pending">("all");

    useEffect(() => {
        if (!currentUser) return;
        const fetchRequests = async () => {
            setLoading(true);
            try {
                const status = filter === "pending" ? "pending" : undefined;
                const res = await fetch(ENDPOINTS.GET_SPONSOR_SPONSORSHIP_REQUESTS(currentUser.id, status));
                const data = await res.json();
                if (data.status === 'success') {
                    setRequests(data.data);
                }
            } catch (err) {
                console.error(err);
                toast.error("Failed to load requests");
            } finally {
                setLoading(false);
            }
        };
        fetchRequests();
    }, [currentUser, filter]);

    const handleAction = async (id: string, action: "accepted" | "rejected") => {
        if (!currentUser?.id) return;
        try {
            const res = await fetch(ENDPOINTS.RESPOND_SPONSORSHIP_REQUEST_SPONSOR, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ request_id: id, action, sponsor_user_id: currentUser.id })
            });
            const data = await res.json();

            if (data.status === 'success') {
                toast.success(`Request ${action}`);
                // Update local state
                setRequests((prev) => prev.map(req => (req.id === id ? { ...req, status: action } : req)));
            } else {
                toast.error(data.message || "Action failed");
            }
        } catch (err) {
            console.error(err);
            toast.error("Network error");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white">Sponsorship Requests</h2>
                    <p className="text-gray-400">Manage incoming proposals from event organizers.</p>
                </div>
                <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
                    <button
                        onClick={() => setFilter("all")}
                        className={cn("px-4 py-1.5 rounded-md text-sm font-medium transition-colors", filter === "all" ? "bg-white text-black" : "text-gray-400 hover:text-white")}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter("pending")}
                        className={cn("px-4 py-1.5 rounded-md text-sm font-medium transition-colors", filter === "pending" ? "bg-accent1 text-black" : "text-gray-400 hover:text-white")}
                    >
                        Pending
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                <AnimatePresence>
                    {requests.length > 0 ? (
                        requests.map((req) => (
                            <RequestCard key={req.id} request={req} onAction={handleAction} />
                        ))
                    ) : (
                        <div className="text-center py-12 text-gray-500 border border-dashed border-white/10 rounded-xl">
                            <h3 className="text-lg font-medium text-gray-400">No requests found</h3>
                            <p className="text-sm">Requests matching your filter will appear here.</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

function RequestCard({ request, onAction }: { request: SponsorshipRequest, onAction: (id: string, action: "accepted" | "rejected") => void }) {
    const [expanded, setExpanded] = useState(false);
    const receivedDate = new Date(request.created_at).toLocaleDateString();
    const eventDate = request.date_display || (request.start_date ? new Date(request.start_date).toLocaleDateString() : "—");
    const initials = (request.organizer_name || "O").trim().slice(0, 1).toUpperCase();

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-[#111] border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-colors"
        >
            <div className="p-6 cursor-pointer" onClick={() => setExpanded(!expanded)}>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center font-bold text-xl text-gray-500 overflow-hidden">
                            {request.image ? <img src={request.image} alt="" className="w-full h-full object-cover" /> : initials}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-bold text-white">{request.organizer_name}</h3>
                                {request.status === 'pending' && <span className="text-xs bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded border border-yellow-500/20 uppercase font-bold">Pending</span>}
                                {request.status === 'accepted' && <span className="text-xs bg-green-500/10 text-green-500 px-2 py-0.5 rounded border border-green-500/20 uppercase font-bold">Accepted</span>}
                                {request.status === 'rejected' && <span className="text-xs bg-red-500/10 text-red-500 px-2 py-0.5 rounded border border-red-500/20 uppercase font-bold">Rejected</span>}
                            </div>
                            <p className="text-sm text-gray-400 mt-1">
                                Request for <span className="text-accent1">{request.event_title}</span> • <span className="text-gray-500">{eventDate}</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="text-right">
                            <div className="text-xs text-gray-500 uppercase font-bold mb-1">Requested Amount</div>
                            <div className="text-sm font-bold text-green-400 bg-green-500/10 px-3 py-1 rounded-lg border border-green-500/20">${request.requested_amount}</div>
                        </div>
                        <div className="bg-white/5 p-2 rounded-lg text-gray-400 transition-transform duration-300">
                            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-white/5 bg-white/5"
                    >
                        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-6">
                                <div>
                                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Message from Organizer</h4>
                                    <p className="text-gray-300 leading-relaxed text-sm bg-black/20 p-4 rounded-xl border border-white/5">
                                        {request.message || "No message provided."}
                                    </p>
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Event Details</h4>
                                    <div className="text-sm text-gray-300 bg-black/20 p-4 rounded-xl border border-white/5 space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-accent1" />
                                            <span className="text-gray-500">Date:</span> {eventDate}
                                        </div>
                                        {request.venue && (
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-accent1" />
                                                <span className="text-gray-500">Venue:</span> {request.venue}
                                            </div>
                                        )}
                                        {request.mode && (
                                            <div><span className="text-gray-500">Mode:</span> {request.mode}</div>
                                        )}
                                        {request.event_description && (
                                            <div className="pt-2 border-t border-white/5 text-gray-400 text-xs leading-relaxed">
                                                {request.event_description}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                                    <h4 className="text-sm font-bold text-white mb-4">Actions</h4>

                                    {request.status === 'pending' ? (
                                        <div className="space-y-3">
                                            <button
                                                onClick={() => onAction(request.id, "accepted")}
                                                className="w-full py-2 bg-green-500 text-black font-bold rounded-lg hover:bg-green-400 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <CheckCircle className="w-4 h-4" /> Accept Offer
                                            </button>
                                            <button
                                                onClick={() => onAction(request.id, "rejected")}
                                                className="w-full py-2 bg-white/5 text-red-400 border border-red-500/20 font-bold rounded-lg hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <XCircle className="w-4 h-4" /> Reject
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="text-center text-gray-500 py-4">
                                            <div className="flex justify-center mb-2">
                                                {request.status === 'accepted' ? <CheckCircle className="w-8 h-8 text-green-500" /> : <XCircle className="w-8 h-8 text-red-500" />}
                                            </div>
                                            Request {request.status}
                                        </div>
                                    )}

                                    <div className="mt-4 pt-4 border-t border-white/5 text-center">
                                        <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                                            <Clock className="w-3 h-3" /> Received {receivedDate}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
