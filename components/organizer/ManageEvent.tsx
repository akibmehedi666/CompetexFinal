"use client";

import { useState } from "react";
import { Bell, Send, Edit, Save, Trash2, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { LeaderboardManager } from "@/components/organizer/LeaderboardManager";

// Mock Announcements
const MOCK_ANNOUNCEMENTS = [
    {
        id: "1",
        title: "Registration Extended",
        content: "We have extended the registration deadline by 24 hours due to popular demand!",
        time: "2 hours ago",
        type: "important"
    },
    {
        id: "2",
        title: "Platform Maintenance",
        content: "The submission portal will be down for maintenance from 2 AM to 4 AM.",
        time: "1 day ago",
        type: "alert"
    }
];

export function ManageEvent({ onEdit }: { onEdit?: () => void }) {
    const [announcements, setAnnouncements] = useState(MOCK_ANNOUNCEMENTS);
    const [newAnnouncement, setNewAnnouncement] = useState({ title: "", content: "", type: "info" });
    const [isPublishing, setIsPublishing] = useState(false);

    const handlePostAnnouncement = () => {
        if (!newAnnouncement.title || !newAnnouncement.content) return;

        const announcement = {
            id: Date.now().toString(),
            title: newAnnouncement.title,
            content: newAnnouncement.content,
            time: "Just now",
            type: newAnnouncement.type
        };

        setAnnouncements([announcement, ...announcements]);
        setNewAnnouncement({ title: "", content: "", type: "info" });
        toast.success("Announcement posted successfully!");
    };

    return (
        <div className="space-y-6">
            {/* Header / Event Status */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-2xl font-bold text-white">CyberHack 2025</h2>
                        <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-bold uppercase rounded border border-green-500/30">
                            Live
                        </span>
                    </div>
                    <p className="text-gray-400 text-sm">Global AI & Cybersecurity Hackathon</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={onEdit}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white transition-colors"
                    >
                        <Edit className="w-4 h-4" /> Edit Details
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-sm text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" /> Delete
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Announcements Section */}
                <div className="md:col-span-2 space-y-6">
                    {/* Create Announcement */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                            <Bell className="w-4 h-4 text-accent1" /> Post Announcement
                        </h3>

                        <div className="space-y-4">
                            <input
                                type="text"
                                placeholder="Announcement Title"
                                value={newAnnouncement.title}
                                onChange={e => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-accent1 outline-none"
                            />
                            <textarea
                                placeholder="Message to participants..."
                                value={newAnnouncement.content}
                                onChange={e => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-accent1 outline-none min-h-[100px]"
                            />

                            <div className="flex justify-between items-center">
                                <div className="flex gap-2">
                                    {['info', 'important', 'alert'].map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setNewAnnouncement({ ...newAnnouncement, type })}
                                            className={cn(
                                                "px-3 py-1 rounded-full text-xs font-bold capitalize border transition-colors",
                                                newAnnouncement.type === type
                                                    ? "bg-white/10 border-white/30 text-white"
                                                    : "bg-transparent border-white/10 text-gray-500 hover:text-gray-300"
                                            )}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={handlePostAnnouncement}
                                    disabled={!newAnnouncement.title || !newAnnouncement.content}
                                    className="flex items-center gap-2 px-6 py-2 bg-accent1 text-black rounded-lg font-bold text-sm hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Send className="w-4 h-4" /> Post
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Past Announcements */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-gray-400 text-sm uppercase tracking-wide">Recent Announcements</h3>
                        {announcements.map(item => (
                            <div key={item.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex gap-4">
                                <div className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                                    item.type === 'alert' ? "bg-red-500/10 text-red-400" :
                                        item.type === 'important' ? "bg-accent1/10 text-accent1" :
                                            "bg-blue-500/10 text-blue-400"
                                )}>
                                    {item.type === 'alert' ? <AlertTriangle className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-bold text-white">{item.title}</h4>
                                        <span className="text-xs text-gray-500 flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> {item.time}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-400 leading-relaxed">{item.content}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <LeaderboardManager />
                </div>

                {/* Sidebar / Quick Actions */}
                <div className="space-y-6">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <h3 className="font-bold text-white mb-4">Event Control</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-black/40 rounded-lg border border-white/5">
                                <span className="text-sm text-gray-300">Public Visibility</span>
                                <div className="w-10 h-5 bg-accent1 rounded-full relative cursor-pointer">
                                    <div className="absolute right-1 top-1 w-3 h-3 bg-black rounded-full" />
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-black/40 rounded-lg border border-white/5">
                                <span className="text-sm text-gray-300">Allow Registration</span>
                                <div className="w-10 h-5 bg-accent1 rounded-full relative cursor-pointer">
                                    <div className="absolute right-1 top-1 w-3 h-3 bg-black rounded-full" />
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-black/40 rounded-lg border border-white/5">
                                <span className="text-sm text-gray-300">Automated Judging</span>
                                <div className="w-10 h-5 bg-gray-700 rounded-full relative cursor-pointer">
                                    <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-accent1/10 to-transparent border border-accent1/20 rounded-xl p-6">
                        <h4 className="font-bold text-white mb-2">Need Help?</h4>
                        <p className="text-xs text-gray-400 mb-4">
                            Check our organizer guide for tips on running successful events.
                        </p>
                        <button className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold text-white transition-colors">
                            View Documentation
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
