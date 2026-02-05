"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Users, Sparkles, Paperclip, Smile } from "lucide-react";
import { cn } from "@/lib/utils";

interface TeamMember {
    id: string;
    name: string;
    avatar: string;
    role: "leader" | "member";
    skills: string[];
}

interface Team {
    id: string;
    name: string;
    members: TeamMember[];
    requiredSkills: string[];
}

interface ChatMessage {
    id: string;
    senderId: string;
    senderName: string;
    content: string;
    timestamp: Date;
    isRead: boolean;
}

interface ChatSidePanelProps {
    isOpen: boolean;
    onClose: () => void;
    team: Team | null;
    userSkills: string[];
    currentUserId: string;
}

export function ChatSidePanel({ isOpen, onClose, team, userSkills, currentUserId }: ChatSidePanelProps) {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [showMembers, setShowMembers] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Calculate matching skills
    const matchingSkills = team ? team.requiredSkills.filter(skill => userSkills.includes(skill)) : [];

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Focus input when panel opens
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [isOpen]);

    const handleSend = () => {
        if (!message.trim() || !team) return;

        const newMessage: ChatMessage = {
            id: Date.now().toString(),
            senderId: currentUserId,
            senderName: "You",
            content: message.trim(),
            timestamp: new Date(),
            isRead: false,
        };

        setMessages([...messages, newMessage]);
        setMessage("");

        // Simulate team response (for demo)
        setTimeout(() => {
            const responseMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                senderId: team.members[0].id,
                senderName: team.members[0].name,
                content: "Thanks for reaching out! We'd love to have you on our team.",
                timestamp: new Date(),
                isRead: false,
            };
            setMessages(prev => [...prev, responseMessage]);
        }, 2000);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (!team) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    />

                    {/* Side Panel */}
                    <motion.div
                        initial={{ x: 400, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 400, opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-full sm:w-[400px] bg-black/95 backdrop-blur-xl border-l border-white/10 z-50 flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/10">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-1">{team.name}</h2>
                                    <p className="text-sm text-gray-400">{team.members.length} members</p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Matching Skills */}
                            {matchingSkills.length > 0 && (
                                <div className="p-3 rounded-xl bg-[#AAFF00]/10 border border-[#AAFF00]/30">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Sparkles className="w-4 h-4 text-[#AAFF00]" />
                                        <span className="text-xs font-bold text-[#AAFF00] uppercase tracking-wider">
                                            Matching Skills
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {matchingSkills.map((skill) => (
                                            <span
                                                key={skill}
                                                className="px-2 py-1 rounded-md text-xs font-semibold bg-[#AAFF00]/20 text-[#AAFF00]"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Toggle Members Button */}
                            <button
                                onClick={() => setShowMembers(!showMembers)}
                                className="mt-3 w-full py-2 px-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-between text-sm font-medium text-gray-300"
                            >
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4" />
                                    <span>Team Members</span>
                                </div>
                                <span className="text-xs text-gray-500">{showMembers ? "Hide" : "Show"}</span>
                            </button>

                            {/* Members List */}
                            <AnimatePresence>
                                {showMembers && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="mt-3 space-y-2">
                                            {team.members.map((member) => (
                                                <div
                                                    key={member.id}
                                                    className="flex items-center gap-3 p-2 rounded-lg bg-white/5"
                                                >
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00E5FF]/40 to-[#AAFF00]/40 flex items-center justify-center text-white font-bold text-xs overflow-hidden">
                                                        {member.avatar ? (
                                                            <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            member.name.charAt(0).toUpperCase()
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-semibold text-white truncate">{member.name}</p>
                                                        <p className="text-xs text-gray-500 capitalize">{member.role}</p>
                                                    </div>
                                                    {member.role === "leader" && (
                                                        <span className="text-xs px-2 py-0.5 rounded-full bg-[#FFB800]/20 text-[#FFB800] border border-[#FFB800]/30">
                                                            Lead
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center">
                                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                        <MessageCircle className="w-8 h-8 text-gray-600" />
                                    </div>
                                    <p className="text-gray-400 text-sm mb-2">Start a conversation</p>
                                    <p className="text-gray-600 text-xs max-w-xs">
                                        Introduce yourself and discuss your interest in joining this team
                                    </p>
                                </div>
                            ) : (
                                messages.map((msg) => {
                                    const isCurrentUser = msg.senderId === currentUserId;
                                    return (
                                        <motion.div
                                            key={msg.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={cn(
                                                "flex",
                                                isCurrentUser ? "justify-end" : "justify-start"
                                            )}
                                        >
                                            <div
                                                className={cn(
                                                    "max-w-[80%] rounded-2xl px-4 py-3",
                                                    isCurrentUser
                                                        ? "bg-[#00E5FF] text-black"
                                                        : "bg-white/10 text-white"
                                                )}
                                            >
                                                {!isCurrentUser && (
                                                    <p className="text-xs font-semibold mb-1 opacity-70">
                                                        {msg.senderName}
                                                    </p>
                                                )}
                                                <p className="text-sm">{msg.content}</p>
                                                <p className={cn(
                                                    "text-[10px] mt-1",
                                                    isCurrentUser ? "text-black/60" : "text-gray-500"
                                                )}>
                                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </motion.div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-6 border-t border-white/10">
                            <div className="flex gap-2 mb-3">
                                <button className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white">
                                    <Paperclip className="w-5 h-5" />
                                </button>
                                <button className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white">
                                    <Smile className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="flex gap-2">
                                <textarea
                                    ref={inputRef}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Type your message..."
                                    rows={1}
                                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-gray-500 focus:border-[#00E5FF]/50 focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/20 resize-none"
                                    style={{ minHeight: '48px', maxHeight: '120px' }}
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!message.trim()}
                                    className={cn(
                                        "px-4 py-3 rounded-xl font-bold transition-all",
                                        message.trim()
                                            ? "bg-[#00E5FF] text-black hover:bg-[#00E5FF]/80 shadow-[0_0_20px_rgba(0,229,255,0.3)]"
                                            : "bg-white/5 text-gray-600 cursor-not-allowed"
                                    )}
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                            <p className="text-xs text-gray-600 mt-2">Press Enter to send, Shift+Enter for new line</p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

function MessageCircle({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
    );
}
