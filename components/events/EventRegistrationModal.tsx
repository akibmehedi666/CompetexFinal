"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ENDPOINTS } from "@/lib/api_config";
import { Event, User } from "@/types";

interface EventRegistrationModalProps {
    isOpen: boolean;
    onClose: () => void;
    event: Event;
    currentUser: User;
    teamId?: string | null;
    onSubmitted?: () => void;
}

export function EventRegistrationModal({ isOpen, onClose, event, currentUser, teamId, onSubmitted }: EventRegistrationModalProps) {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [university, setUniversity] = useState("");
    const [transactionId, setTransactionId] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const registrationFee = useMemo(() => {
        const raw = (event as any)?.registrationFee ?? (event as any)?.registration_fee ?? 0;
        const fee = Number(raw || 0);
        return Number.isFinite(fee) ? fee : 0;
    }, [event]);
    const isPaid = registrationFee > 0;

    useEffect(() => {
        if (!isOpen) return;
        setFullName(currentUser.name || "");
        setEmail(currentUser.email || "");
        setUniversity(currentUser.university || "");
        setPhone("");
        setTransactionId("");
    }, [isOpen, currentUser]);

    const handleSubmit = async () => {
        if (!fullName.trim() || !email.trim()) {
            toast.error("Name and email are required.");
            return;
        }
        if (isPaid && !transactionId.trim()) {
            toast.error("Transaction ID is required for paid events.");
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch(ENDPOINTS.SUBMIT_EVENT_REGISTRATION, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    event_id: event.id,
                    user_id: currentUser.id,
                    team_id: teamId ?? null,
                    full_name: fullName.trim(),
                    email: email.trim(),
                    phone: phone.trim() || null,
                    university: university.trim() || null,
                    transaction_id: transactionId.trim() || null
                })
            });
            const data = await res.json();
            if (data.status === "success") {
                toast.success("Registration submitted! Awaiting organizer approval.");
                onClose();
                onSubmitted?.();
            } else {
                toast.error(data.message || "Registration failed");
            }
        } catch {
            toast.error("Network error submitting registration");
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
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="w-full max-w-lg bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden pointer-events-auto">
                            <div className="p-6 border-b border-white/10 flex justify-between items-center">
                                <div>
                                    <h2 className="text-xl font-bold text-white">Event Registration</h2>
                                    <p className="text-xs text-gray-500 mt-1">{event.title}</p>
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>

                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">Full Name</label>
                                        <input
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-accent1 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">Email</label>
                                        <input
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-accent1 outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">Phone</label>
                                        <input
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="Optional"
                                            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-accent1 outline-none placeholder:text-gray-700"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">University</label>
                                        <input
                                            value={university}
                                            onChange={(e) => setUniversity(e.target.value)}
                                            placeholder="Optional"
                                            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-accent1 outline-none placeholder:text-gray-700"
                                        />
                                    </div>
                                </div>

                                {isPaid && (
                                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="text-sm font-bold text-white">Paid Event</div>
                                            <div className="text-xs font-bold text-accent1">Fee: {registrationFee.toFixed(2)}</div>
                                        </div>
                                        <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">Transaction ID</label>
                                        <input
                                            value={transactionId}
                                            onChange={(e) => setTransactionId(e.target.value)}
                                            required={isPaid}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-accent1 outline-none"
                                            placeholder="Enter your payment transaction id"
                                        />
                                        <p className="text-[11px] text-gray-500 mt-2">Your registration will be approved after the organizer verifies this transaction.</p>
                                    </div>
                                )}
                            </div>

                            <div className="p-6 border-t border-white/10 flex justify-end gap-3 bg-black/20">
                                <button
                                    onClick={onClose}
                                    disabled={submitting}
                                    className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                    className="px-6 py-2 rounded-lg text-sm font-bold bg-accent1 text-black hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit"}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
