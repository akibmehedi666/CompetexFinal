"use client";

import { useState } from "react";
import { Search, Trophy, Save, RefreshCw, Upload, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Mock Leaderboard Data
const INITIAL_LEADERBOARD = [
    { id: "1", team: "CyberPunkz", members: 3, score: 950, rank: 1, status: "Qualified" },
    { id: "2", team: "Neural Net", members: 4, score: 880, rank: 2, status: "Qualified" },
    { id: "3", team: "Code Warriors", members: 2, score: 820, rank: 3, status: "Qualified" },
    { id: "4", team: "Byte Busters", members: 3, score: 750, rank: 4, status: "Review" },
    { id: "5", team: "Algo Rythm", members: 4, score: 720, rank: 5, status: "Eliminated" },
];

export function LeaderboardManager() {
    const [leaderboard, setLeaderboard] = useState(INITIAL_LEADERBOARD);
    const [isEditing, setIsEditing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const handleScoreChange = (id: string, newScore: string) => {
        const score = parseInt(newScore) || 0;
        setLeaderboard(prev => prev.map(item =>
            item.id === id ? { ...item, score } : item
        ));
    };

    const handleTeamNameChange = (id: string, newName: string) => {
        setLeaderboard(prev => prev.map(item =>
            item.id === id ? { ...item, team: newName } : item
        ));
    };

    const handleStatusChange = (id: string, newStatus: string) => {
        setLeaderboard(prev => prev.map(item =>
            item.id === id ? { ...item, status: newStatus } : item
        ));
    };

    const handleAddEntry = () => {
        const newEntry = {
            id: Date.now().toString(),
            team: "New Team",
            members: 1,
            score: 0,
            rank: leaderboard.length + 1,
            status: "Qualified"
        };
        setLeaderboard([...leaderboard, newEntry]);
    };

    const handleDelete = (id: string) => {
        setLeaderboard(prev => prev.filter(item => item.id !== id));
    };

    const handleSave = () => {
        // Sort by score
        const sorted = [...leaderboard].sort((a, b) => b.score - a.score);
        // Re-assign ranks
        const ranked = sorted.map((item, index) => ({ ...item, rank: index + 1 }));

        setLeaderboard(ranked);
        setIsEditing(false);
        toast.success("Leaderboard updated and published successfully!");
    };

    const filteredData = leaderboard.filter(item =>
        item.team.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-yellow-500" /> Leaderboard Management
                        </h3>
                        <p className="text-sm text-gray-400">Update scores and publish final results.</p>
                    </div>

                    <div className="flex gap-2 w-full md:w-auto">
                        {isEditing ? (
                            <>
                                <button
                                    onClick={handleAddEntry}
                                    className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-lg text-sm font-bold transition-colors"
                                >
                                    + Add Team
                                </button>
                                <button
                                    onClick={() => handleSave()}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 rounded-lg text-sm font-bold transition-colors"
                                >
                                    <Save className="w-4 h-4" /> Save & Publish
                                </button>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-gray-400 font-bold transition-colors"
                                >
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-accent1/10 hover:bg-accent1/20 text-accent1 border border-accent1/20 rounded-lg text-sm font-bold transition-colors"
                            >
                                <Trophy className="w-4 h-4" /> Edit Scores
                            </button>
                        )}
                        <button className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-400" title="Upload CSV">
                            <Upload className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search teams..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:border-accent1 outline-none"
                    />
                </div>

                <div className="overflow-hidden rounded-lg border border-white/10">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 border-b border-white/10 text-xs uppercase text-gray-400 font-bold">
                            <tr>
                                <th className="p-4 w-16 text-center">Rank</th>
                                <th className="p-4">Team Name</th>
                                <th className="p-4 text-center">Score</th>
                                <th className="p-4">Status</th>
                                {isEditing && <th className="p-4 w-10"></th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredData.map((item) => (
                                <tr key={item.id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4 text-center">
                                        <div className={cn(
                                            "w-8 h-8 rounded-full flex items-center justify-center mx-auto font-bold text-sm",
                                            item.rank === 1 ? "bg-yellow-500/20 text-yellow-500" :
                                                item.rank === 2 ? "bg-gray-400/20 text-gray-400" :
                                                    item.rank === 3 ? "bg-orange-500/20 text-orange-500" :
                                                        "bg-white/5 text-gray-500"
                                        )}>
                                            {item.rank}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={item.team}
                                                onChange={(e) => handleTeamNameChange(item.id, e.target.value)}
                                                className="w-full bg-black border border-white/20 rounded px-2 py-1 text-white text-sm focus:border-accent1 outline-none"
                                            />
                                        ) : (
                                            <>
                                                <div className="font-bold text-white">{item.team}</div>
                                                <div className="text-xs text-gray-500">{item.members} members</div>
                                            </>
                                        )}
                                    </td>
                                    <td className="p-4 text-center">
                                        {isEditing ? (
                                            <input
                                                type="number"
                                                value={item.score}
                                                onChange={(e) => handleScoreChange(item.id, e.target.value)}
                                                className="w-20 bg-black border border-white/20 rounded px-2 py-1 text-center text-white font-mono focus:border-accent1 outline-none"
                                            />
                                        ) : (
                                            <span className="font-mono text-white text-lg">{item.score}</span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        {isEditing ? (
                                            <select
                                                value={item.status}
                                                onChange={(e) => handleStatusChange(item.id, e.target.value)}
                                                className="bg-black border border-white/20 rounded px-2 py-1 text-xs text-gray-300 focus:border-accent1 outline-none"
                                            >
                                                <option value="Qualified">Qualified</option>
                                                <option value="Review">Review</option>
                                                <option value="Eliminated">Eliminated</option>
                                                <option value="Winner">Winner</option>
                                            </select>
                                        ) : (
                                            <span className={cn(
                                                "px-2 py-1 rounded-full text-xs font-bold border",
                                                item.status === "Qualified" ? "bg-green-500/10 text-green-400 border-green-500/20" :
                                                    item.status === "Eliminated" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                                                        item.status === "Winner" ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" :
                                                            "bg-gray-500/10 text-gray-400 border-gray-500/20"
                                            )}>
                                                {item.status}
                                            </span>
                                        )}
                                    </td>
                                    {isEditing && (
                                        <td className="p-4">
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="text-gray-500 hover:text-red-400 transition-colors"
                                            >
                                                <RefreshCw className="w-4 h-4 rotate-45" />
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {!isEditing && (
                    <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                        <span>Last updated: just now</span>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-3 h-3 text-green-500" /> All scores synced
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
