"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Save, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { ENDPOINTS } from "@/lib/api_config";

type EditableLeaderboardRow = {
    id: string;
    user_id: string;
    participant_name: string;
    avatar?: string | null;
    institution?: string | null;
    position: number;
    points: number;
};

interface EditLeaderboardModalProps {
    isOpen: boolean;
    onClose: () => void;
    eventId: string;
    organizerId: string;
    onSaved?: () => void;
}

export function EditLeaderboardModal({ isOpen, onClose, eventId, organizerId, onSaved }: EditLeaderboardModalProps) {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [rows, setRows] = useState<EditableLeaderboardRow[]>([]);

    const sorted = useMemo(() => {
        return [...rows].sort((a, b) => a.position - b.position || a.participant_name.localeCompare(b.participant_name));
    }, [rows]);

    useEffect(() => {
        if (!isOpen) return;
        if (!eventId || !organizerId) return;

        const fetchRows = async () => {
            setLoading(true);
            try {
                const url = ENDPOINTS.GET_LEADERBOARD_FOR_EDIT(eventId, organizerId);
                const res = await fetch(url);
                const data = await res.json();
                if (data?.status === "success" && Array.isArray(data.data)) {
                    const mapped = data.data.map((r: any) => ({
                        id: String(r.id),
                        user_id: String(r.user_id),
                        participant_name: String(r.participant_name || ""),
                        avatar: r.avatar ?? null,
                        institution: r.institution ?? null,
                        position: Number(r.position || 0),
                        points: Number(r.points || 0)
                    })) as EditableLeaderboardRow[];
                    setRows(mapped);
                } else {
                    setRows([]);
                    toast.error(data?.message || "Failed to load leaderboard");
                }
            } catch (err) {
                console.error(err);
                setRows([]);
                toast.error("Network error loading leaderboard");
            } finally {
                setLoading(false);
            }
        };

        fetchRows();
    }, [isOpen, eventId, organizerId]);

    const updateRow = (id: string, patch: Partial<Pick<EditableLeaderboardRow, "position" | "points">>) => {
        setRows((prev) =>
            prev.map((r) => (r.id === id ? { ...r, ...patch } : r))
        );
    };

    const handleSave = async () => {
        if (rows.length === 0) return;
        setSaving(true);
        try {
            const payload = {
                event_id: eventId,
                organizer_id: organizerId,
                entries: rows.map((r) => ({
                    id: r.id,
                    position: Number.isFinite(r.position) ? Math.max(1, Math.trunc(r.position)) : 1,
                    points: Number.isFinite(r.points) ? Math.max(0, Math.trunc(r.points)) : 0
                }))
            };
            const res = await fetch(ENDPOINTS.UPDATE_LEADERBOARD, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data?.status === "success") {
                toast.success("Leaderboard updated");
                onSaved?.();
                onClose();
                return;
            }
            toast.error(data?.message || "Failed to update leaderboard");
        } catch (err) {
            console.error(err);
            toast.error("Network error updating leaderboard");
        } finally {
            setSaving(false);
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
                        initial={{ opacity: 0, scale: 0.98, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl w-full max-w-3xl pointer-events-auto overflow-hidden max-h-[90vh] flex flex-col">
                            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                                <div>
                                    <h3 className="text-xl font-bold text-white">Edit Leaderboard</h3>
                                    <p className="text-xs text-gray-400 mt-1">Only the event organizer can edit.</p>
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>

                            <div className="p-6 overflow-auto">
                                {loading ? (
                                    <div className="text-gray-500 text-sm flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" /> Loading leaderboard...
                                    </div>
                                ) : sorted.length === 0 ? (
                                    <div className="text-gray-500 text-sm flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4" /> No participants found for this event yet.
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-12 gap-3 text-xs font-bold uppercase text-gray-500 tracking-wider px-2">
                                            <div className="col-span-6">Participant</div>
                                            <div className="col-span-3 text-right">Position</div>
                                            <div className="col-span-3 text-right">Points</div>
                                        </div>

                                        <div className="divide-y divide-white/5 border border-white/10 rounded-xl overflow-hidden">
                                            {sorted.map((r) => (
                                                <div key={r.id} className="grid grid-cols-12 gap-3 items-center p-3 bg-black/30">
                                                    <div className="col-span-6 flex items-center gap-3 min-w-0">
                                                        <div className="w-9 h-9 rounded-full bg-black border border-white/10 overflow-hidden flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                                                            {r.avatar ? (
                                                                <img src={r.avatar} alt={r.participant_name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <span>{r.participant_name.substring(0, 2).toUpperCase()}</span>
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="text-white font-bold truncate">{r.participant_name}</div>
                                                            <div className="text-xs text-gray-500 truncate">{r.institution || "—"}</div>
                                                        </div>
                                                    </div>

                                                    <div className="col-span-3 flex justify-end">
                                                        <input
                                                            type="number"
                                                            min={1}
                                                            value={r.position}
                                                            onChange={(e) => updateRow(r.id, { position: parseInt(e.target.value || "1", 10) })}
                                                            className="w-24 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm text-right focus:border-accent1 outline-none"
                                                        />
                                                    </div>
                                                    <div className="col-span-3 flex justify-end">
                                                        <input
                                                            type="number"
                                                            min={0}
                                                            value={r.points}
                                                            onChange={(e) => updateRow(r.id, { points: parseInt(e.target.value || "0", 10) })}
                                                            className="w-28 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm text-right font-mono focus:border-accent1 outline-none"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="p-6 border-t border-white/10 bg-white/5 flex justify-end gap-3">
                                <button
                                    onClick={onClose}
                                    disabled={saving}
                                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors text-sm font-bold disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving || loading || sorted.length === 0}
                                    className="flex items-center gap-2 px-6 py-2 bg-accent1 text-black rounded-lg font-bold text-sm hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Save
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

