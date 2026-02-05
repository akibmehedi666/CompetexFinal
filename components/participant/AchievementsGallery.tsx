"use client";

import { motion } from "framer-motion";
import { Award, Trophy, Medal, Star } from "lucide-react";
import { Achievement } from "@/types";
import { cn } from "@/lib/utils";

interface AchievementsGalleryProps {
    achievements: Achievement[];
}

const achievementTypeConfig = {
    winner: { color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/30", icon: Trophy },
    "runner-up": { color: "text-gray-300", bg: "bg-gray-500/10", border: "border-gray-500/30", icon: Medal },
    participant: { color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30", icon: Award },
    special: { color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/30", icon: Star }
};

export function AchievementsGallery({ achievements }: AchievementsGalleryProps) {
    if (!achievements || achievements.length === 0) {
        return (
            <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
                <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No achievements yet. Participate in events to earn your first achievement!</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-500" />
                Achievements & Certificates
                <span className="ml-auto text-sm font-normal text-gray-500">{achievements.length} earned</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((achievement, index) => {
                    const config = achievementTypeConfig[achievement.type];
                    const Icon = config.icon;

                    return (
                        <motion.div
                            key={achievement.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className={cn(
                                "relative bg-white/5 border-2 rounded-xl p-6 overflow-hidden group hover:bg-white/10 transition-all",
                                config.border
                            )}
                        >
                            {/* Background Glow */}
                            <div className={cn("absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-20", config.bg)} />

                            {/* Badge Icon */}
                            <div className="relative z-10">
                                <div className="flex items-start justify-between mb-4">
                                    <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center text-3xl", config.bg)}>
                                        {achievement.badge || <Icon className={cn("w-8 h-8", config.color)} />}
                                    </div>
                                    <span className={cn("px-3 py-1 rounded-full text-xs font-bold uppercase", config.bg, config.color, "border", config.border)}>
                                        {achievement.type.replace("-", " ")}
                                    </span>
                                </div>

                                <h4 className="text-lg font-bold text-white mb-2">{achievement.title}</h4>
                                <p className="text-sm text-gray-400 mb-3">{achievement.description}</p>

                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-500">{achievement.eventTitle}</span>
                                    <span className="text-gray-600">
                                        {new Date(achievement.earnedDate).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </span>
                                </div>

                                {achievement.certificateUrl && (
                                    <button className={cn(
                                        "mt-4 w-full py-2 rounded-lg font-bold text-sm uppercase tracking-wider transition-all opacity-0 group-hover:opacity-100",
                                        "border-2", config.border, config.color, "hover:bg-white/5"
                                    )}>
                                        View Certificate
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
