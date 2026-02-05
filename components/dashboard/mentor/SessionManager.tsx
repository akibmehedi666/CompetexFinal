"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, Video, FileText, Link as LinkIcon, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/store/useStore";
import { ENDPOINTS } from "@/lib/api_config";
import { toast } from "sonner";

type MentorSessionRow = {
    id: string;
    request_id?: string | null;
    start_time?: string | null;
    duration_minutes?: string | number | null;
    meet_link?: string | null;
    status: "scheduled" | "live" | "completed" | "cancelled";
    notes?: string | null;
    topic?: string | null;
    mentee_id: string;
    mentee_name: string;
    mentee_avatar?: string | null;
};

export function SessionManager() {
    const { currentUser } = useStore();
    const [filter, setFilter] = useState<"upcoming" | "past">("upcoming");
    const [sessions, setSessions] = useState<MentorSessionRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editStart, setEditStart] = useState("");
    const [editDuration, setEditDuration] = useState("60");
    const [editMeet, setEditMeet] = useState("");
    const [saving, setSaving] = useState(false);

    const fetchSessions = async () => {
        if (!currentUser?.id) return;
        setLoading(true);
        try {
            const res = await fetch(ENDPOINTS.GET_MENTOR_SESSIONS(currentUser.id));
            const data = await res.json();
            if (data?.status === "success" && Array.isArray(data.data)) {
                setSessions(data.data);
            } else {
                setSessions([]);
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to load sessions");
            setSessions([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!currentUser?.id) return;
        fetchSessions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser?.id]);

    const filteredSessions = useMemo(() => {
        return sessions.filter((session) => {
            const start = session.start_time ? new Date(session.start_time).getTime() : null;
            const isPast = start !== null ? start < Date.now() : false;
            return filter === "upcoming"
                ? (!isPast && session.status !== "completed" && session.status !== "cancelled")
                : (isPast || session.status === "completed" || session.status === "cancelled");
        });
    }, [sessions, filter]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', weekday: 'short' }).format(date);
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(date);
    };

    const openEdit = (s: MentorSessionRow) => {
        setEditingId(s.id);
        setEditStart(s.start_time ? String(s.start_time).replace(" ", "T").slice(0, 16) : "");
        setEditDuration(String(s.duration_minutes ?? 60));
        setEditMeet(String(s.meet_link ?? ""));
    };

    const saveEdit = async () => {
        if (!currentUser?.id || !editingId) return;
        setSaving(true);
        try {
            const res = await fetch(ENDPOINTS.UPDATE_MENTORSHIP_SESSION, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    session_id: editingId,
                    mentor_user_id: currentUser.id,
                    start_time: editStart || null,
                    duration_minutes: parseInt(editDuration || "60", 10),
                    meet_link: editMeet || null,
                    status: "scheduled"
                })
            });
            const data = await res.json();
            if (data?.status === "success") {
                toast.success("Session updated");
                setEditingId(null);
                await fetchSessions();
                return;
            }
            toast.error(data?.message || "Failed to update session");
        } catch (err) {
            console.error(err);
            toast.error("Network error updating session");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Your Sessions</h2>
                <div className="bg-white/5 p-1 rounded-lg border border-white/10 flex">
                    <button
                        onClick={() => setFilter("upcoming")}
                        className={cn("px-4 py-1.5 rounded-md text-sm font-medium transition-all", filter === "upcoming" ? "bg-accent1 text-black shadow-lg" : "text-gray-400 hover:text-white")}
                    >
                        Upcoming
                    </button>
                    <button
                        onClick={() => setFilter("past")}
                        className={cn("px-4 py-1.5 rounded-md text-sm font-medium transition-all", filter === "past" ? "bg-white/10 text-white" : "text-gray-400 hover:text-white")}
                    >
                        Past
                    </button>
                </div>
            </div>

            <div className="grid gap-4">
                {loading ? (
                    <div className="text-center py-16 bg-white/5 rounded-xl border border-white/5 border-dashed text-gray-400">
                        Loading sessions...
                    </div>
                ) : filteredSessions.length > 0 ? (
                    filteredSessions.map((session) => (
                        <motion.div
                            key={session.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all group"
                        >
                            <div className="flex flex-col md:flex-row items-center gap-6">
                                {/* Date Box */}
                                <div className="flex flex-col items-center justify-center w-16 h-16 bg-black/40 border border-white/10 rounded-xl text-center">
                                    {session.start_time ? (
                                        <>
                                            <span className="text-xs text-red-500 font-bold uppercase">{new Date(session.start_time).toLocaleDateString('en-US', { month: 'short' })}</span>
                                            <span className="text-2xl font-bold text-white">{new Date(session.start_time).getDate()}</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="text-xs text-gray-500 font-bold uppercase">TBD</span>
                                            <span className="text-2xl font-bold text-white">—</span>
                                        </>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 text-center md:text-left">
                                    <h3 className="font-bold text-lg text-white mb-1">{session.topic || "Mentorship Session"}</h3>
                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-gray-400">
                                        <span className="flex items-center gap-1">
                                            <i className="w-2 h-2 rounded-full bg-accent1" />
                                            with <span className="text-white font-medium">{session.mentee_name}</span>
                                        </span>
                                        {session.start_time ? (
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                {formatTime(session.start_time)} ({Number(session.duration_minutes || 0) || 0} min)
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                Not scheduled yet
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3">
                                    {filter === "upcoming" && (
                                        <button
                                            onClick={() => openEdit(session)}
                                            className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                                        >
                                            <LinkIcon className="w-4 h-4" /> Set Details
                                        </button>
                                    )}

                                    {session.meet_link && filter === "upcoming" ? (
                                        <a
                                            href={session.meet_link}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center gap-2 px-5 py-2.5 bg-accent1 text-black font-bold rounded-lg shadow-[0_0_15px_rgba(0,229,255,0.3)] hover:shadow-[0_0_25px_rgba(0,229,255,0.5)] hover:scale-105 transition-all"
                                        >
                                            <Video className="w-4 h-4" /> Join Meet
                                        </a>
                                    ) : (
                                        <button className="flex items-center gap-2 px-4 py-2 bg-white/5 text-gray-400 rounded-lg hover:text-white hover:bg-white/10 transition-colors">
                                            <FileText className="w-4 h-4" /> Notes
                                        </button>
                                    )}
                                </div>
                            </div>

                            {editingId === session.id && (
                                <div className="mt-5 pt-5 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Start Time</label>
                                        <input
                                            type="datetime-local"
                                            value={editStart}
                                            onChange={(e) => setEditStart(e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-accent1 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Duration (min)</label>
                                        <input
                                            type="number"
                                            min={15}
                                            step={15}
                                            value={editDuration}
                                            onChange={(e) => setEditDuration(e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-accent1 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Meet Link</label>
                                        <input
                                            value={editMeet}
                                            onChange={(e) => setEditMeet(e.target.value)}
                                            placeholder="https://meet.google.com/..."
                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-accent1 outline-none"
                                        />
                                    </div>
                                    <div className="md:col-span-3 flex justify-end gap-3">
                                        <button
                                            onClick={() => setEditingId(null)}
                                            disabled={saving}
                                            className="px-4 py-2 bg-white/5 text-gray-300 rounded-lg border border-white/10 hover:bg-white/10"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={saveEdit}
                                            disabled={saving}
                                            className="flex items-center gap-2 px-5 py-2 bg-accent1 text-black font-bold rounded-lg hover:bg-white transition-all disabled:opacity-70"
                                        >
                                            <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save"}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    ))
                ) : (
                    <div className="text-center py-16 bg-white/5 rounded-xl border border-white/5 border-dashed">
                        <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-400">No {filter} sessions found.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
