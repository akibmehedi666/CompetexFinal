"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, DollarSign, Send, Loader2, Mail, Phone } from "lucide-react";
import { API_BASE_URL } from "@/lib/api_config";
import { toast } from "sonner";
import { useStore } from "@/store/useStore";

interface SponsorshipRequestModalProps {
    event: any;
    isOpen: boolean;
    onClose: () => void;
}

export function SponsorshipRequestModal({ event, isOpen, onClose }: SponsorshipRequestModalProps) {
    const { currentUser } = useStore();
    const [amount, setAmount] = useState("");
    const [contactEmail, setContactEmail] = useState("");
    const [contactPhone, setContactPhone] = useState("");
    const [message, setMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        // Convenience: prefill email when the modal opens.
        if (!isOpen) return;
        if (currentUser?.email && !contactEmail) setContactEmail(currentUser.email);
    }, [isOpen, currentUser, contactEmail]);

    const handleSubmit = async () => {
        const email = contactEmail.trim();
        const phone = contactPhone.trim();

        if (!amount || parseFloat(amount) <= 0) {
            toast.error("Please enter a valid sponsorship amount");
            return;
        }

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            toast.error("Please enter a valid contact email");
            return;
        }

        if (!phone || !/^\d{7,15}$/.test(phone)) {
            toast.error("Please enter a valid phone number (digits only)");
            return;
        }

        if (!currentUser) {
            toast.error("You must be logged in");
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch(`${API_BASE_URL}/create_sponsorship_request.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sponsor_id: currentUser.id,
                    event_id: event.id,
                    amount: amount,
                    contact_email: email,
                    contact_phone: phone,
                    message: message
                })
            });
            const data = await res.json();

            if (data.status === 'success') {
                toast.success("Sponsorship request sent successfully!");
                onClose();
                setAmount("");
                setContactPhone("");
                setMessage("");
            } else {
                toast.error(data.message || "Failed to send request");
            }
        } catch (err) {
            console.error("Error sending sponsorship request:", err);
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
                        <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl w-full max-w-md pointer-events-auto shadow-2xl overflow-hidden">
                            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                                <div>
                                    <h3 className="text-xl font-bold text-white">Sponsor Event</h3>
                                    <p className="text-xs text-gray-400 mt-1">Make an offer to sponsor <span className="text-white font-medium">{event?.title}</span></p>
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Sponsorship Amount ($)</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                                        <input
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            placeholder="5000"
                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 pl-10 text-white focus:border-accent1 outline-none font-mono text-lg"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Contact Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="email"
                                                required
                                                value={contactEmail}
                                                onChange={(e) => setContactEmail(e.target.value)}
                                                placeholder="you@company.com"
                                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 pl-10 text-white focus:border-accent1 outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Contact Phone</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="tel"
                                                required
                                                value={contactPhone}
                                                onChange={(e) => setContactPhone(e.target.value.replace(/\D/g, ""))}
                                                placeholder="0123456789"
                                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 pl-10 text-white focus:border-accent1 outline-none"
                                            />
                                        </div>
                                        <p className="mt-1 text-[10px] text-gray-500">Digits only (7-15)</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Message to Organizer (Optional)</label>
                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Tell them why you want to sponsor..."
                                        rows={3}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-accent1 outline-none resize-none"
                                    />
                                </div>
                            </div>

                            <div className="p-6 border-t border-white/10 bg-white/5 flex justify-end gap-3">
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors text-sm font-bold"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                    className="flex items-center gap-2 px-6 py-2 bg-yellow-500 text-black rounded-lg font-bold text-sm hover:bg-yellow-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                    Send Offer
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
