"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, XCircle, Loader2, User, Clock } from "lucide-react";
import { ENDPOINTS, API_BASE_URL } from "@/lib/api_config";
import { toast } from "sonner";

interface EventRequest {
    id: string; // request_id
    team_id: string | null;
    team_name: string | null;
    leader_name: string | null;
    participant_name: string | null;
    full_name?: string | null;
    email?: string | null;
    phone?: string | null;
    university?: string | null;
    transaction_id?: string | null;
    registration_fee?: number | string | null;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    event_title?: string;
}

interface EventRequestsModalProps {
    eventId: string;
    organizerId?: string; // Add this
    isOpen: boolean;
    onClose: () => void;
}

export function EventRequestsModal({ eventId, organizerId, isOpen, onClose }: EventRequestsModalProps) {
    const [requests, setRequests] = useState<EventRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [txEdits, setTxEdits] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!isOpen) return;

        const fetchRequests = async () => {
            setLoading(true);
            try {
                let url = '';
                if (eventId === 'all' && organizerId) {
                    url = `${API_BASE_URL}/get_event_requests.php?organizer_id=${organizerId}`;
                } else if (eventId && eventId !== 'all') {
                    url = ENDPOINTS.GET_EVENT_REQUESTS(eventId);
                } else {
                    return; // Should not happen
                }

                const res = await fetch(url);
                const data = await res.json();
                if (data.status === 'success') {
                    setRequests(data.data);
                } else {
                    toast.error(data.message || "Failed to fetch requests");
                }
            } catch (error) {
                console.error("Error fetching requests:", error);
                toast.error("Failed to load requests");
            } finally {
                setLoading(false);
            }
        };
        fetchRequests();
    }, [isOpen, eventId]);

    const handleAction = async (requestId: string, action: 'approved' | 'rejected') => {
        setActionLoading(requestId);
        try {
            const req = requests.find((r) => r.id === requestId);
            const isPaid = Number(req?.registration_fee || 0) > 0;
            const existingTx = (req?.transaction_id || "").trim();
            const editedTx = (txEdits[requestId] || "").trim();
            const txToSend = existingTx || editedTx || null;

            if (action === "approved" && isPaid && !txToSend) {
                toast.error("Transaction ID is required to approve a paid registration.");
                setActionLoading(null);
                return;
            }

            const res = await fetch(ENDPOINTS.RESPOND_EVENT_REQUEST, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    request_id: requestId,
                    action: action,
                    transaction_id: txToSend
                })
            });
            const data = await res.json();

            if (data.status === 'success') {
                toast.success(`Request ${action}`);
                // Remove from list
                setRequests(prev => prev.filter(r => r.id !== requestId));
                setTxEdits((prev) => {
                    const next = { ...prev };
                    delete next[requestId];
                    return next;
                });
            } else {
                toast.error(data.message || "Action failed");
            }
        } catch (err) {
            console.error("Error responding to request:", err);
            toast.error("Action failed");
        } finally {
            setActionLoading(null);
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
                        <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden pointer-events-auto">
                            <div className="p-6 border-b border-white/10 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-white">Event Registrations</h2>
                                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>

                            <div className="p-6 max-h-[60vh] overflow-y-auto">
                                {loading ? (
                                    <div className="flex justify-center py-8">
                                        <Loader2 className="w-8 h-8 animate-spin text-accent1" />
                                    </div>
                                ) : requests.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        <Clock className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                        No pending requests
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {requests.map(req => (
                                            <div key={req.id} className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                                                <div>
                                                    <p className="text-white font-medium">{req.full_name || req.team_name || req.participant_name}</p>
                                                    <p className="text-xs text-gray-400">
                                                        {req.event_title && <span className="text-accent1 font-bold mr-1">[{req.event_title}]</span>}
                                                        {req.team_name ? `Team • Leader: ${req.leader_name}` : 'Individual Participant'}
                                                    </p>
                                                    <div className="mt-2 space-y-1 text-[11px] text-gray-500">
                                                        {req.email && <div>Email: <span className="text-gray-300">{req.email}</span></div>}
                                                        {req.phone && <div>Phone: <span className="text-gray-300">{req.phone}</span></div>}
                                                        {req.university && <div>University: <span className="text-gray-300">{req.university}</span></div>}
                                                        {Number(req.registration_fee || 0) > 0 && (
                                                            <div>
                                                                Transaction ID:{" "}
                                                                <span className={req.transaction_id ? "text-gray-300" : "text-red-400 font-bold"}>
                                                                    {req.transaction_id || "Missing"}
                                                                </span>
                                                            </div>
                                                        )}
                                                        {Number(req.registration_fee || 0) > 0 && !req.transaction_id && (
                                                            <div className="mt-2">
                                                                <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1">Enter Transaction ID</label>
                                                                <input
                                                                    value={txEdits[req.id] || ""}
                                                                    onChange={(e) =>
                                                                        setTxEdits((prev) => ({ ...prev, [req.id]: e.target.value }))
                                                                    }
                                                                    className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white focus:border-accent1 outline-none text-xs"
                                                                    placeholder="e.g. TXN12345..."
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleAction(req.id, 'approved')}
                                                        disabled={!!actionLoading}
                                                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 transition-all text-xs font-bold uppercase tracking-wider"
                                                    >
                                                        {actionLoading === req.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleAction(req.id, 'rejected')}
                                                        disabled={!!actionLoading}
                                                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all text-xs font-bold uppercase tracking-wider"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                        Reject
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
