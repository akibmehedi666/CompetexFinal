"use client";

import { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/ui/Navbar";
import {
    Search, Phone, Video, MoreVertical,
    Paperclip, Send, Smile,
    Check, CheckCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/store/useStore";
import { useSearchParams } from "next/navigation";

interface Conversation {
    id: string;
    name: string;
    avatar: string;
    lastMessage: string;
    time: string;
    unread: number;
    online: boolean;
}

interface Message {
    id: string;
    senderId: string;
    text: string;
    time: string;
    isMe: boolean;
    status: "read" | "sent";
}

export default function MessagesPage() {
    const { currentUser, activeDirectMessageUser, setActiveDirectMessageUser } = useStore();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [activeChatId, setActiveChatId] = useState<string | null>(null);
    const [inputText, setInputText] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initial Load & Polling for conversations
    useEffect(() => {
        if (!currentUser) return;

        const fetchConversations = async () => {
            try {
                const res = await fetch(`http://localhost/Competex/api/get_conversations.php?user_id=${currentUser.id}`);
                const data = await res.json();
                if (Array.isArray(data)) {
                    setConversations(prev => {
                        // If we have an active chat that is newly created (not in DB yet), preserve it
                        if (activeChatId) {
                            const currentActive = prev.find(c => c.id === activeChatId);
                            // If active chat exists locally but not in incoming data, prepend it
                            if (currentActive && !data.some(d => d.id === activeChatId)) {
                                return [currentActive, ...data];
                            }
                        }

                        // Ensure no duplicates in general (just in case)
                        const uniqueMap = new Map();
                        data.forEach(item => uniqueMap.set(item.id, item));

                        // If we are preserving activeChat, make sure we use that one if valid? 
                        // Actually the logic above handles preservation if missing.

                        return Array.from(uniqueMap.values());
                    });
                }
            } catch (err) {
                console.error("Failed to fetch conversations", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchConversations();
        const interval = setInterval(fetchConversations, 5000); // Poll every 5s
        return () => clearInterval(interval);
    }, [currentUser, activeChatId]);

    // Handle Direct Message Redirection from Profile
    useEffect(() => {
        if (activeDirectMessageUser && currentUser) {
            const existingChat = conversations.find(c => c.id === activeDirectMessageUser.id);

            if (existingChat) {
                setActiveChatId(existingChat.id);
            } else {
                // Determine name correctly (support both API structures if needed)
                const name = activeDirectMessageUser.name || 'Unknown User';

                // Temporary conversation entry until first message is sent
                const newChat: Conversation = {
                    id: activeDirectMessageUser.id,
                    name: name,
                    avatar: activeDirectMessageUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
                    lastMessage: "Drafting...",
                    time: "Now",
                    unread: 0,
                    online: false
                };

                setConversations(prev => {
                    if (prev.some(c => c.id === newChat.id)) return prev;
                    return [newChat, ...prev];
                });
                setActiveChatId(activeDirectMessageUser.id);
            }
            // Clear the global state so we don't reset on every render
            // setActiveDirectMessageUser(null); // Optional: Consider keeping if we want persistence across nav
        }
    }, [activeDirectMessageUser, conversations, currentUser]); // Removed setActiveDirectMessageUser dependency to avoid loops if logic changes

    // Fetch Messages when Active Chat Changes
    useEffect(() => {
        if (!currentUser || !activeChatId) return;

        const fetchMessages = async () => {
            try {
                const res = await fetch(`http://localhost/Competex/api/get_messages.php?user_id=${currentUser.id}&other_id=${activeChatId}`);
                const data = await res.json();
                if (Array.isArray(data)) {
                    setMessages(data);
                    scrollToBottom();
                }
            } catch (err) {
                console.error("Failed to fetch messages", err);
            }
        };

        fetchMessages();
        const interval = setInterval(fetchMessages, 3000); // Poll messages more frequently
        return () => clearInterval(interval);
    }, [activeChatId, currentUser]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleSendMessage = async () => {
        if (!inputText.trim() || !currentUser || !activeChatId) return;

        const tempId = Date.now().toString();
        const tempMsg: Message = {
            id: tempId,
            senderId: currentUser.id,
            text: inputText,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isMe: true,
            status: 'sent'
        };

        // Optimistic UI update
        setMessages(prev => [...prev, tempMsg]);
        setInputText("");
        scrollToBottom();

        try {
            await fetch('http://localhost/Competex/api/send_message.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sender_id: currentUser.id,
                    recipient_id: activeChatId,
                    content: tempMsg.text
                })
            });
            // Refetch to confirm sync? Or just let poller handle it
        } catch (err) {
            console.error("Failed to send message", err);
            // Optionally remove message or show error
        }
    };

    // Derived active chat object
    const activeChat = conversations.find(c => c.id === activeChatId) || (activeChatId && activeDirectMessageUser && activeDirectMessageUser.id === activeChatId ? {
        id: activeDirectMessageUser.id,
        name: activeDirectMessageUser.name || 'User',
        avatar: activeDirectMessageUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${activeDirectMessageUser.name || 'User'}`,
        lastMessage: '',
        time: '',
        unread: 0,
        online: false
    } : undefined);

    if (!currentUser) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
                <Navbar />
                <h2 className="text-2xl font-bold">Please Login to Access Messages</h2>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black flex flex-col">
            <Navbar />

            <div className="flex-1 pt-20 px-6 pb-6 container mx-auto h-[calc(100vh-80px)]">
                <div className="flex bg-[#0F0F0F] border border-white/5 rounded-2xl overflow-hidden h-[calc(100vh-120px)] shadow-2xl">

                    {/* Sidebar */}
                    <div className="w-80 border-r border-white/5 flex flex-col bg-[#0A0A0A]">
                        <div className="p-6">
                            <h2 className="text-2xl font-bold text-white mb-6">Messages</h2>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Search conversations..."
                                    className="w-full bg-[#1A1A1A] border border-white/5 rounded-xl py-3 pl-10 pr-4 text-sm text-gray-300 focus:outline-none focus:border-accent1/30 transition-colors"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            <div className="px-3 space-y-1">
                                {conversations.map((chat) => (
                                    <button
                                        key={chat.id}
                                        onClick={() => setActiveChatId(chat.id)}
                                        className={cn(
                                            "w-full p-3 rounded-xl flex items-start gap-3 transition-all group relative overflow-hidden",
                                            activeChatId === chat.id
                                                ? "bg-accent1/5 border border-accent1/10"
                                                : "hover:bg-white/5 border border-transparent"
                                        )}
                                    >
                                        {activeChatId === chat.id && (
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent1 shadow-[0_0_10px_#00E5FF]" />
                                        )}

                                        <div className="relative flex-shrink-0">
                                            <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10">
                                                <img
                                                    src={chat.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${chat.name}`}
                                                    alt={chat.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            {/* Online status indicator can be real if we implement socket/polling for presence */}
                                        </div>

                                        <div className="flex-1 text-left min-w-0">
                                            <div className="flex justify-between items-baseline mb-1">
                                                <h3 className={cn("text-sm font-bold truncate", activeChatId === chat.id ? "text-white" : "text-gray-300")}>
                                                    {chat.name}
                                                </h3>
                                                <span className={cn("text-[10px]", activeChatId === chat.id ? "text-accent1" : "text-gray-600")}>
                                                    {chat.time}
                                                </span>
                                            </div>
                                            <p className={cn("text-xs truncate", activeChatId === chat.id ? "text-gray-300" : "text-gray-500")}>
                                                {chat.lastMessage}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                                {conversations.length === 0 && !isLoading && (
                                    <div className="text-center py-10 text-gray-500 text-sm">
                                        No conversations yet. Start one from the Community page!
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 flex flex-col bg-[#0F0F0F] relative">
                        {/* Chat Header */}
                        {activeChat ? (
                            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#0F0F0F] z-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10">
                                        <img
                                            src={activeChat.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${activeChat.name}`}
                                            alt={activeChat.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white">{activeChat.name}</h3>
                                        <span className="text-xs text-gray-500 flex items-center gap-1">• Online</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-gray-400">
                                    <button className="p-2 hover:bg-white/5 rounded-full hover:text-white transition-colors"><Phone className="w-5 h-5" /></button>
                                    <button className="p-2 hover:bg-white/5 rounded-full hover:text-white transition-colors"><Video className="w-5 h-5" /></button>
                                    <button className="p-2 hover:bg-white/5 rounded-full hover:text-white transition-colors"><MoreVertical className="w-5 h-5" /></button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-gray-500">
                                Select a conversation to start messaging
                            </div>
                        )}

                        {/* Messages List */}
                        {activeChat && (
                            <>
                                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                    {messages.map((msg) => (
                                        <div
                                            key={msg.id}
                                            className={cn(
                                                "flex gap-3 max-w-[70%]",
                                                msg.isMe ? "ml-auto flex-row-reverse" : ""
                                            )}
                                        >
                                            {!msg.isMe && (
                                                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 mt-auto border border-white/10">
                                                    <img src={activeChat.avatar} className="w-full h-full object-cover" />
                                                </div>
                                            )}

                                            <div className={cn("flex flex-col", msg.isMe ? "items-end" : "items-start")}>
                                                <div
                                                    className={cn(
                                                        "p-4 rounded-2xl text-sm leading-relaxed",
                                                        msg.isMe
                                                            ? "bg-accent1 text-black rounded-br-none"
                                                            : "bg-white/10 text-gray-200 rounded-bl-none"
                                                    )}
                                                >
                                                    {msg.text}
                                                </div>
                                                <span className="text-[10px] text-gray-500 mt-1 flex items-center gap-1">
                                                    {msg.time}
                                                    {msg.isMe && msg.status === 'read' && <CheckCheck className="w-3 h-3 text-accent1" />}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input Area */}
                                <div className="p-4 border-t border-white/5 bg-[#0F0F0F]">
                                    <div className="bg-[#151515] border border-white/5 rounded-xl flex items-center p-2 gap-2">
                                        <button className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                                            <Paperclip className="w-5 h-5" />
                                        </button>
                                        <input
                                            type="text"
                                            value={inputText}
                                            onChange={(e) => setInputText(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                            placeholder="Type a message..."
                                            className="flex-1 bg-transparent border-none focus:outline-none text-white text-sm px-2"
                                        />
                                        <button className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                                            <Smile className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={handleSendMessage}
                                            className="p-3 bg-accent1 text-black rounded-lg hover:bg-accent1/80 transition-colors"
                                        >
                                            <Send className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
