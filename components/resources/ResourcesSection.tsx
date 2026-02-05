"use client";

import { motion } from "framer-motion";
import { Lock, PlayCircle, FileText, BookOpen } from "lucide-react";
import { Resource } from "@/types";

const MOCK_RESOURCES: Resource[] = [
    { id: "1", title: "Advanced Graph Algorithms", type: "Course", isPremium: true, category: "Coding", thumbnail: "" },
    { id: "2", title: "System Design 101", type: "Video", isPremium: false, category: "Architecture", thumbnail: "" },
    { id: "3", title: "Winning Hackathons Guide", type: "PDF", isPremium: false, category: "General", thumbnail: "" },
    { id: "4", title: "AI Model Fine-tuning", type: "Course", isPremium: true, category: "AI/ML", thumbnail: "" },
];

export function ResourcesSection() {
    return (
        <div className="bg-black/40 border border-white/10 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-accent1" /> Learning Hub
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {MOCK_RESOURCES.map((resource) => (
                    <motion.div
                        key={resource.id}
                        whileHover={{ y: -5 }}
                        className={`relative group rounded-lg overflow-hidden border p-4 flex flex-col h-[200px] ${resource.isPremium
                                ? "bg-gradient-to-br from-[#FFD700]/10 to-transparent border-[#FFD700]/30"
                                : "bg-white/5 border-white/10"
                            }`}
                    >
                        {/* Shimmer for Premium */}
                        {resource.isPremium && (
                            <div className="absolute inset-0 border-2 border-[#FFD700]/20 rounded-lg animate-pulse" />
                        )}

                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${resource.isPremium ? "bg-[#FFD700] text-black" : "bg-white/10 text-gray-300"
                                }`}>
                                {resource.type}
                            </span>
                            {resource.isPremium && <Lock className="w-4 h-4 text-[#FFD700]" />}
                        </div>

                        <h4 className="text-lg font-bold text-white mb-2 line-clamp-2 relative z-10">
                            {resource.title}
                        </h4>

                        <div className="mt-auto flex items-center justify-between relative z-10">
                            <span className="text-xs text-gray-500">{resource.category}</span>
                            <button className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                                {resource.type === "Video" || resource.type === "Course" ? <PlayCircle className="w-4 h-4 text-white" /> : <FileText className="w-4 h-4 text-white" />}
                            </button>
                        </div>

                        {/* Hover Glow */}
                        <div className={`absolute -bottom-10 -right-10 w-32 h-32 rounded-full blur-[50px] transition-opacity opacity-0 group-hover:opacity-100 ${resource.isPremium ? "bg-[#FFD700]/20" : "bg-accent1/20"
                            }`} />
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
