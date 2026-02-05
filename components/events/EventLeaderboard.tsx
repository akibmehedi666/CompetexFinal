"use client";

import { motion } from "framer-motion";
import { Trophy, Medal, Crown } from "lucide-react";

interface EventLeaderboardProps {
    leaderboard: { rank: number; name: string; score: number; avatar?: string | null }[];
}

export function EventLeaderboard({ leaderboard }: EventLeaderboardProps) {
    if (!leaderboard || leaderboard.length === 0) {
        return (
            <div className="text-center py-12 bg-white/5 border border-white/10 rounded-xl">
                <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-400">Leaderboard Hidden</h3>
                <p className="text-gray-600">Scores will be revealed once the event concludes.</p>
            </div>
        );
    }

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1: return <Crown className="w-5 h-5 text-yellow-400 fill-yellow-400 animate-pulse" />;
            case 2: return <Medal className="w-5 h-5 text-gray-300" />;
            case 3: return <Medal className="w-5 h-5 text-amber-600" />;
            default: return <span className="font-mono text-gray-500">#{rank}</span>;
        }
    };

    const getRowStyle = (rank: number) => {
        if (rank === 1) return "bg-gradient-to-r from-yellow-500/10 to-transparent border-yellow-500/20";
        if (rank === 2) return "bg-gradient-to-r from-gray-300/10 to-transparent border-gray-300/20";
        if (rank === 3) return "bg-gradient-to-r from-amber-600/10 to-transparent border-amber-600/20";
        return "bg-white/5 border-white/5 hover:bg-white/10";
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-2">
                {leaderboard.map((team, index) => (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        key={team.name}
                        className={`flex items-center justify-between p-4 rounded-xl border ${getRowStyle(team.rank)} transition-all group`}
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-8 flex justify-center">
                                {getRankIcon(team.rank)}
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-black/50 overflow-hidden border border-white/10 flex items-center justify-center text-xs font-bold text-white">
                                    {team.avatar ? (
                                        <img src={team.avatar} alt={team.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span>{team.name.substring(0, 2).toUpperCase()}</span>
                                    )}
                                </div>
                                <div>
                                    <div className={`font-bold ${team.rank === 1 ? 'text-yellow-400' : 'text-white'}`}>
                                        {team.name}
                                    </div>
                                    <div className="text-xs text-gray-400">Rank {team.rank}</div>
                                </div>
                            </div>
                        </div>

                        <div className="text-right">
                            <div className="font-mono font-bold text-accent1 text-lg">{team.score.toLocaleString()} pts</div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
