"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, DollarSign, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ENDPOINTS } from "@/lib/api_config";

type OrganizerEvent = {
    id: string;
    title: string;
};

type SponsorRow = {
    sponsor_profile_id: string;
    sponsor_user_id: string;
    sponsor_name: string;
    company_name?: string | null;
};

interface SendSponsorshipRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    organizerId: string;
    sponsor: SponsorRow | null;
    events: OrganizerEvent[];
    onSent?: () => void;
}

export function SendSponsorshipRequestModal({ isOpen, onClose, organizerId, sponsor, events, onSent }: SendSponsorshipRequestModalProps) {
    const [selectedEventId, setSelectedEventId] = useState("");
    const [amount, setAmount] = useState("");
    const [message, setMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const sponsorLabel = useMemo(() => sponsor?.company_name || sponsor?.sponsor_name || "Sponsor", [sponsor]);

    const reset = () => {
        setSelectedEventId("");
        setAmount("");
        setMessage("");
        setSubmitting(false);
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    const handleSubmit = async () => {
        if (!sponsor) return;
        if (!selectedEventId) {
            toast.error("Please select an event.");
            return;
        }
        const parsed = parseFloat(amount);
        if (!Number.isFinite(parsed) || parsed <= 0) {
            toast.error("Please enter a valid amount.");
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch(ENDPOINTS.SEND_SPONSORSHIP_REQUEST, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    organizer_id: organizerId,
                    sponsor_id: sponsor.sponsor_profile_id,
                    event_id: selectedEventId,
                    requested_amount: parsed,
                    message: message.trim() || null
                })
            });
            const data = await res.json();
            if (data.status === "success") {
                toast.success("Sponsorship request sent.");
                onSent?.();
                handleClose();
                return;
            }
            toast.error(data.message || "Failed to send request");
        } catch {
            toast.error("Network error sending request");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && sponsor && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl w-full max-w-lg pointer-events-auto overflow-hidden">
                            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                                <div>
                                    <h3 className="text-xl font-bold text-white">Request Sponsorship</h3>
                                    <p className="text-xs text-gray-400 mt-1">Send a request to <span className="text-white font-medium">{sponsorLabel}</span></p>
                                </div>
                                <button onClick={handleClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>

                            <div className="p-6 space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Select Event</label>
                                    <select
                                        value={selectedEventId}
                                        onChange={(e) => setSelectedEventId(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-3 text-white focus:border-accent1 outline-none"
                                    >
                                        <option value="" disabled>Select one...</option>
                                        {events.map(ev => (
                                            <option key={ev.id} value={ev.id}>{ev.title}</option>
                                        ))}
                                    </select>
                                    {events.length === 0 && (
                                        <p className="text-[11px] text-gray-500 mt-2">Create an event first to request sponsorship.</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Requested Amount</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                        <input
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            type="number"
                                            min={0}
                                            step="0.01"
                                            placeholder="5000"
                                            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 pl-10 text-white focus:border-accent1 outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Message (Optional)</label>
                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        rows={4}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-accent1 outline-none resize-none"
                                        placeholder="Explain what you offer and why this sponsor is a good fit..."
                                    />
                                </div>
                            </div>

                            <div className="p-6 border-t border-white/10 bg-white/5 flex justify-end gap-3">
                                <button
                                    onClick={handleClose}
                                    disabled={submitting}
                                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors text-sm font-bold disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={submitting || events.length === 0}
                                    className="flex items-center gap-2 px-6 py-2 bg-accent1 text-black rounded-lg font-bold text-sm hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                    Send Request
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

