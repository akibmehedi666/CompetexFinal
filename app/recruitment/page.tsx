"use client";

import { useEffect, useMemo, useState } from "react";
import { Navbar } from "@/components/ui/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Trophy, Users, Calendar, X, Send, Loader2, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/store/useStore";
import { useRouter, useSearchParams } from "next/navigation";
import { ENDPOINTS } from "@/lib/api_config";
import { toast } from "sonner";

export default function RecruitmentPage() {
    const { currentUser, initAuth } = useStore();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [loadingData, setLoadingData] = useState(true);
    const [topParticipantsByEvent, setTopParticipantsByEvent] = useState<any[]>([]);
    const [topTeamsByEvent, setTopTeamsByEvent] = useState<any[]>([]);

    const [postJobOpen, setPostJobOpen] = useState(false);
    const [posting, setPosting] = useState(false);
    const [jobForm, setJobForm] = useState({
        title: "",
        company_name: "",
        location: "",
        salary_range: "",
        employment_type: "Full-time",
        deadline: "",
        description: "",
        tags: ""
    });

    useEffect(() => {
        initAuth();
    }, [initAuth]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (!currentUser) {
                router.push("/login");
            } else if (currentUser.role !== "Recruiter") {
                router.push("/dashboard");
            } else {
                setIsLoading(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [currentUser, router]);

    useEffect(() => {
        if (!currentUser?.id || currentUser.role !== "Recruiter") return;

        const fetchScoutData = async () => {
            setLoadingData(true);
            try {
                const res = await fetch(ENDPOINTS.GET_RECRUITMENT_SCOUT_DATA(currentUser.id));
                const data = await res.json();
                if (data?.status === "success") {
                    setTopParticipantsByEvent(Array.isArray(data?.data?.top_participants_by_event) ? data.data.top_participants_by_event : []);
                    setTopTeamsByEvent(Array.isArray(data?.data?.top_teams_by_event) ? data.data.top_teams_by_event : []);
                } else {
                    setTopParticipantsByEvent([]);
                    setTopTeamsByEvent([]);
                }
            } catch (err) {
                console.error(err);
                setTopParticipantsByEvent([]);
                setTopTeamsByEvent([]);
                toast.error("Failed to load scouting data");
            } finally {
                setLoadingData(false);
            }
        };

        fetchScoutData();
    }, [currentUser?.id, currentUser?.role]);

    useEffect(() => {
        if (searchParams.get("postJob") === "1") {
            setPostJobOpen(true);
        }
    }, [searchParams]);

    const filteredParticipantsByEvent = useMemo(() => {
        const q = search.toLowerCase();
        return topParticipantsByEvent.filter((e) => String(e.event_title || "").toLowerCase().includes(q));
    }, [topParticipantsByEvent, search]);

    const filteredTeamsByEvent = useMemo(() => {
        const q = search.toLowerCase();
        return topTeamsByEvent.filter((e) => String(e.event_title || "").toLowerCase().includes(q));
    }, [topTeamsByEvent, search]);

    const closePostJob = () => setPostJobOpen(false);

    const handleJobChange = (key: string, value: string) => {
        setJobForm((prev) => ({ ...prev, [key]: value }));
    };

    const submitJob = async () => {
        if (!currentUser?.id) return;
        if (!jobForm.title.trim() || !jobForm.location.trim() || !jobForm.description.trim()) {
            toast.error("Title, location, and description are required.");
            return;
        }

        setPosting(true);
        try {
            const tags = jobForm.tags
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean);

            const res = await fetch(ENDPOINTS.CREATE_JOB_POSTING, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    recruiter_id: currentUser.id,
                    title: jobForm.title.trim(),
                    company_name: jobForm.company_name.trim() || null,
                    location: jobForm.location.trim(),
                    salary_range: jobForm.salary_range.trim() || null,
                    employment_type: jobForm.employment_type,
                    deadline: jobForm.deadline.trim() || null,
                    description: jobForm.description.trim(),
                    tags
                })
            });
            const data = await res.json();
            if (data?.status === "success") {
                toast.success("Job posted");
                setJobForm({
                    title: "",
                    company_name: "",
                    location: "",
                    salary_range: "",
                    employment_type: "Full-time",
                    deadline: "",
                    description: "",
                    tags: ""
                });
                closePostJob();
                router.push("/jobs");
                return;
            }
            toast.error(data?.message || "Failed to post job");
        } catch (err) {
            console.error(err);
            toast.error("Network error posting job");
        } finally {
            setPosting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-purple-500 animate-pulse font-bold text-xl">Accessing Secure Channel...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black selection:bg-purple-500/30">
            <Navbar />

            <AnimatePresence>
                {postJobOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closePostJob}
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98, y: 20 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                        >
                            <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl w-full max-w-2xl pointer-events-auto overflow-hidden">
                                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Post a Job</h3>
                                        <p className="text-xs text-gray-400 mt-1">Your job will appear on the Job Board.</p>
                                    </div>
                                    <button onClick={closePostJob} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                                        <X className="w-5 h-5 text-gray-400" />
                                    </button>
                                </div>

                                <div className="p-6 space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Title</label>
                                            <input
                                                value={jobForm.title}
                                                onChange={(e) => handleJobChange("title", e.target.value)}
                                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-3 text-white focus:border-purple-400 outline-none"
                                                placeholder="Senior Frontend Developer"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Company</label>
                                            <input
                                                value={jobForm.company_name}
                                                onChange={(e) => handleJobChange("company_name", e.target.value)}
                                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-3 text-white focus:border-purple-400 outline-none"
                                                placeholder="Your company"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Location</label>
                                            <input
                                                value={jobForm.location}
                                                onChange={(e) => handleJobChange("location", e.target.value)}
                                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-3 text-white focus:border-purple-400 outline-none"
                                                placeholder="Dhaka / Remote"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Employment Type</label>
                                            <select
                                                value={jobForm.employment_type}
                                                onChange={(e) => handleJobChange("employment_type", e.target.value)}
                                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-3 text-white focus:border-purple-400 outline-none"
                                            >
                                                <option value="Full-time">Full-time</option>
                                                <option value="Internship">Internship</option>
                                                <option value="Part-time">Part-time</option>
                                                <option value="Contract">Contract</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Salary Range</label>
                                            <input
                                                value={jobForm.salary_range}
                                                onChange={(e) => handleJobChange("salary_range", e.target.value)}
                                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-3 text-white focus:border-purple-400 outline-none"
                                                placeholder="$1200 - $2000"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Deadline (Optional)</label>
                                            <input
                                                value={jobForm.deadline}
                                                onChange={(e) => handleJobChange("deadline", e.target.value)}
                                                type="datetime-local"
                                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-3 text-white focus:border-purple-400 outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Description</label>
                                        <textarea
                                            value={jobForm.description}
                                            onChange={(e) => handleJobChange("description", e.target.value)}
                                            rows={5}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-purple-400 outline-none resize-none"
                                            placeholder="Describe the role, responsibilities, and requirements..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Tags (comma separated)</label>
                                        <input
                                            value={jobForm.tags}
                                            onChange={(e) => handleJobChange("tags", e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-3 text-white focus:border-purple-400 outline-none"
                                            placeholder="React, Node.js, SQL"
                                        />
                                    </div>
                                </div>

                                <div className="p-6 border-t border-white/10 bg-white/5 flex justify-end gap-3">
                                    <button
                                        onClick={closePostJob}
                                        disabled={posting}
                                        className="px-4 py-2 text-gray-400 hover:text-white transition-colors text-sm font-bold disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={submitJob}
                                        disabled={posting}
                                        className="flex items-center gap-2 px-6 py-2 bg-purple-500 text-white rounded-lg font-bold text-sm hover:bg-purple-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                        Post Job
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <div className="relative pt-20 pb-10 overflow-hidden border-b border-white/10 flex flex-col justify-center min-h-[40vh]">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-600/20 blur-[150px] rounded-full pointer-events-none" />

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="flex flex-col md:flex-row items-end justify-between gap-8">
                        <div>
                            <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
                                Scout <span className="text-purple-400">Elite Talent</span>
                            </h1>
                            <p className="text-gray-400 max-w-xl text-lg">
                                Scout the top performers from every event leaderboard and team contest.
                            </p>
                        </div>

                        <div className="w-full md:w-auto flex flex-col gap-4 bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-md">
                            <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
                                <Filter className="w-3 h-3" /> Filters
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Search events..."
                                        className="w-full bg-black/20 border border-white/5 rounded-lg py-2 pl-10 pr-3 text-sm text-white focus:border-purple-400 outline-none"
                                    />
                                </div>
                                <button
                                    onClick={() => setPostJobOpen(true)}
                                    className="px-4 py-2 rounded-lg text-sm font-bold transition-colors border bg-purple-500/20 text-purple-300 border-purple-500/40 hover:bg-purple-500/30 flex items-center justify-center gap-2 whitespace-nowrap"
                                >
                                    <Briefcase className="w-4 h-4" /> Post Job
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-16">
                {loadingData ? (
                    <div className="text-center py-24 text-gray-500">Loading scouting results...</div>
                ) : (
                    <div className="space-y-14">
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                <Trophy className="w-6 h-6 text-purple-400" /> Top Participants (Per Event)
                            </h2>

                            {filteredParticipantsByEvent.length === 0 ? (
                                <div className="text-gray-500 text-sm border border-dashed border-white/10 rounded-xl p-8">
                                    No leaderboard participant data found yet.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {filteredParticipantsByEvent.map((ev) => (
                                        <div key={ev.event_id} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                            <div className="flex items-start justify-between gap-4 mb-4">
                                                <div>
                                                    <div className="text-xs font-bold text-purple-300 uppercase tracking-widest">{ev.category || "Event"}</div>
                                                    <h3 className="text-xl font-bold text-white">{ev.event_title}</h3>
                                                    <div className="text-sm text-gray-400 flex items-center gap-4 mt-1">
                                                        <span className="flex items-center gap-2">
                                                            <Calendar className="w-4 h-4 text-purple-400" /> {ev.date_display || (ev.start_date ? new Date(ev.start_date).toLocaleDateString() : "—")}
                                                        </span>
                                                        <span className="text-xs uppercase font-bold text-gray-500">{ev.status || ""}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                {(ev.winners || []).map((w: any) => (
                                                    <div key={w.user_id} className="flex items-center justify-between bg-black/30 border border-white/5 rounded-xl p-3">
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <div className="w-9 h-9 rounded-full bg-black border border-white/10 overflow-hidden flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                                                                {w.avatar ? (
                                                                    <img src={w.avatar} alt={w.name} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <span>{String(w.name || "U").substring(0, 2).toUpperCase()}</span>
                                                                )}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <div className="text-white font-bold truncate">#{w.rank} {w.name}</div>
                                                                <div className="text-xs text-gray-500 truncate">{w.university || "—"}</div>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-xs text-gray-500 uppercase font-bold">Points</div>
                                                            <div className="text-purple-300 font-mono font-bold">{w.points}</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                <Users className="w-6 h-6 text-purple-400" /> Top Teams (Team Contests)
                            </h2>

                            {filteredTeamsByEvent.length === 0 ? (
                                <div className="text-gray-500 text-sm border border-dashed border-white/10 rounded-xl p-8">
                                    No team contest data found yet.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {filteredTeamsByEvent.map((ev) => (
                                        <div key={ev.event_id} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                            <div className="flex items-start justify-between gap-4 mb-4">
                                                <div>
                                                    <div className="text-xs font-bold text-purple-300 uppercase tracking-widest">{ev.category || "Event"}</div>
                                                    <h3 className="text-xl font-bold text-white">{ev.event_title}</h3>
                                                    <div className="text-sm text-gray-400 flex items-center gap-4 mt-1">
                                                        <span className="flex items-center gap-2">
                                                            <Calendar className="w-4 h-4 text-purple-400" /> {ev.date_display || (ev.start_date ? new Date(ev.start_date).toLocaleDateString() : "—")}
                                                        </span>
                                                        <span className="text-xs uppercase font-bold text-gray-500">{ev.status || ""}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                {(ev.teams || []).map((t: any) => (
                                                    <div key={t.team_id} className="bg-black/30 border border-white/5 rounded-xl p-4">
                                                        <div className="flex items-start justify-between gap-4">
                                                            <div>
                                                                <div className="text-white font-bold">#{t.rank} {t.team_name}</div>
                                                                <div className="text-xs text-gray-500 mt-1">Members:</div>
                                                                <div className="flex flex-wrap gap-2 mt-2">
                                                                    {(t.members || []).map((m: any) => (
                                                                        <span
                                                                            key={m.user_id}
                                                                            className={cn(
                                                                                "px-2 py-1 rounded-full text-xs border",
                                                                                m.is_leader ? "bg-purple-500/20 text-purple-200 border-purple-500/30" : "bg-white/5 text-gray-300 border-white/10"
                                                                            )}
                                                                        >
                                                                            {m.name}{m.is_leader ? " (L)" : ""}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="text-xs text-gray-500 uppercase font-bold">Score</div>
                                                                <div className="text-purple-300 font-mono font-bold">{t.score}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

