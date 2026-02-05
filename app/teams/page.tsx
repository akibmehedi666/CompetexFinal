"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/ui/Navbar";
import { TeamCard } from "@/components/teams/TeamCard";
import { ChatSidePanel } from "@/components/teams/ChatSidePanel";
import { TeamCreationModal } from "@/components/teams/TeamCreationModal";
import { motion } from "framer-motion";
import { Search, Plus } from "lucide-react";
import { CompetitionDropdown } from "@/components/ui/CompetitionDropdown";
import { useStore } from "@/store/useStore";
import { Team, Event } from "@/types";

// Dummy user skills for matching (Keep for now or fetch from user profile)
const USER_SKILLS = ["React", "Python", "Machine Learning", "Arduino", "3D Modeling"];

export default function TeamsPage() {
    const { currentUser, events, fetchEvents } = useStore();
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [requestStatuses, setRequestStatuses] = useState<Record<string, "idle" | "pending" | "accepted" | "rejected">>({});
    const [chatPanelOpen, setChatPanelOpen] = useState(false);
    const [creationModalOpen, setCreationModalOpen] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
    const [selectedCompetition, setSelectedCompetition] = useState<string>("All Competitions");

    // Ensure events are loaded for the modal
    useEffect(() => {
        if (events.length === 0) {
            fetchEvents();
        }
    }, [events.length, fetchEvents]);

    // Fetch teams from backend
    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const res = await fetch("http://localhost/Competex/api/get_teams.php");
                const data = await res.json();

                if (Array.isArray(data)) {
                    const formatted: Team[] = data.map(t => ({
                        ...t,
                        members: t.members || [],
                        categories: t.categories || ["General"],
                        requiredSkills: t.requiredSkills || [],
                        status: t.status || "open"
                    }));
                    setTeams(formatted);
                }
            } catch (err) {
                console.error("Failed to fetch teams:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchTeams();
    }, []);

    // Derive available competitions
    const competitions = ["All Competitions", ...Array.from(new Set(teams.map(t => t.competition || "General")))];

    const handleRequestJoin = (teamId: string) => {
        if (!currentUser) {
            window.location.href = '/login';
            return;
        }
        setRequestStatuses(prev => ({ ...prev, [teamId]: "pending" }));
        setTimeout(() => {
            setRequestStatuses(prev => ({ ...prev, [teamId]: "accepted" }));
        }, 2000);
    };

    const handleMessageTeam = (teamId: string) => {
        if (!currentUser) {
            window.location.href = '/login';
            return;
        }
        const team = teams.find(t => t.id === teamId);
        if (team) {
            setSelectedTeam(team);
            setChatPanelOpen(true);
        }
    };

    const filteredTeams = teams.filter(team => {
        const matchesSearch = team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (team.description && team.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (team.project && team.project.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (team.projectIdea && team.projectIdea?.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesCompetition = selectedCompetition === "All Competitions" ||
            team.competition === selectedCompetition;

        return matchesSearch && matchesCompetition;
    });

    return (
        <div className="min-h-screen bg-black selection:bg-accent1/30">
            <Navbar />

            <div className="pt-24 pb-12 max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
                    <div>
                        <motion.h1
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-5xl font-bold text-white mb-3 tracking-tight"
                        >
                            Discover <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] to-[#AAFF00]">Teams</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-gray-400 text-lg max-w-2xl"
                        >
                            Find the perfect team for your next competition. Message teams to discuss projects, or request to join directly.
                        </motion.p>
                    </div>

                    {/* Create Team Button */}
                    <div className="flex gap-4">
                        {currentUser && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                onClick={() => setCreationModalOpen(true)}
                                className="px-6 py-3 bg-accent1 text-black font-bold uppercase tracking-wide rounded-xl hover:bg-white transition-all shadow-[0_0_20px_rgba(0,229,255,0.3)] flex items-center gap-2"
                            >
                                <Plus className="w-5 h-5" /> Create Team
                            </motion.button>
                        )}
                    </div>
                </div>

                <div className="mb-8 flex gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search teams..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white text-sm focus:border-[#00E5FF]/50 focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/20 transition-all"
                        />
                    </div>
                    <div className="flex flex-col md:flex-row gap-4">
                        <CompetitionDropdown
                            competitions={competitions}
                            selected={selectedCompetition}
                            onSelect={setSelectedCompetition}
                            counts={competitions.reduce((acc, comp) => {
                                acc[comp] = comp === "All Competitions"
                                    ? teams.length
                                    : teams.filter(t => t.competition === comp).length;
                                return acc;
                            }, {} as Record<string, number>)}
                        />
                    </div>
                </div>

                <div className="mb-8 grid grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <p className="text-3xl font-bold text-white mb-1">{teams.length}</p>
                        <p className="text-sm text-gray-400">Active Teams</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <p className="text-3xl font-bold text-[#00E5FF] mb-1">
                            {teams.filter(t => t.status === "open").length}
                        </p>
                        <p className="text-sm text-gray-400">Open Slots</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <p className="text-3xl font-bold text-[#AAFF00] mb-1">
                            {/* Simple skill match count placeholder */}
                            {teams.length * 2}
                        </p>
                        <p className="text-sm text-gray-400">Skill Matches</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTeams.map((team, index) => (
                        <motion.div
                            key={team.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <TeamCard
                                team={team}
                                userSkills={USER_SKILLS}
                            />
                        </motion.div>
                    ))}
                </div>

                {filteredTeams.length === 0 && (
                    <div className="text-center py-24 border border-dashed border-white/10 rounded-3xl">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8 text-gray-600" />
                        </div>
                        <h3 className="text-white font-bold text-lg mb-2">No teams found</h3>
                        <p className="text-gray-500">Try adjusting your search query or create a new team.</p>
                    </div>
                )}
            </div>

            <ChatSidePanel
                isOpen={chatPanelOpen}
                onClose={() => setChatPanelOpen(false)}
                team={selectedTeam}
                userSkills={USER_SKILLS}
                currentUserId={currentUser?.id || ""}
            />

            <TeamCreationModal
                isOpen={creationModalOpen}
                onClose={() => setCreationModalOpen(false)}
                events={events} // Pass real events
            />
        </div>
    );
}
