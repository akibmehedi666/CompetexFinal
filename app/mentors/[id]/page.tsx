"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/ui/Navbar";
import { ENDPOINTS } from "@/lib/api_config";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Star, MapPin, Share2, MessageSquare, Globe, Linkedin, CheckCircle, Send, Loader2 } from "lucide-react";
import { useStore } from "@/store/useStore";

type MentorApiRow = {
    mentor_profile_id: string;
    user_id: string;
    name: string;
    position?: string | null;
    company_name?: string | null;
    location?: string | null;
    avatar?: string | null;
    bio?: string | null;
    expertise: string[];
    linkedin?: string | null;
    website?: string | null;
    verified?: boolean;
};

export default function MentorProfilePage() {
    const params = useParams();
    const router = useRouter();
    const { currentUser, initAuth } = useStore();

    const mentorProfileId = useMemo(() => (Array.isArray(params.id) ? params.id[0] : params.id), [params.id]);

    const [mentor, setMentor] = useState<MentorApiRow | null>(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [topic, setTopic] = useState("");
    const [slots, setSlots] = useState("");
    const [sending, setSending] = useState(false);

    useEffect(() => {
        initAuth();
    }, [initAuth]);

    useEffect(() => {
        if (!mentorProfileId) return;
        const fetchMentor = async () => {
            setLoading(true);
            try {
                const res = await fetch(ENDPOINTS.GET_MENTOR(mentorProfileId));
                const data = await res.json();
                if (data?.status === "success" && data.data) {
                    const m = data.data;
                    setMentor({
                        mentor_profile_id: String(m.mentor_profile_id),
                        user_id: String(m.user_id),
                        name: String(m.name || ""),
                        position: m.position ?? null,
                        company_name: m.company_name ?? null,
                        location: m.location ?? null,
                        avatar: m.avatar ?? null,
                        bio: m.bio ?? null,
                        expertise: Array.isArray(m.expertise) ? m.expertise : [],
                        linkedin: m.linkedin ?? null,
                        website: m.website ?? null,
                        verified: Boolean(m.verified)
                    });
                } else {
                    setMentor(null);
                }
            } catch (err) {
                console.error(err);
                setMentor(null);
            } finally {
                setLoading(false);
            }
        };
        fetchMentor();
    }, [mentorProfileId]);

    const canRequest = currentUser?.role === "Participant";

    const sendRequest = async () => {
        if (!mentor || !currentUser?.id) return;
        if (!canRequest) {
            toast.error("Only participants can request mentorship.");
            return;
        }
        if (!message.trim()) {
            toast.error("Please write a message.");
            return;
        }

        const proposed_slots = slots
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean);

        setSending(true);
        try {
            const res = await fetch(ENDPOINTS.CREATE_MENTORSHIP_REQUEST, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    mentor_profile_id: mentor.mentor_profile_id,
                    mentee_id: currentUser.id,
                    message: message.trim(),
                    topic: topic.trim() || null,
                    proposed_slots
                })
            });
            const data = await res.json();
            if (data?.status === "success") {
                toast.success("Mentorship request sent");
                setMessage("");
                setTopic("");
                setSlots("");
                return;
            }
            toast.error(data?.message || "Failed to send request");
        } catch (err) {
            console.error(err);
            toast.error("Network error sending request");
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>;
    }

    if (!mentor) {
        return <div className="min-h-screen bg-black flex items-center justify-center text-white">Mentor not found.</div>;
    }

    const avatar = mentor.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(mentor.name || "Mentor")}`;
    const title = mentor.position || "Mentor";
    const org = mentor.company_name || "CompeteX";

    return (
        <div className="min-h-screen bg-black text-white selection:bg-accent1 selection:text-black">
            <Navbar />

            <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white/5 border border-white/10 rounded-2xl p-6 sticky top-24"
                        >
                            <div className="flex flex-col items-center text-center">
                                <div className="relative mb-6">
                                    <div className="w-32 h-32 rounded-full border-2 border-accent1/50 p-1 overflow-hidden">
                                        <img src={avatar} alt={mentor.name} className="w-full h-full object-cover rounded-full" />
                                    </div>
                                    {mentor.verified && (
                                        <div className="absolute bottom-1 right-1 bg-accent1 text-black p-1.5 rounded-full border-4 border-black" title="Verified Mentor">
                                            <CheckCircle className="w-4 h-4" />
                                        </div>
                                    )}
                                </div>

                                <h1 className="text-2xl font-bold mb-1">{mentor.name}</h1>
                                <p className="text-gray-400 mb-4">{title} @ <span className="text-white">{org}</span></p>

                                <div className="flex items-center gap-4 text-sm mb-6 bg-black/40 px-4 py-2 rounded-full border border-white/5">
                                    <div className="flex items-center gap-1 text-yellow-500">
                                        <Star className="w-4 h-4 fill-current" />
                                        <span className="font-bold">—</span>
                                    </div>
                                    <span className="text-gray-600">|</span>
                                    <div className="flex items-center gap-1 text-gray-400">
                                        <MapPin className="w-4 h-4" />
                                        <span>{mentor.location || "Remote"}</span>
                                    </div>
                                </div>

                                <div className="w-full grid grid-cols-2 gap-3 mb-6">
                                    <button className="flex items-center justify-center gap-2 p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all text-sm font-medium">
                                        <Share2 className="w-4 h-4" /> Share
                                    </button>
                                    <button
                                        onClick={() => router.push("/messages")}
                                        className="flex items-center justify-center gap-2 p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all text-sm font-medium"
                                    >
                                        <MessageSquare className="w-4 h-4" /> Message
                                    </button>
                                </div>

                                <div className="flex gap-3 justify-center">
                                    {mentor.linkedin && (
                                        <a href={mentor.linkedin} target="_blank" rel="noreferrer" className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all">
                                            <Linkedin className="w-5 h-5" />
                                        </a>
                                    )}
                                    {mentor.website && (
                                        <a href={mentor.website} target="_blank" rel="noreferrer" className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all">
                                            <Globe className="w-5 h-5" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    <div className="lg:col-span-2 space-y-10">
                        <section className="bg-white/5 border border-white/10 rounded-2xl p-6 lg:p-8">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <span className="w-1 h-6 bg-accent1 rounded-full" /> About
                            </h2>
                            <p className="text-gray-300 leading-relaxed">{mentor.bio || "No bio provided."}</p>
                        </section>

                        <section className="bg-white/5 border border-white/10 rounded-2xl p-6 lg:p-8">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <span className="w-1 h-6 bg-accent1 rounded-full" /> Expertise
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {(mentor.expertise || []).map((skill) => (
                                    <span key={skill} className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-300 hover:border-accent1/50 transition-colors">
                                        {skill}
                                    </span>
                                ))}
                                {(mentor.expertise || []).length === 0 && (
                                    <span className="text-gray-500 text-sm">No expertise tags.</span>
                                )}
                            </div>
                        </section>

                        <section className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl p-6 lg:p-8">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-2">Send a Mentorship Request</h2>
                                    <p className="text-gray-400">
                                        {canRequest ? "Write a short message and propose a few time slots." : "Log in as a Participant to request mentorship."}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Topic (Optional)</label>
                                    <input
                                        value={topic}
                                        onChange={(e) => setTopic(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-3 text-white focus:border-accent1 outline-none"
                                        placeholder="Mock interview, project review, career guidance..."
                                        disabled={!canRequest || sending}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Message</label>
                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        rows={5}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-accent1 outline-none resize-none"
                                        placeholder="Explain what you need help with and your goals..."
                                        disabled={!canRequest || sending}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Proposed Slots (Optional)</label>
                                    <textarea
                                        value={slots}
                                        onChange={(e) => setSlots(e.target.value)}
                                        rows={3}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-accent1 outline-none resize-none"
                                        placeholder={"Mon 10:00 AM\nTue 2:00 PM\nThu 4:00 PM"}
                                        disabled={!canRequest || sending}
                                    />
                                </div>

                                <button
                                    onClick={sendRequest}
                                    disabled={!canRequest || sending}
                                    className={`w-full py-4 rounded-xl font-bold uppercase tracking-widest transition-all ${canRequest
                                        ? "bg-white text-black hover:scale-[1.01] shadow-xl"
                                        : "bg-white/10 text-gray-500 cursor-not-allowed"
                                        }`}
                                >
                                    {sending ? (
                                        <span className="inline-flex items-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin" /> Sending...
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-2">
                                            <Send className="w-4 h-4" /> Send Request
                                        </span>
                                    )}
                                </button>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}

