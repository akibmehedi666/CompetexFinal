"use client";

import { useState, useMemo, useEffect } from "react";
import { Navbar } from "@/components/ui/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Users, MapPin, Trophy, Shield, ArrowRight, MessageSquare, ExternalLink } from "lucide-react";
// import { TALENT_POOL } from "@/constants/talentData";
import { CompetitionDropdown } from "@/components/ui/CompetitionDropdown";
import { User } from "@/types";
import Link from "next/link";
import { useStore } from "@/store/useStore";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

export default function PeopleDirectory() {
    const [participants, setParticipants] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCompetition, setSelectedCompetition] = useState("All Competitions");
    const { setActiveDirectMessageUser, currentUser } = useStore();
    const searchParams = useSearchParams();
    const inviteTeamIdParam = searchParams.get("invite_team_id");
    const inviteTeamId = inviteTeamIdParam && inviteTeamIdParam !== "undefined" ? inviteTeamIdParam : null;
    const [invitingUserId, setInvitingUserId] = useState<string | null>(null);

    useEffect(() => {
        async function fetchParticipants() {
            try {
                const params = new URLSearchParams();
                if (inviteTeamId) {
                    params.set("team_id", inviteTeamId);
                    if (currentUser?.id) params.set("exclude_user_id", currentUser.id);
                }

                const url = params.toString().length > 0
                    ? `http://localhost/Competex/api/get_all_participants.php?${params.toString()}`
                    : "http://localhost/Competex/api/get_all_participants.php";

                const response = await fetch(url);
                const data = await response.json();
                if (Array.isArray(data)) {
                    setParticipants(data);
                }
            } catch (error) {
                console.error("Failed to fetch participants:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchParticipants();
    }, [inviteTeamId, currentUser?.id]);

    const handleInvite = async (receiverId: string) => {
        if (!inviteTeamId) return;
        if (!currentUser?.id) {
            toast.error("Please login to send invites.");
            return;
        }

        setInvitingUserId(receiverId);
        try {
            const res = await fetch("http://localhost/Competex/api/invite_participant.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    team_id: inviteTeamId,
                    sender_id: currentUser.id,
                    receiver_id: receiverId
                })
            });
            const data = await res.json();
            if (data.status === "success") {
                toast.success("Invitation sent!");
                setParticipants(prev => prev.filter(p => p.id !== receiverId));
            } else {
                toast.error(data.message || "Failed to send invitation");
            }
        } catch {
            toast.error("Network error sending invite");
        } finally {
            setInvitingUserId(null);
        }
    };

    // Dynamically derive competitions
    const competitions = useMemo(() => {
        const comps = new Set<string>();
        participants.forEach(u => u.competitions?.forEach(c => comps.add(c)));
        return ["All Competitions", ...Array.from(comps)];
    }, [participants]);

    const filteredUsers = participants.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
            user.university?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCompetition = selectedCompetition === "All Competitions" ||
            user.competitions?.includes(selectedCompetition);

        return matchesSearch && matchesCompetition;
    });

    return (
        <main className="min-h-screen bg-black overflow-x-hidden">
            <Navbar />

            <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <motion.h1
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight"
                        >
                            The <span className="text-accent1 italic">Community</span>
                        </motion.h1>
                        {inviteTeamId && (
                            <div className="mb-4 inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-accent1/10 border border-accent1/20 text-accent1 text-xs font-bold uppercase tracking-widest">
                                Invite Mode • Select members to invite
                            </div>
                        )}
                        <motion.p
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-gray-400 text-lg max-w-xl"
                        >
                            Discover world-class talent, find collaborators, and connect with global leaders in tech and design.
                        </motion.p>
                    </div>
                </div>

                {/* Filters Row */}
                <div className="flex flex-col lg:flex-row gap-4 mb-10 items-start lg:items-center">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-hover:text-accent1 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by name, skill, or university..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-gray-600 focus:border-accent1/50 focus:outline-none transition-all"
                        />
                    </div>

                    <CompetitionDropdown
                        competitions={competitions}
                        selected={selectedCompetition}
                        onSelect={setSelectedCompetition}
                        counts={competitions.reduce((acc, comp) => {
                            acc[comp] = comp === "All Competitions"
                                ? participants.length
                                : participants.filter(t => t.competitions?.includes(comp)).length;
                            return acc;
                        }, {} as Record<string, number>)}
                        label="Interest:"
                    />
                </div>

                {/* Loading State */}
                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent1"></div>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <AnimatePresence mode="popLayout">
                                {filteredUsers.map((user, idx) => (
                                    <motion.div
                                        key={user.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.2, delay: idx * 0.05 }}
                                    >
                                        <CommunityCard
                                            user={user}
                                            inviteMode={Boolean(inviteTeamId)}
                                            inviting={invitingUserId === user.id}
                                            onInvite={() => handleInvite(user.id)}
                                            onMessage={() => setActiveDirectMessageUser(user)}
                                        />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {filteredUsers.length === 0 && (
                            <div className="text-center py-20 bg-white/5 border border-white/10 rounded-3xl">
                                <Users className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-white mb-2">No agents found</h3>
                                <p className="text-gray-500">Try adjusting your filters or search terms.</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </main>
    );
}

function CommunityCard({
    user,
    inviteMode,
    inviting,
    onInvite,
    onMessage
}: {
    user: User;
    inviteMode: boolean;
    inviting: boolean;
    onInvite: () => void;
    onMessage: () => void;
}) {
    return (
        <div className="group relative bg-[#0D0D0D] border border-white/10 rounded-2xl p-6 transition-all hover:border-accent1/40 hover:shadow-[0_0_30px_rgba(0,229,255,0.1)] overflow-hidden">
            {/* Hover visual effect */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent1/5 rounded-full blur-[40px] -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                    <div className="relative">
                        <div className="w-16 h-16 rounded-full border border-white/10 p-0.5 overflow-hidden group-hover:border-accent1/50 transition-colors">
                            <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                        </div>
                        {user.verified && (
                            <div className="absolute -bottom-1 -right-1 bg-black rounded-full p-1 border border-white/10">
                                <Shield className="w-4 h-4 text-accent1" />
                            </div>
                        )}
                    </div>
                    <Link
                        href={`/people/${user.id}`}
                        className="p-2 bg-white/5 rounded-full text-gray-500 hover:text-white hover:bg-white/10 transition-all"
                    >
                        <ExternalLink className="w-4 h-4" />
                    </Link>
                </div>

                <Link href={`/people/${user.id}`} className="block group/name">
                    <h3 className="text-xl font-bold text-white mb-1 group-hover/name:text-accent1 transition-colors">{user.name}</h3>
                </Link>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-widest mb-4 flex items-center gap-2">
                    <MapPin className="w-3 h-3" /> {user.university || 'Global Agent'}
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                    {user.skills.slice(0, 3).map(skill => (
                        <span key={skill} className="px-2 py-1 bg-white/5 border border-white/5 text-[10px] text-gray-400 rounded-md">
                            {skill}
                        </span>
                    ))}
                    {user.skills.length > 3 && (
                        <span className="text-[10px] text-gray-600 flex items-center">+{user.skills.length - 3}</span>
                    )}
                </div>

                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                    <div className="flex items-center gap-4">
                        <div className="text-center">
                            <div className="text-sm font-bold text-white uppercase">{user.stats?.eventsWon || 0}</div>
                            <div className="text-[9px] text-gray-600 font-bold uppercase tracking-tighter">Wins</div>
                        </div>
                        <div className="text-center">
                            <div className="text-sm font-bold text-accent1">#{user.stats?.rank || 999}</div>
                            <div className="text-[9px] text-gray-600 font-bold uppercase tracking-tighter">Rank</div>
                        </div>
                    </div>

                    {inviteMode ? (
                        <button
                            onClick={onInvite}
                            disabled={inviting}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 border rounded-lg text-xs font-bold uppercase tracking-widest transition-all",
                                inviting
                                    ? "bg-white/5 border-white/10 text-gray-500 cursor-not-allowed"
                                    : "bg-accent1/10 hover:bg-accent1 hover:text-black border-accent1/30 hover:border-accent1 text-accent1"
                            )}
                        >
                            Invite
                        </button>
                    ) : (
                        <button
                            onClick={onMessage}
                            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-accent1 hover:text-black border border-white/10 hover:border-accent1 text-gray-300 text-xs font-bold uppercase tracking-widest rounded-lg transition-all"
                        >
                            <MessageSquare className="w-3 h-3" /> Contact
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
