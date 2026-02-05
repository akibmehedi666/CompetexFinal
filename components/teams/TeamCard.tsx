import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, MessageCircle, CheckCircle, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ENDPOINTS } from "@/lib/api_config";
import { useStore } from "@/store/useStore";
import { TeamRequestsModal } from "./TeamRequestsModal";
import { Team } from "@/types";

interface TeamCardProps {
    team: Team;
    userSkills: string[];
}


const CATEGORY_COLORS: Record<string, string> = {
    "AI": "bg-purple-500/20 text-purple-400 border-purple-500/30",
    "ML": "bg-purple-500/20 text-purple-400 border-purple-500/30",
    "Robotics": "bg-red-500/20 text-red-400 border-red-500/30",
    "Web Dev": "bg-blue-500/20 text-blue-400 border-blue-500/30",
    "Mobile": "bg-green-500/20 text-green-400 border-green-500/30",
    "Blockchain": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    "IoT": "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    "Design": "bg-pink-500/20 text-pink-400 border-pink-500/30",
    "Hardware": "bg-orange-500/20 text-orange-400 border-orange-500/30",
};

export function TeamCard({ team, userSkills }: TeamCardProps) {
    const { currentUser } = useStore();
    const [isHovered, setIsHovered] = useState(false);
    const [requestStatus, setRequestStatus] = useState<"idle" | "pending" | "accepted" | "rejected" | "joined">("idle");
    const [loading, setLoading] = useState(false);
    const [manageModalOpen, setManageModalOpen] = useState(false);

    // Initial check: Am I in the team or pending?
    useEffect(() => {
        if (!currentUser) return;
        const isMember = team.members.some(m => m.id === currentUser.id);
        if (isMember) setRequestStatus("joined");
        // TODO: Check if pending request exists via API or parent prop (Simpler for now: assumes idle unless member)
    }, [currentUser, team.members]);

    const handleRequestJoin = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!currentUser) {
            window.location.href = '/login';
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(ENDPOINTS.REQUEST_JOIN, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ team_id: team.id, user_id: currentUser.id })
            });
            const data = await res.json();
            if (data.status === 'success') {
                setRequestStatus('pending');
                toast.success("Request sent!");
            } else {
                toast.error(data.message);
            }
        } catch (err) {
            toast.error("Failed to send request");
        } finally {
            setLoading(false);
        }
    };

    // Calculate matching skills
    const matchingSkills = team.requiredSkills.filter(skill =>
        userSkills.includes(skill)
    );

    const hasMatches = matchingSkills.length > 0;
    const isFull = team.members.length >= team.maxMembers;
    const isOpen = team.status === "open" && !isFull;
    const isLeader = currentUser?.id === team.leaderId;

    return (
        <>
            <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                onHoverStart={() => setIsHovered(true)}
                onHoverEnd={() => setIsHovered(false)}
                className={cn(
                    "relative p-6 rounded-2xl transition-all duration-300",
                    "bg-black/60 backdrop-blur-xl border border-white/10",
                    isHovered && "shadow-[0_0_30px_rgba(0,229,255,0.2)] border-[#00E5FF]/30"
                )}
            >
                {/* Status Badge */}
                <div className="absolute top-4 right-4 z-10">
                    {isMember(team, currentUser?.id) ? (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#00FF88]/20 text-[#00FF88] border border-[#00FF88]/30">
                            MEMBER
                        </span>
                    ) : isFull ? (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                            FULL
                        </span>
                    ) : team.status === "invite-only" ? (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                            INVITE ONLY
                        </span>
                    ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#AAFF00]/20 text-[#AAFF00] border border-[#AAFF00]/30">
                            OPEN
                        </span>
                    )}
                </div>

                {/* Team Header */}
                <div className="mb-4">
                    <h3 className="text-2xl font-bold text-white mb-2">{team.name}</h3>
                    <p className="text-sm text-gray-400 line-clamp-2">{team.description}</p>
                </div>

                {/* Project */}
                <div className="mb-4 p-3 rounded-lg bg-white/5 border border-white/5">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Project</p>
                    <p className="text-sm text-white font-medium">{team.project || "Not specified"}</p>
                </div>

                {/* Category Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {team.categories.map((category) => (
                        <span
                            key={category}
                            className={cn(
                                "px-3 py-1 rounded-full text-xs font-bold border",
                                CATEGORY_COLORS[category] || "bg-gray-500/20 text-gray-400 border-gray-500/30"
                            )}
                        >
                            {category}
                        </span>
                    ))}
                </div>

                {/* Matching Skills Badge */}
                {hasMatches && (
                    <div className="mb-4 flex items-center gap-2 p-2 rounded-lg bg-[#AAFF00]/10 border border-[#AAFF00]/30">
                        <Sparkles className="w-4 h-4 text-[#AAFF00]" />
                        <span className="text-xs font-bold text-[#AAFF00]">
                            {matchingSkills.length} Matching Skill{matchingSkills.length > 1 ? 's' : ''}
                        </span>
                    </div>
                )}

                {/* Members Section */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-400">
                                {team.members.length}/{team.maxMembers} Members
                            </span>
                        </div>
                    </div>
                    {/* Avatars... (keeping simple for brevity in replacement, assuming original code here is fine to keep? Check step limitation. 
                       Actually, I'm replacing the whole component body basically. Better to copy the avatar logic.) 
                    */}
                    <div className="flex items-center">
                        {team.members.slice(0, 4).map((member, index) => (
                            <div
                                key={member.id}
                                className="relative group/member cursor-pointer"
                                style={{ marginLeft: index > 0 ? '-12px' : '0' }}
                            >
                                <div className="w-10 h-10 rounded-full border-2 border-black bg-gradient-to-br from-[#00E5FF]/40 to-[#AAFF00]/40 flex items-center justify-center text-white font-bold text-sm overflow-hidden relative">
                                    {member.avatar ? (
                                        <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                                    ) : (
                                        member.name.charAt(0).toUpperCase()
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Capacity Progress Bar */}
                    <div className="mt-3 h-2 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(team.members.length / team.maxMembers) * 100}%` }}
                            className={cn(
                                "h-full rounded-full",
                                isFull ? "bg-red-500" : "bg-gradient-to-r from-[#00E5FF] to-[#AAFF00]"
                            )}
                        />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    {/* Leader: Manage | User: Join */}
                    {isLeader ? (
                        <button
                            onClick={() => setManageModalOpen(true)}
                            className="flex-1 py-3 px-4 rounded-xl font-bold text-sm uppercase tracking-wider transition-all bg-[#AAFF00]/20 text-[#AAFF00] border border-[#AAFF00]/30 hover:bg-[#AAFF00]/30"
                        >
                            Manage Team Members
                        </button>
                    ) : (
                        <button
                            onClick={handleRequestJoin}
                            disabled={!isOpen || requestStatus !== "idle" || loading}
                            className={cn(
                                "flex-1 py-3 px-4 rounded-xl font-bold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2",
                                requestStatus === "idle" && isOpen && "bg-[#00E5FF] text-black hover:bg-[#00E5FF]/80 shadow-[0_0_20px_rgba(0,229,255,0.3)]",
                                (requestStatus === "pending" || loading) && "bg-white/5 text-gray-400 cursor-not-allowed",
                                requestStatus === "joined" && "bg-green-500/20 text-green-400 border border-green-500/30 cursor-default",
                                (!isOpen && requestStatus === "idle") && "bg-white/5 text-gray-600 cursor-not-allowed"
                            )}
                        >
                            {loading ? <Loader2 className="animate-spin w-4 h-4" /> :
                                requestStatus === "pending" ? "Request Sent" :
                                    requestStatus === "joined" ? "Joined" :
                                        "Request to Join"}
                        </button>
                    )}
                </div>
            </motion.div>

            {/* Management Modal */}
            {isLeader && manageModalOpen && (
                <TeamRequestsModal
                    teamId={team.id}
                    isOpen={manageModalOpen}
                    onClose={() => setManageModalOpen(false)}
                    currentMembers={team.members}
                />
            )}
        </>
    );
}

// Helper
function isMember(team: Team, userId?: string) {
    if (!userId) return false;
    return team.members.some(m => m.id === userId);
}
