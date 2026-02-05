"use client";

import { motion } from "framer-motion";
import { Trophy, Medal, UserPlus, ChevronRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function EventWinnersFeed() {
    const [expandedEvent, setExpandedEvent] = useState<number | null>(null);

    const winners = [
        {
            id: 1,
            event: "Global AI Challenge",
            date: "Jan 10, 2026",
            team: "Neural Nets",
            members: [
                { name: "Alice Zhang", role: "ML Engineer", hired: false },
                { name: "Bob Smith", role: "Data Scientist", hired: true },
                { name: "Charlie Roy", role: "Backend Dev", hired: false }
            ]
        },
        {
            id: 2,
            event: "Design Systems Hackathon",
            date: "Jan 12, 2026",
            team: "Pixel Perfect",
            members: [
                { name: "Diana Prince", role: "UI Designer", hired: false },
                { name: "Bruce Wayne", role: "Product Manager", hired: false }
            ]
        }
    ];

    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" /> Recent Winners
            </h3>

            <div className="space-y-4">
                {winners.map((win, i) => (
                    <motion.div
                        key={win.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-black/40 border border-white/5 rounded-xl overflow-hidden"
                    >
                        <div
                            className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
                            onClick={() => setExpandedEvent(expandedEvent === win.id ? null : win.id)}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center text-yellow-500">
                                    <Medal className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-sm">{win.team}</h4>
                                    <p className="text-xs text-gray-400">Winner of {win.event}</p>
                                </div>
                            </div>
                            <ChevronRight className={cn("w-4 h-4 text-gray-500 transition-transform", expandedEvent === win.id && "rotate-90")} />
                        </div>

                        {expandedEvent === win.id && (
                            <div className="bg-white/5 p-3 space-y-2 border-t border-white/5">
                                {win.members.map((member, j) => (
                                    <div key={j} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-xs font-bold">
                                                {member.name[0]}
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-white">{member.name}</div>
                                                <div className="text-[10px] text-gray-400">{member.role}</div>
                                            </div>
                                        </div>

                                        {!member.hired ? (
                                            <button className="text-xs flex items-center gap-1 text-purple-400 hover:text-purple-300 font-bold px-2 py-1 rounded bg-purple-500/10 hover:bg-purple-500/20 transition-colors">
                                                <UserPlus className="w-3 h-3" /> Connect
                                            </button>
                                        ) : (
                                            <span className="text-[10px] text-gray-500 italic">Hired</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
