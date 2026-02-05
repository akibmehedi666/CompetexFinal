"use client";

import { motion } from "framer-motion";
import { Sparkles, Calendar, ArrowRight, Zap } from "lucide-react";

export function RecommendedEvents() {
    // Mock recommended events
    const events = [
        { id: 1, name: "UIU Frontend Dev Summit", date: "Jan 24, 2026", match: 98, tags: ["React", "Frontend"] },
        { id: 2, name: "Dhaka Backend Bash", date: "Feb 10, 2026", match: 85, tags: ["Node", "Backend"] },
        { id: 3, name: "FullStack Bangladesh", date: "Feb 15, 2026", match: 92, tags: ["FullStack", "Web"] }
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-purple-900/20 to-black border border-purple-500/20 rounded-xl p-6 relative overflow-hidden"
        >
            {/* Background Effect */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-[40px]" />

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-400" /> Recommended For You
                    </h3>
                </div>

                <div className="space-y-3">
                    {events.map((event, i) => (
                        <div key={event.id} className="flex items-center justify-between group cursor-pointer hover:bg-white/5 p-2 rounded-lg transition-colors -mx-2">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 font-bold text-xs border border-purple-500/20">
                                    {event.match}%
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-sm group-hover:text-purple-300 transition-colors">{event.name}</h4>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {event.date}</span>
                                        <span className="w-1 h-1 rounded-full bg-gray-600" />
                                        <span>{event.tags[0]}</span>
                                    </div>
                                </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors opacity-0 group-hover:opacity-100" />
                        </div>
                    ))}
                </div>

                <button className="w-full mt-4 py-2 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-purple-500/10 transition-colors flex items-center justify-center gap-2">
                    <Zap className="w-3 h-3" /> View All 12 Matches
                </button>
            </div>
        </motion.div>
    );
}
