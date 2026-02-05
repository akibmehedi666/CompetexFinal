
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Edit2, Save, Github, Linkedin, Shield, MapPin, Award, Globe, X, Users, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ENDPOINTS } from "@/lib/api_config";
import { User, ProfileVisibility } from "@/types";
import { VisibilityToggle } from "@/components/participant/VisibilityToggle";
import { AchievementsGallery } from "@/components/participant/AchievementsGallery";
import { CompetitionHistory } from "@/components/participant/CompetitionHistory";
import { TeamInvites } from "@/components/participant/TeamInvites";
import { RecommendedEvents } from "@/components/participant/RecommendedEvents";

interface ParticipantDashboardProps {
    user: User;
    setUser: (user: User) => void;
}

export function ParticipantDashboard({ user, setUser }: ParticipantDashboardProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [tempUniversity, setTempUniversity] = useState("");
    const [tempSkills, setTempSkills] = useState("");
    const [tempBio, setTempBio] = useState("");
    const [tempGithub, setTempGithub] = useState("");
    const [tempLinkedin, setTempLinkedin] = useState("");
    const [tempPortfolio, setTempPortfolio] = useState("");
    const [activeTab, setActiveTab] = useState<"overview" | "achievements" | "history" | "settings" | "teams">("overview");

    useEffect(() => {
        if (user) {
            fetch(`http://localhost/Competex/api/get_profile.php?user_id=${user.id}`)
                .then(res => res.json())
                .then(data => {
                    if (data.status === 'success') {
                        const updatedUser = { ...user, ...data.user };
                        // Ensure skills is an array
                        if (typeof updatedUser.skills === 'string') {
                            try { updatedUser.skills = JSON.parse(updatedUser.skills); } catch (e) { }
                        }
                        setUser(updatedUser);
                    }
                })
                .catch(err => console.error("Failed to fetch fresh profile:", err));
        }
    }, []); // Run once on mount

    useEffect(() => {
        if (user) {
            const skills = Array.isArray(user.skills) ? user.skills : [];
            setTempSkills(skills.join(", "));
            setTempUniversity(user.university || "");
            setTempBio(user.bio || "");
            setTempGithub(user.github || "");
            setTempLinkedin(user.linkedin || "");
            setTempPortfolio(user.portfolio || "");
        }
    }, [user]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64 = reader.result as string;

                try {
                    const res = await fetch('http://localhost/Competex/api/update_profile.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            id: user.id,
                            avatar: base64
                        })
                    });
                    const data = await res.json();

                    if (data.status === 'success') {
                        const updated = { ...user, ...data.user };
                        setUser(updated);
                        localStorage.setItem("competex_user_session", JSON.stringify(updated));
                        toast.success("Profile photo updated successfully!");
                    } else {
                        toast.error(data.message || "Failed to update photo");
                    }
                } catch (error) {
                    toast.error("Network error updating photo");
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const saveProfile = async () => {
        const skillsArray = typeof tempSkills === 'string'
            ? tempSkills.split(",").map(s => s.trim()).filter(Boolean)
            : [];

        try {
            const response = await fetch("http://localhost/Competex/api/update_profile.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: user.id,
                    university: tempUniversity,
                    bio: tempBio,
                    skills: skillsArray,
                    github: tempGithub,
                    linkedin: tempLinkedin,
                    portfolio: tempPortfolio
                })
            });

            const data = await response.json();

            if (data.status === "success") {
                const updated = {
                    ...user,
                    university: tempUniversity,
                    skills: skillsArray,
                    bio: tempBio,
                    github: tempGithub,
                    linkedin: tempLinkedin,
                    portfolio: tempPortfolio
                };
                setUser(updated);
                localStorage.setItem("competex_user_session", JSON.stringify(updated));
                setIsEditing(false);
                toast.success("Profile information saved!");
            } else {
                toast.error(data.message || "Failed to save profile");
            }
        } catch (error) {
            console.error("Save error:", error);
            toast.error("Failed to connect to server");
        }
    };

    const handleVisibilityChange = async (visibility: ProfileVisibility) => {
        try {
            const response = await fetch("http://localhost/Competex/api/update_profile.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: user.id,
                    profile_visibility: visibility
                })
            });

            const data = await response.json();

            if (data.status === "success") {
                const updated = { ...user, profileVisibility: visibility };
                setUser(updated);
                localStorage.setItem("competex_user_session", JSON.stringify(updated));
                toast.success(`Profile visibility set to ${visibility}`);
            } else {
                toast.error(data.message || "Failed to update visibility");
            }
        } catch (error) {
            console.error("Visibility update error:", error);
            toast.error("Failed to connect to server");
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            {/* Header Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative bg-white/5 border border-white/10 rounded-2xl p-8 mb-8 backdrop-blur-md overflow-hidden"
            >
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent1/10 rounded-full blur-[80px]" />

                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">

                    {/* Avatar Upload */}
                    <div className="relative group">
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="w-32 h-32 rounded-full border-2 border-accent1 p-1 cursor-pointer overflow-hidden transition-all hover:shadow-[0_0_20px_#00E5FF]"
                        >
                            {user?.avatar ? (
                                <img src={user.avatar} alt="Profile" className="w-full h-full rounded-full object-cover" />
                            ) : (
                                <div className="w-full h-full rounded-full bg-white/10 flex items-center justify-center">
                                    <UserPlaceholder />
                                </div>
                            )}

                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                                <Camera className="w-6 h-6 text-white mb-1" />
                                <span className="text-[10px] font-bold text-accent1 uppercase">Change Photo</span>
                            </div>
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                            accept="image/*"
                            className="hidden"
                        />
                    </div>

                    {/* User Info */}
                    <div className="flex-1 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                            <h1 className="text-3xl font-bold text-white">{user?.name}</h1>
                            <span className="px-3 py-1 bg-accent1/20 text-accent1 text-xs font-bold uppercase rounded-full border border-accent1/50">
                                {user?.role}
                            </span>
                            {user?.verified && (
                                <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-full border border-green-500/50">
                                    ✓ Verified
                                </span>
                            )}
                        </div>
                        <p className="text-gray-400 mb-2 flex items-center justify-center md:justify-start gap-2">
                            <MapPin className="w-4 h-4" /> {user?.university || 'University Student'}
                            <span className="w-1 h-1 rounded-full bg-gray-600" />
                            {user?.email}
                        </p>

                        {user?.bio && !isEditing && (
                            <p className="text-gray-300 text-sm mb-4 max-w-2xl">{user.bio}</p>
                        )}

                        <div className="flex gap-3 justify-center md:justify-start">
                            {user?.github && <SocialButton icon={Github} label="GitHub" url={user.github} />}
                            {user?.linkedin && <SocialButton icon={Linkedin} label="LinkedIn" url={user.linkedin} />}
                            {user?.portfolio && <SocialButton icon={Globe} label="Portfolio" url={user.portfolio} />}
                        </div>
                    </div>

                    {/* Edit Action */}
                    <button
                        onClick={() => isEditing ? saveProfile() : setIsEditing(true)}
                        className={cn(
                            "flex items-center gap-2 px-6 py-2 rounded-lg font-bold uppercase tracking-wide text-xs transition-all",
                            isEditing
                                ? "bg-accent2 text-black shadow-[0_0_15px_#ADFF00]"
                                : "bg-white/10 text-white hover:bg-white/20"
                        )}
                    >
                        {isEditing ? <><Save className="w-4 h-4" /> Save</> : <><Edit2 className="w-4 h-4" /> Edit Profile</>}
                    </button>
                    {isEditing && (
                        <button
                            onClick={() => setIsEditing(false)}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-400" />
                        </button>
                    )}
                </div>
            </motion.div>

            {/* Tabs */}
            <div className="flex gap-2 mb-8 overflow-x-auto">
                {[
                    { id: "overview", label: "Overview" },
                    { id: "teams", label: "My Teams" },
                    { id: "achievements", label: "Achievements" },
                    { id: "history", label: "Competition History" },
                    { id: "settings", label: "Privacy Settings" }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={cn(
                            "px-6 py-3 rounded-lg font-bold text-sm uppercase tracking-wider transition-all whitespace-nowrap",
                            activeTab === tab.id
                                ? "bg-accent1 text-black shadow-[0_0_15px_rgba(0,229,255,0.3)]"
                                : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="space-y-8">
                {activeTab === "overview" && (
                    <>
                        {/* Stats and Skills Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                            {/* Skills Card */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                                className="md:col-span-2 bg-white/5 border border-white/10 rounded-xl p-6"
                            >
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-accent1" /> Skills & Expertise
                                </h3>

                                {isEditing ? (
                                    <>
                                        <textarea
                                            value={tempSkills}
                                            onChange={(e) => setTempSkills(e.target.value)}
                                            className="w-full bg-black/40 border border-white/20 rounded-lg p-4 text-white focus:border-accent1 outline-none min-h-[80px] mb-4"
                                            placeholder="Enter skills separated by comma..."
                                        />
                                        <input
                                            type="text"
                                            value={tempUniversity}
                                            onChange={(e) => setTempUniversity(e.target.value)}
                                            className="w-full bg-black/40 border border-white/20 rounded-lg p-3 text-white focus:border-accent1 outline-none mb-2"
                                            placeholder="University / College Name"
                                        />
                                        <input
                                            type="text"
                                            value={tempBio}
                                            onChange={(e) => setTempBio(e.target.value)}
                                            className="w-full bg-black/40 border border-white/20 rounded-lg p-3 text-white focus:border-accent1 outline-none mb-2"
                                            placeholder="Bio / About yourself..."
                                        />
                                        <input
                                            type="url"
                                            value={tempGithub}
                                            onChange={(e) => setTempGithub(e.target.value)}
                                            className="w-full bg-black/40 border border-white/20 rounded-lg p-3 text-white focus:border-accent1 outline-none mb-2"
                                            placeholder="GitHub URL"
                                        />
                                        <input
                                            type="url"
                                            value={tempLinkedin}
                                            onChange={(e) => setTempLinkedin(e.target.value)}
                                            className="w-full bg-black/40 border border-white/20 rounded-lg p-3 text-white focus:border-accent1 outline-none mb-2"
                                            placeholder="LinkedIn URL"
                                        />
                                        <input
                                            type="url"
                                            value={tempPortfolio}
                                            onChange={(e) => setTempPortfolio(e.target.value)}
                                            className="w-full bg-black/40 border border-white/20 rounded-lg p-3 text-white focus:border-accent1 outline-none"
                                            placeholder="Portfolio URL"
                                        />
                                    </>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {Array.isArray(user?.skills) && user.skills.map((skill: string, i: number) => (
                                            <span key={i} className="px-3 py-1 bg-accent1/10 border border-accent1/30 text-accent1 text-sm rounded-md">
                                                {skill}
                                            </span>
                                        ))}
                                        {(!Array.isArray(user?.skills) || user.skills.length === 0) && (
                                            <span className="text-gray-500 text-sm italic">No skills listed yet.</span>
                                        )}
                                    </div>
                                )}
                            </motion.div>

                            {/* Stats Card */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white/5 border border-white/10 rounded-xl p-6"
                            >
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <Award className="w-5 h-5 text-yellow-500" /> Platform Stats
                                </h3>

                                <div className="space-y-4">
                                    <StatRow label="Rank" value={`#${user?.stats?.rank || 999}`} />
                                    <StatRow label="XP Points" value={user?.stats?.points || 0} />
                                    <StatRow label="Events Won" value={user?.stats?.eventsWon || 0} />
                                </div>
                            </motion.div>

                        </div>

                        {/* Recent Activity & Recommendations Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                            {/* Left Column: Team Invites */}
                            <div>
                                <TeamInvites userId={user?.id} />
                            </div>

                            {/* Middle Column: Recommended Events */}
                            <div>
                                <RecommendedEvents />
                            </div>

                            {/* Right Column: Mini Leaderboard or quick stats (Placeholder/Existing) */}
                            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                                <h3 className="text-lg font-bold text-white mb-4">Daily Streak</h3>
                                <div className="text-center py-4">
                                    <div className="text-4xl font-bold text-accent1 mb-1">🔥 12</div>
                                    <p className="text-sm text-gray-400">Days Active</p>
                                </div>
                                <div className="w-full bg-white/10 h-2 rounded-full mt-2 overflow-hidden">
                                    <div className="bg-accent1 h-full w-[70%]" />
                                </div>
                                <p className="text-xs text-center text-gray-500 mt-2">Keep it up to earn badges!</p>
                            </div>
                        </div>
                    </>
                )}

                {activeTab === "teams" && (
                    <MyTeamsList userId={user.id} />
                )}

                {activeTab === "achievements" && (
                    <AchievementsGallery achievements={user?.achievements || []} />
                )}

                {activeTab === "history" && (
                    <CompetitionHistory history={user?.competitionHistory || []} />
                )}

                {activeTab === "settings" && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/5 border border-white/10 rounded-xl p-8"
                    >
                        <VisibilityToggle
                            value={user?.profileVisibility || "public"}
                            onChange={handleVisibilityChange}
                        />
                    </motion.div>
                )}
            </div>
        </div>
    );
}

function UserPlaceholder() {
    return (
        <svg className="w-12 h-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
    );
}

function SocialButton({ icon: Icon, label, url }: { icon: any, label: string, url?: string }) {
    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-white/30 transition-all group"
        >
            <Icon className="w-5 h-5 text-gray-400 group-hover:text-white" />
        </a>
    );
}

function StatRow({ label, value }: { label: string, value: string | number }) {
    return (
        <div className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
            <span className="text-gray-400 text-sm">{label}</span>
            <span className="text-white font-bold font-mono">{value}</span>
        </div>
    );
}

function MyTeamsList({ userId }: { userId: string }) {
    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 min-h-[300px]">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Users className="w-5 h-5 text-accent1" /> My Teams
            </h3>

            <FetchTeamsLogic userId={userId} />
        </div>
    );
}


function FetchTeamsLogic({ userId }: { userId: string }) {
    const [teams, setTeams] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchTeams = async () => {
            try {
                // Ensure ENDPOINTS is available or fallback
                // const url = ENDPOINTS?.GET_USER_TEAMS_FOR_EVENTS ? ENDPOINTS.GET_USER_TEAMS_FOR_EVENTS(userId) : `http://localhost/Competex/api/get_user_teams.php?user_id=${userId}`; // Assuming get_user_teams for now if not in config
                // Actually user request implies existing structure. Let's use the one in existing code I saw: ENDPOINTS.GET_USER_TEAMS_FOR_EVENTS(userId)
                // But wait, I need to make sure that endpoint exists or fetch works.
                // Assuming it works as per previous code analysis.

                // Fallback to direct fetch for safety if config is complex
                const res = await fetch(`http://localhost/Competex/api/get_user_teams_for_events.php?user_id=${userId}`);
                const data = await res.json();
                if (data.status === 'success') {
                    setTeams(data.data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchTeams();
    }, [userId]);

    const goToCommunityInvite = (teamId: string) => {
        if (!teamId || teamId === "undefined") {
            toast.error("Invalid team id. Please refresh and try again.");
            return;
        }
        router.push(`/people?invite_team_id=${encodeURIComponent(teamId)}`);
    };

    if (loading) return <div className="text-gray-500">Loading teams...</div>;

    if (teams.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500 border-2 border-dashed border-white/10 rounded-xl">
                <p>You have not joined any team yet.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teams.map((team, idx) => {
                return (
                    <div key={idx} className="bg-black/40 border border-white/10 rounded-xl p-5 hover:border-accent1/50 transition-colors group relative">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-accent1/10 flex items-center justify-center text-accent1 font-bold text-lg border border-accent1/20">
                                    {team.team_name.substring(0, 1).toUpperCase()}
                                </div>
                                <div>
                                    <h4 className="font-bold text-white group-hover:text-accent1 transition-colors">{team.team_name}</h4>
                                    <div className="text-xs text-gray-500 flex items-center gap-2">
                                        <span className={cn(
                                            "px-1.5 py-0.5 rounded text-[10px] uppercase font-bold",
                                            team.is_leader ? "bg-purple-500/20 text-purple-400" : "bg-blue-500/20 text-blue-400"
                                        )}>
                                            {team.is_leader ? "Leader" : "Member"}
                                        </span>
                                        <span>• {team.member_count} Members</span>
                                    </div>
                                </div>
                            </div>
                            <span className="px-2 py-1 rounded text-[10px] font-bold uppercase border bg-green-500/10 text-green-400 border-green-500/20">
                                Joined
                            </span>
                        </div>

                        <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Event</p>
                                <div className="flex items-center gap-2 text-sm text-gray-300">
                                    <span className="truncate max-w-[150px]">{team.event_title || "General Team"}</span>
                                </div>
                            </div>

                            {team.is_leader && (
                                <button
                                    onClick={() => goToCommunityInvite(team.team_id)}
                                    className="px-3 py-1.5 bg-accent1/10 border border-accent1/30 text-accent1 hover:bg-accent1 hover:text-black rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                                >
                                    <UserPlus className="w-3 h-3" /> Invite
                                </button>
                            )}
                        </div>
                    </div>
                );
            })}

        </div>
    );
}
