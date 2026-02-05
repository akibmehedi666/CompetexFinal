"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Trophy, TrendingUp, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

const MOCK_TEAMS = [
    { id: "t1", name: "NullPointers", score: 1250, change: 12 },
    { id: "t2", name: "GlitchHunters", score: 1200, change: -5 },
    { id: "t3", name: "CyberSages", score: 1150, change: 8 },
    { id: "t4", name: "PixelPerfect", score: 1100, change: 20 },
    { id: "t5", name: "RocketDevs", score: 1050, change: 0 },
];

const MOCK_UNIS = [
    { id: "u1", name: "TechUniversity", score: 5400, change: 45 },
    { id: "u2", name: "Science Inst.", score: 4800, change: 10 },
    { id: "u3", name: "InnovateLabs", score: 4200, change: -15 },
];

export function Leaderboard() {
    const [activeTab, setActiveTab] = useState<"Teams" | "Universities">("Teams");
    const [data, setData] = useState(MOCK_TEAMS);

    // Simulate Live Updates
    useEffect(() => {
        const interval = setInterval(() => {
            setData(prev => {
                const newData = [...prev];
                const idx = Math.floor(Math.random() * newData.length);
                const change = Math.floor(Math.random() * 50) - 20;
                newData[idx] = {
                    ...newData[idx],
                    score: newData[idx].score + change,
                    change: change
                };
                return newData.sort((a, b) => b.score - a.score);
            });
        }, 2500);
        return () => clearInterval(interval);
    }, [activeTab]);

    useEffect(() => {
        setData(activeTab === "Teams" ? MOCK_TEAMS : MOCK_UNIS);
    }, [activeTab]);

    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-accent2" /> Live Rankings
                </h3>

                <div className="flex bg-black/20 rounded-lg p-1">
                    {["Teams", "Universities"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={cn(
                                "px-3 py-1 text-xs font-bold uppercase rounded-md transition-all",
                                activeTab === tab ? "bg-accent2 text-black" : "text-gray-400 hover:text-white"
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-grow overflow-hidden relative">
                <div className="grid grid-cols-12 text-[10px] font-medium text-gray-500 uppercase tracking-wider pb-2 border-b border-white/10 mb-2">
                    <span className="col-span-2">Rank</span>
                    <span className="col-span-6">Name</span>
                    <span className="col-span-2">Trend</span>
                    <span className="col-span-2 text-right">XP</span>
                </div>

                <div className="relative space-y-2">
                    <AnimatePresence>
                        {data.map((item, index) => (
                            <motion.div
                                layout
                                key={item.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                className={cn(
                                    "grid grid-cols-12 items-center p-3 rounded-lg border border-transparent transition-all",
                                    index === 0 ? "bg-accent2/10 border-accent2/20 shadow-[0_0_15px_rgba(173,255,0,0.1)]" : "bg-white/5 hover:bg-white/10"
                                )}
                            >
                                <div className="col-span-2 font-mono font-bold text-white">
                                    {index + 1 === 1 ? <Trophy className="w-4 h-4 text-accent2" /> : `#${index + 1}`}
                                </div>

                                <div className="col-span-6 font-medium text-gray-200 truncate flex items-center gap-2">
                                    {activeTab === "Universities" && <Shield className="w-3 h-3 text-gray-500" />}
                                    {item.name}
                                </div>

                                <div className={cn("col-span-2 text-xs font-mono flex items-center gap-1", item.change >= 0 ? "text-green-400" : "text-red-400")}>
                                    {item.change !== 0 && <TrendingUp className={cn("w-3 h-3", item.change < 0 && "rotate-180")} />}
                                    {item.change > 0 ? "+" : ""}{item.change}
                                </div>

                                <div className="col-span-2 text-right font-mono text-accent1 font-bold">
                                    {item.score}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
