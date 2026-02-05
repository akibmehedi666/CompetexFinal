"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, Send, AlertCircle, CheckCircle } from "lucide-react";
import { SponsorshipRole } from "@/types";

interface SponsorshipRequestModalProps {
    role: SponsorshipRole | null;
    sponsorName: string;
    onClose: () => void;
    onSubmit: (data: any) => void;
}

export function SponsorshipRequestModal({ role, sponsorName, onClose, onSubmit }: SponsorshipRequestModalProps) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState("");
    const [message, setMessage] = useState("");

    // Mock Events for dropdown
    const myEvents = [
        { id: "e1", title: "CyberHack 2026", date: "Jan 24, 2026" },
        { id: "e2", title: "Inter-University Coding Contest", date: "Feb 10, 2026" }
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            setSuccess(true);
            onSubmit({ eventId: selectedEvent, message, roleId: role?.id });
        }, 1500);
    };

    if (!role) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden relative"
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                {success ? (
                    <div className="p-12 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-6">
                            <CheckCircle className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Request Sent!</h3>
                        <p className="text-gray-400 mb-8">
                            Your sponsorship request for <span className="text-white font-bold">{role.title}</span> has been sent to {sponsorName}.
                        </p>
                        <button
                            onClick={onClose}
                            className="px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors"
                        >
                            Done
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-8">
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-white mb-2">Request Sponsorship</h2>
                            <p className="text-gray-400 text-sm">
                                Applying for <span className="text-accent1 font-bold">{role.title}</span> from {sponsorName}
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Select Event</label>
                                <select
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-accent1 outline-none appearance-none"
                                    value={selectedEvent}
                                    onChange={(e) => setSelectedEvent(e.target.value)}
                                    required
                                >
                                    <option value="" disabled>Select an event...</option>
                                    {myEvents.map(ev => (
                                        <option key={ev.id} value={ev.id}>{ev.title} ({ev.date})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                <h4 className="text-sm font-bold text-white mb-3">Confirm Details</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Role Type</span>
                                        <span className="text-gray-300">{role.title}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Min. Level</span>
                                        <span className="text-gray-300">{role.minEventLevel}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Offerings</span>
                                        <span className="text-gray-300 text-right max-w-[50%]">{role.offerings.join(", ")}</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Message to Sponsor</label>
                                <textarea
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-accent1 outline-none h-32 resize-none"
                                    placeholder="Briefly explain why you are a good fit for this sponsorship role..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !selectedEvent}
                                className="w-full py-4 bg-accent1 text-black font-bold text-lg rounded-xl hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <span>Sending...</span>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5" /> Send Request
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </motion.div>
        </div>
    );
}
