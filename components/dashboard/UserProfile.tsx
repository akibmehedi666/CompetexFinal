"use client";

import { User } from "@/types";
import { Shield, MapPin, Github, Linkedin, Award } from "lucide-react";
import { ClientOnly } from "@/components/ui/ClientOnly";

// Mock Data for Radar Chart
const SKILL_DATA = [
    { subject: 'Coding', A: 120, fullMark: 150 },
    { subject: 'Design', A: 98, fullMark: 150 },
    { subject: 'Logic', A: 86, fullMark: 150 },
    { subject: 'Teamwork', A: 99, fullMark: 150 },
    { subject: 'Speed', A: 85, fullMark: 150 },
    { subject: 'Security', A: 65, fullMark: 150 },
];

interface UserProfileProps {
    user: User;
}

export function UserProfile({ user }: UserProfileProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Identity Card */}
            <div className="lg:col-span-1 bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col items-center text-center">
                <div className="w-32 h-32 rounded-full border-2 border-accent1 p-1 mb-4 relative">
                    <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full bg-black object-cover" />
                    <div className="absolute bottom-0 right-0 bg-accent1 text-black text-xs font-bold px-2 py-1 rounded-full border border-black">
                        Lvl {user.stats?.rank || 1}
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-white mb-1">{user.name}</h2>
                <p className="text-accent1 font-medium mb-4">{user.role}{user.university ? ` @ ${user.university}` : ''}</p>

                <div className="flex gap-2 mb-6">
                    {user.linkedin && (
                        <a
                            href={user.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-white/10 rounded-full hover:bg-[#0077b5] hover:text-white transition-colors"
                        >
                            <Linkedin className="w-4 h-4" />
                        </a>
                    )}
                    {user.github && (
                        <a
                            href={user.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-white/10 rounded-full hover:bg-white hover:text-black transition-colors"
                        >
                            <Github className="w-4 h-4" />
                        </a>
                    )}
                    {user.portfolio && (
                        <a
                            href={user.portfolio}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-white/10 rounded-full hover:bg-green-500 hover:text-white transition-colors"
                        >
                            <Award className="w-4 h-4" />
                        </a>
                    )}
                </div>

                <div className="w-full grid grid-cols-3 gap-2 border-t border-white/10 pt-4">
                    <div>
                        <div className="text-lg font-bold text-white">{user.stats?.points}</div>
                        <div className="text-[10px] text-gray-500 uppercase">XP</div>
                    </div>
                    <div>
                        <div className="text-lg font-bold text-white">{user.stats?.eventsWon}</div>
                        <div className="text-[10px] text-gray-500 uppercase">Wins</div>
                    </div>
                    <div>
                        <div className="text-lg font-bold text-white">#42</div>
                        <div className="text-[10px] text-gray-500 uppercase">Rank</div>
                    </div>
                </div>
            </div>

            {/* Radar Chart & Badges */}
            <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-xl p-6 relative overflow-hidden">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-accent2" /> Skill Matrix
                </h3>

                <div className="h-[300px] w-full flex items-center justify-center bg-black/20 rounded border border-white/5">
                    <span className="text-xs text-gray-500">Skill Matrix Placeholder</span>
                </div>

                <div className="absolute top-6 right-6 flex flex-col gap-2">
                    {Array.isArray(user.skills) && user.skills.map(skill => (
                        <span key={skill} className="px-3 py-1 bg-black/40 border border-white/10 rounded-full text-xs text-gray-300">
                            {skill}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}
