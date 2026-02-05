"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, UserPlus, Shield, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface TeamInvitationModalProps {
    isOpen: boolean;
    onClose: () => void;
    teamId: string;
    currentUser: any;
}

export function TeamInvitationModal({ isOpen, onClose, teamId, currentUser }: TeamInvitationModalProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [inviting, setInviting] = useState<string | null>(null);

    const fetchParticipants = useCallback(async (query: string) => {
        setLoading(true);
        try {
            const excludeId = currentUser?.id ? `&exclude_user_id=${encodeURIComponent(currentUser.id)}` : "";
            const url = `http://localhost/Competex/api/search_participants.php?q=${encodeURIComponent(query)}&team_id=${encodeURIComponent(teamId)}${excludeId}`;

            const res = await fetch(url);
            const data = await res.json();
            if (data.status === 'success') {
                setResults(data.data);
            } else {
                setResults([]);
            }
        } catch (error) {
            console.error("Search error:", error);
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, [currentUser?.id, teamId]);

    useEffect(() => {
        if (!isOpen) {
            setSearchQuery("");
            setResults([]);
            setLoading(false);
            setInviting(null);
            return;
        }

        fetchParticipants("");
    }, [isOpen, teamId, fetchParticipants]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (!isOpen) return;

            if (searchQuery.length === 0) {
                fetchParticipants("");
                return;
            }

            if (searchQuery.length > 1) {
                fetchParticipants(searchQuery);
                return;
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, isOpen]);

    const handleInvite = async (userId: string) => {
        setInviting(userId);
        try {
            const res = await fetch('http://localhost/Competex/api/invite_participant.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    team_id: teamId,
                    sender_id: currentUser.id,
                    receiver_id: userId
                })
            });
            const data = await res.json();

            if (data.status === 'success') {
                toast.success("Invitation sent successfully!");
                // Optionally remove user from list or show invited status
                setResults(prev => prev.filter(u => u.id !== userId));
            } else {
                toast.error(data.message || "Failed to invite user");
            }
        } catch (error) {
            toast.error("Network error sending invite");
        } finally {
            setInviting(null);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full max-w-md bg-[#0D0D0D] border border-white/10 rounded-xl shadow-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                        <div>
                            <h3 className="text-xl font-bold text-white">Invite Members</h3>
                            <p className="text-xs text-gray-400">Search and invite participants to your team</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                            <X className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>

                    {/* Search */}
                    <div className="p-4 border-b border-white/5">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:border-accent1 focus:ring-1 focus:ring-accent1 outline-none transition-all placeholder:text-gray-600"
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Results List */}
                    <div className="max-h-[300px] overflow-y-auto p-2">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                                <Loader2 className="w-6 h-6 animate-spin mb-2" />
                                <span className="text-xs">Searching...</span>
                            </div>
                        ) : results.length > 0 ? (
                            <div className="space-y-1">
                                {results.map((user) => (
                                    <div key={user.id} className="flex items-center justify-between p-3 hover:bg-white/5 rounded-lg transition-colors group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden border border-white/10">
                                                {user.avatar ? (
                                                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">
                                                        {user.name.substring(0, 2).toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-white group-hover:text-accent1 transition-colors">{user.name}</h4>
                                                {/* Parsing skills if it's a string, assuming regex or json parse if needed but simplified for display */}
                                                <p className="text-xs text-gray-500 truncate max-w-[150px]">
                                                    {(() => {
                                                        try {
                                                            const skills = typeof user.skills === 'string' ? JSON.parse(user.skills) : user.skills;
                                                            return Array.isArray(skills) ? skills.slice(0, 3).join(", ") : "Participant";
                                                        } catch { return "Participant" }
                                                    })()}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleInvite(user.id)}
                                            disabled={inviting === user.id}
                                            className="px-3 py-1.5 bg-white/5 hover:bg-accent1 hover:text-black border border-white/10 rounded-lg text-xs font-bold transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {inviting === user.id ? (
                                                <Loader2 className="w-3 h-3 animate-spin" />
                                            ) : (
                                                <UserPlus className="w-3 h-3" />
                                            )}
                                            Invite
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : searchQuery.length > 1 ? (
                            <div className="text-center py-8 text-gray-500">
                                <p className="text-sm">No participants found.</p>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-600">
                                <p className="text-xs">No participants to show.</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
