

"use client";

import { motion, AnimatePresence, useDragControls } from "framer-motion";
import { Plus, X, CheckCircle, UserPlus, Users, Search, GripVertical, Trophy } from "lucide-react";
import { CompetitionDropdown } from "@/components/ui/CompetitionDropdown";
import { useState, useEffect, useRef } from "react";
import { useStore } from "@/store/useStore";
import { TALENT_POOL } from "@/constants/talentData";
import { User } from "@/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function TeamBuilder() {
    const { myTeam, addToTeam, removeFromTeam, currentUser } = useStore();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCompetition, setSelectedCompetition] = useState<string>("All Competitions");
    const [filteredTalent, setFilteredTalent] = useState<User[]>(TALENT_POOL);
    const [draggingId, setDraggingId] = useState<string | null>(null);

    // Derive available competitions from TALENT_POOL
    const competitions = ["All Competitions", ...Array.from(new Set(TALENT_POOL.flatMap(u => u.competitions || [])))];

    // Persistence on Mount
    useEffect(() => {
        const savedTeam = localStorage.getItem("competex_team_members");
        if (savedTeam) {
            const members = JSON.parse(savedTeam);
            // This is a bit hacky to sync with store, ideally store handles this.
            // But we'll just respect the store's state if it's already hydration-safe.
            // For now, let's assume store is the source of truth, and we save to LS on change.
        }
    }, []);

    // Save on Change
    useEffect(() => {
        if (myTeam?.members) {
            localStorage.setItem("competex_team_members", JSON.stringify(myTeam.members));
        }
    }, [myTeam?.members]);

    // Filter Logic
    useEffect(() => {
        const lowerSearch = searchTerm.toLowerCase();
        const filtered = TALENT_POOL.filter(user => {
            const matchesSearch = user.name.toLowerCase().includes(lowerSearch) ||
                user.skills?.some(s => s.toLowerCase().includes(lowerSearch)) ||
                user.role.toLowerCase().includes(lowerSearch);

            const matchesCompetition = selectedCompetition === "All Competitions" ||
                user.competitions?.includes(selectedCompetition);

            const notInTeam = !myTeam?.members.some(m => m.id === user.id);

            return notInTeam && matchesSearch && matchesCompetition;
        });
        setFilteredTalent(filtered);
    }, [searchTerm, selectedCompetition, myTeam?.members]);

    const handleInvite = (user: User) => {
        if ((myTeam?.members.length || 0) >= (myTeam?.maxMembers || 4)) {
            toast.error("Team is full!");
            return;
        }
        addToTeam(user);
        toast.promise(new Promise(resolve => setTimeout(resolve, 500)), {
            loading: `Sending invite to ${user.name}...`,
            success: `Invite accepted by ${user.name}!`,
            error: "Failed to send invite"
        });
    };

    const handleRemove = (userId: string) => {
        removeFromTeam(userId);
        toast.info("Teammate removed.");
    };

    const isFull = (myTeam?.members.length ?? 0) >= (myTeam?.maxMembers ?? 4);

    // If not logged in, show login prompt
    if (!currentUser) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-140px)]">
                <div className="lg:col-span-12 flex items-center justify-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-md w-full bg-white/5 border border-white/10 rounded-2xl p-8 text-center backdrop-blur-sm"
                    >
                        <div className="w-16 h-16 bg-accent1/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Users className="w-8 h-8 text-accent1" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-3">Team Builder Access Required</h2>
                        <p className="text-gray-400 mb-6">
                            You need to be logged in to build your squad and invite teammates. Join CompeteX to unlock team collaboration features.
                        </p>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => window.location.href = '/login'}
                                className="w-full py-3 bg-accent1 text-black font-bold uppercase tracking-widest text-sm rounded-lg hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,229,255,0.4)]"
                            >
                                Log In to Continue
                            </button>
                            <button
                                onClick={() => window.location.href = '/signup'}
                                className="w-full py-3 bg-white/5 border border-white/10 text-white font-bold uppercase tracking-widest text-sm rounded-lg hover:bg-white/10 transition-all"
                            >
                                Create Account
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-140px)]">

            {/* LEFT: Talent Feed */}
            <div className="lg:col-span-7 flex flex-col gap-4">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Users className="w-6 h-6 text-accent1" /> Talent Feed
                    </h3>
                    <div className="flex gap-2">
                        <CompetitionDropdown
                            competitions={competitions}
                            selected={selectedCompetition}
                            onSelect={setSelectedCompetition}
                            counts={competitions.reduce((acc, comp) => {
                                acc[comp] = comp === "All Competitions"
                                    ? TALENT_POOL.length
                                    : TALENT_POOL.filter(t => t.competitions?.includes(comp)).length;
                                return acc;
                            }, {} as Record<string, number>)}
                        />

                        {/* Search Bar */}
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Find skills (e.g. React, Design)..."
                                className="w-full bg-black/40 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-accent1/50 transition-colors placeholder:text-gray-600"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex-grow overflow-y-auto pr-2 space-y-3 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    {filteredTalent.map(user => (
                        <TalentCard
                            key={user.id}
                            user={user}
                            onInvite={() => handleInvite(user)}
                            isDraggable={!isFull}
                            onDragStart={() => setDraggingId(user.id)}
                            onDragEnd={() => setDraggingId(null)}
                        />
                    ))}
                    {filteredTalent.length === 0 && (
                        <div className="text-center text-gray-500 py-12">
                            No agents found matching your criteria.
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT: Your Team */}
            <div className="lg:col-span-5 flex flex-col h-full">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 h-full flex flex-col relative overflow-hidden backdrop-blur-sm">
                    {/* Success Overlay */}
                    <AnimatePresence>
                        {isFull && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-x-0 top-0 z-20 bg-gradient-to-b from-green-500/20 to-transparent p-4 text-center border-b border-green-500/30"
                            >
                                <span className="text-green-400 font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2">
                                    <CheckCircle className="w-4 h-4" /> Squad Complete
                                </span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <h3 className="text-xl font-bold text-white mb-6 flex items-center justify-between">
                        <span>My Squad</span>
                        <span className="text-sm font-normal text-gray-400 font-mono">
                            {myTeam?.members.length || 0} / {myTeam?.maxMembers || 4}
                        </span>
                    </h3>

                    <div className="flex-grow space-y-4">
                        {myTeam?.members.map(user => (
                            <TeamMemberCard key={user.id} user={user} onRemove={() => handleRemove(user.id)} />
                        ))}

                        {/* Empty Slots */}
                        {Array.from({ length: Math.max(0, (myTeam?.maxMembers || 4) - (myTeam?.members.length || 0)) }).map((_, i) => (
                            <EmptySlot key={`empty-${i}`} isTarget={!!draggingId} />
                        ))}
                    </div>

                    <div className="mt-6 pt-6 border-t border-white/5">
                        <button
                            disabled={!isFull}
                            className={cn(
                                "w-full py-4 font-bold uppercase tracking-widest text-sm rounded-sm transition-all",
                                isFull
                                    ? "bg-accent2 text-black hover:scale-[1.02] shadow-[0_0_20px_rgba(173,255,0,0.4)]"
                                    : "bg-white/5 text-gray-500 cursor-not-allowed"
                            )}
                        >
                            {isFull ? "Confirm Team Registration" : "Fill All Slots to Register"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function TalentCard({ user, onInvite, isDraggable, onDragStart, onDragEnd }: { user: User, onInvite: () => void, isDraggable: boolean, onDragStart: () => void, onDragEnd: () => void }) {
    const controls = useDragControls();

    return (
        <motion.div
            layoutId={user.id}
            drag={isDraggable}
            dragControls={controls}
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }} // Snap back
            dragElastic={0.2}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            whileDrag={{ scale: 1.05, opacity: 0.8, zIndex: 50 }}
            className="group relative bg-white/5 hover:bg-white/10 border border-white/5 hover:border-accent1/30 rounded-xl p-4 transition-all"
        >
            <div className="flex items-center gap-4">
                {/* Drag Handle */}
                <div className="cursor-grab active:cursor-grabbing text-gray-600 group-hover:text-gray-400 p-1">
                    <GripVertical className="w-5 h-5" />
                </div>

                {/* Avatar */}
                <div className="relative w-12 h-12 rounded-full overflow-hidden border border-white/10 group-hover:border-accent1/50 transition-colors">
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                </div>

                {/* Info */}
                <div className="flex-grow">
                    <h4 className="font-bold text-white group-hover:text-accent1 transition-colors">{user.name}</h4>
                    <p className="text-xs text-gray-400">{user.university}</p>

                    {/* Skills */}
                    <div className="flex gap-2 mt-2 flex-wrap">
                        {user.skills?.slice(0, 3).map(skill => (
                            <span key={skill} className="px-2 py-0.5 bg-black/40 border border-white/10 rounded-sm text-[10px] text-gray-300">
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <button
                    onClick={onInvite}
                    className="opacity-0 group-hover:opacity-100 px-4 py-2 bg-accent1 text-black font-bold text-xs uppercase rounded-sm hover:scale-105 transition-all shadow-[0_0_15px_rgba(0,229,255,0.4)]"
                >
                    Invite
                </button>
            </div>
        </motion.div>
    );
}

function TeamMemberCard({ user, onRemove }: { user: User, onRemove: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex items-center gap-4 p-3 bg-accent1/5 border border-accent1/20 rounded-xl"
        >
            <div className="w-10 h-10 rounded-full overflow-hidden border border-accent1/50">
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-grow">
                <div className="font-bold text-white text-sm">{user.name}</div>
                <div className="text-[10px] text-accent1">{user.role}</div>
            </div>
            <button onClick={onRemove} className="p-2 text-gray-500 hover:text-red-500 transition-colors">
                <X className="w-4 h-4" />
            </button>
        </motion.div>
    );
}

function EmptySlot({ isTarget }: { isTarget: boolean }) {
    return (
        <motion.div
            animate={{
                borderColor: isTarget ? "rgba(173, 255, 0, 0.5)" : "rgba(255, 255, 255, 0.1)",
                backgroundColor: isTarget ? "rgba(173, 255, 0, 0.05)" : "transparent"
            }}
            className="h-20 rounded-xl border-2 border-dashed flex items-center justify-center transition-colors"
        >
            <div className="text-center">
                <div className={cn("w-2 h-2 rounded-full mx-auto mb-2", isTarget ? "bg-accent2 animate-ping" : "bg-gray-700")} />
                <span className={cn("text-xs font-mono uppercase tracking-widest", isTarget ? "text-accent2" : "text-gray-600")}>
                    {isTarget ? "Drop to Invite" : "Empty Slot"}
                </span>
            </div>
        </motion.div>
    );
}
