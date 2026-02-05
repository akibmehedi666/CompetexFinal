"use client";

import { motion } from "framer-motion";
import { TrendingUp, Calendar, Users, Target } from "lucide-react";
import { CompetitionEntry } from "@/types";
import { cn } from "@/lib/utils";

interface CompetitionHistoryProps {
    history: CompetitionEntry[];
}

export function CompetitionHistory({ history }: CompetitionHistoryProps) {
    if (!history || history.length === 0) {
        return (
            <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
                <TrendingUp className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No competition history yet. Register for your first event!</p>
            </div>
        );
    }

    // Sort by date (most recent first)
    const sortedHistory = [...history].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-accent1" />
                Competition History
                <span className="ml-auto text-sm font-normal text-gray-500">{history.length} events</span>
            </h3>

            <div className="space-y-3">
                {sortedHistory.map((entry, index) => {
                    const isTopThree = entry.rank <= 3;
                    const rankColor = entry.rank === 1 ? "text-yellow-400" :
                        entry.rank === 2 ? "text-gray-300" :
                            entry.rank === 3 ? "text-orange-400" : "text-gray-500";

                    return (
                        <motion.div
                            key={entry.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={cn(
                                "relative bg-white/5 border rounded-xl p-5 hover:bg-white/10 transition-all group",
                                isTopThree ? "border-accent1/30" : "border-white/10"
                            )}
                        >
                            {/* Rank Badge */}
                            <div className="absolute top-4 right-4">
                                <div className={cn(
                                    "w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg",
                                    isTopThree ? "bg-accent1/20 border-2 border-accent1" : "bg-white/10 border border-white/20"
                                )}>
                                    <span className={rankColor}>#{entry.rank}</span>
                                </div>
                            </div>

                            <div className="pr-16">
                                {/* Event Title */}
                                <h4 className="text-lg font-bold text-white mb-2">{entry.eventTitle}</h4>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                                    <div className="flex items-center gap-2">
                                        <Target className="w-4 h-4 text-accent1" />
                                        <div>
                                            <div className="text-xs text-gray-500">Score</div>
                                            <div className="text-sm font-bold text-white">{entry.score.toFixed(1)}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4 text-blue-400" />
                                        <div>
                                            <div className="text-xs text-gray-500">Participants</div>
                                            <div className="text-sm font-bold text-white">{entry.participantsCount}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-purple-400" />
                                        <div>
                                            <div className="text-xs text-gray-500">Date</div>
                                            <div className="text-sm font-bold text-white">
                                                {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-xs text-gray-500">Category</div>
                                        <div className="text-sm font-bold text-white">{entry.category}</div>
                                    </div>
                                </div>

                                {/* Team Name */}
                                {entry.teamName && (
                                    <div className="flex items-center gap-2">
                                        <span className="px-3 py-1 bg-white/10 border border-white/20 rounded-full text-xs text-gray-300">
                                            Team: {entry.teamName}
                                        </span>
                                    </div>
                                )}

                                {/* Top 3 Badge */}
                                {isTopThree && (
                                    <div className="mt-3">
                                        <span className="px-3 py-1 bg-accent1/20 border border-accent1 rounded-full text-xs font-bold text-accent1 uppercase">
                                            Top {entry.rank} Finish
                                        </span>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
