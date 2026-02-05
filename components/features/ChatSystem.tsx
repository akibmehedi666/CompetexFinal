"use client";

import { useState } from "react";
import { Send, Users, Globe, User } from "lucide-react";
import { useStore } from "@/store/useStore";
import { cn } from "@/lib/utils";

const CHANNELS = [
    { id: "Global", icon: Globe, label: "Global Chat" },
    { id: "Team", icon: Users, label: "Team Squad" },
    { id: "Direct", icon: User, label: "Direct Msgs" },
] as const;

export function ChatSystem() {
    const [activeChannel, setActiveChannel] = useState<typeof CHANNELS[number]["id"]>("Global");
    const [input, setInput] = useState("");
    const { messages, addMessage, currentUser, activeDirectMessageUser, setActiveDirectMessageUser } = useStore();

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        addMessage({
            senderId: currentUser?.id || "anon",
            content: input,
            channel: activeChannel
        });
        setInput("");
    };

    const currentMessages = messages.filter(m => {
        if (m.channel !== activeChannel) return false;
        if (activeChannel === "Direct") {
            // Filter DMs involving BOTH current user and active target user
            return (m.senderId === currentUser?.id && m.recipientId === activeDirectMessageUser?.id) ||
                (m.senderId === activeDirectMessageUser?.id && m.recipientId === currentUser?.id);
        }
        return true;
    });

    return (
        <div className="fixed bottom-4 right-4 w-[350px] h-[500px] bg-[#0A0A0A] border border-white/10 rounded-xl shadow-2xl flex flex-col overflow-hidden z-40 transition-transform translate-y-[calc(100%-60px)] hover:translate-y-0 duration-300">
            {/* Header / Tabs */}
            <div className="bg-black/40 p-1 flex gap-1 border-b border-white/5">
                {CHANNELS.map(ch => (
                    <button
                        key={ch.id}
                        onClick={() => setActiveChannel(ch.id)}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold uppercase tracking-wider rounded transition-colors",
                            activeChannel === ch.id ? "bg-accent1/10 text-accent1" : "text-gray-500 hover:bg-white/5"
                        )}
                    >
                        <ch.icon className="w-3 h-3" /> {ch.label}
                    </button>
                ))}
            </div>

            {/* Messages Area */}
            <div className="flex-grow flex flex-col overflow-hidden bg-white/[0.02]">

                {/* Recent Contacts List (New Feature) */}
                {activeChannel === "Direct" && !activeDirectMessageUser && (
                    <div className="flex-1 overflow-y-auto p-2">
                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-2 mb-2 mt-2">Recent</div>
                        {[
                            { id: "u2", name: "Sarah Chen", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah", status: "online" },
                            { id: "u5", name: "David Kim", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David", status: "offline" },
                            { id: "u9", name: "Amy Rod", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Amy", status: "online" }
                        ].map(user => (
                            <button
                                key={user.id}
                                onClick={() => setActiveDirectMessageUser(user as any)}
                                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors text-left group"
                            >
                                <div className="relative">
                                    <div className="w-8 h-8 rounded-full bg-white/10 overflow-hidden border border-white/10 group-hover:border-accent1/50 transition-colors">
                                        <img src={user.avatar} className="w-full h-full object-cover" />
                                    </div>
                                    <div className={cn("absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-black", user.status === "online" ? "bg-green-500" : "bg-gray-500")} />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-gray-200 group-hover:text-white">{user.name}</div>
                                    <div className="text-[10px] text-gray-500">Sent a message • 2h</div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                {/* Active Chat Header */}
                {activeChannel === "Direct" && activeDirectMessageUser && (
                    <div className="flex-none flex items-center justify-between p-3 bg-accent1/5 border-b border-accent1/10">
                        <div className="flex items-center gap-2">
                            <button onClick={() => setActiveDirectMessageUser(null)} className="text-gray-400 hover:text-white mr-1">
                                &larr;
                            </button>
                            <div className="w-6 h-6 rounded-full overflow-hidden border border-accent1/30">
                                <img src={activeDirectMessageUser.avatar} alt="" className="w-full h-full object-cover" />
                            </div>
                            <span className="text-xs font-bold text-accent1">{activeDirectMessageUser.name}</span>
                        </div>
                    </div>
                )}

                {/* Message List */}
                {((activeChannel !== "Direct") || (activeChannel === "Direct" && activeDirectMessageUser)) && (
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                        {currentMessages.length === 0 && (
                            <div className="flex h-full items-center justify-center text-xs text-gray-600 italic">
                                No messages yet. Say hi!
                            </div>
                        )}
                        {currentMessages.map((msg) => (
                            <div key={msg.id} className={cn("flex flex-col", msg.senderId === currentUser?.id ? "items-end" : "items-start")}>
                                <div className={cn(
                                    "max-w-[80%] px-3 py-2 rounded-lg text-sm",
                                    msg.senderId === currentUser?.id ? "bg-accent1 text-black rounded-tr-none" : "bg-white/10 text-gray-200 rounded-tl-none"
                                )}>
                                    {msg.content}
                                </div>
                                <span className="text-[10px] text-gray-600 mt-1">Just now</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Input Area */}
            {((activeChannel !== "Direct") || (activeChannel === "Direct" && activeDirectMessageUser)) && (
                <form onSubmit={handleSend} className="p-3 bg-black/40 border-t border-white/5 flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={`Message ${activeDirectMessageUser ? activeDirectMessageUser.name : '#' + activeChannel}...`}
                        className="flex-grow bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-accent1/50 transition-colors"
                    />
                    <button type="submit" className="p-2 bg-accent1 text-black rounded hover:bg-accent1/80">
                        <Send className="w-4 h-4" />
                    </button>
                </form>
            )}
        </div>
    );
}
