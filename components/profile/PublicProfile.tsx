"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Github, Linkedin, Shield, MapPin, Award, Globe, MessageSquare, Trophy, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { User } from "@/types";
import { AchievementsGallery } from "@/components/participant/AchievementsGallery";
import { CompetitionHistory } from "@/components/participant/CompetitionHistory";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface PublicProfileProps {
    user: User;
    onMessageClick?: (user: User) => void;
}

export function PublicProfile({ user, onMessageClick }: PublicProfileProps) {
    const [activeTab, setActiveTab] = useState<"overview" | "achievements" | "history">("overview");
    const router = useRouter();

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
            {/* Elegant Header Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 mb-8 backdrop-blur-3xl overflow-hidden shadow-2xl"
            >
                {/* Visual Flair */}
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-accent1/5 rounded-full blur-[100px] -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-accent2/5 rounded-full blur-[80px] -ml-20 -mb-20" />

                <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-10">
                    {/* Hero Avatar Area */}
                    <div className="relative group">
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-2 border-accent1/30 p-1.5 overflow-hidden transition-all duration-500 group-hover:border-accent1 group-hover:shadow-[0_0_30px_rgba(0,229,255,0.3)]">
                            {user.avatar ? (
                                <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500" />
                            ) : (
                                <div className="w-full h-full rounded-full bg-white/5 flex items-center justify-center">
                                    <UserPlaceholder />
                                </div>
                            )}
                        </div>
                        {user.verified && (
                            <div className="absolute -bottom-2 -right-2 bg-black border border-white/10 p-1.5 rounded-full shadow-lg">
                                <Shield className="w-5 h-5 text-accent1 fill-accent1/10" />
                            </div>
                        )}
                    </div>

                    {/* Brand Identity / Bio */}
                    <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">{user.name}</h1>
                            <div className="flex items-center justify-center md:justify-start gap-2">
                                <span className="px-3 py-1 bg-white/5 border border-white/10 text-gray-400 text-[10px] font-bold uppercase tracking-widest rounded-md">
                                    {user.role}
                                </span>
                                <span className="px-3 py-1 bg-accent1/10 border border-accent1/20 text-accent1 text-[10px] font-bold uppercase tracking-widest rounded-md">
                                    Top 5%
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2 text-gray-400 text-sm mb-6">
                            <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-accent1/70" /> {user.university || 'Independent Agent'}</span>
                            <span className="w-1 h-1 rounded-full bg-gray-700 hidden md:block" />
                            <span className="flex items-center gap-2"><Trophy className="w-4 h-4 text-yellow-500/70" /> {user.stats?.eventsWon || 0} Wins</span>
                            <span className="w-1 h-1 rounded-full bg-gray-700 hidden md:block" />
                            <span className="flex items-center gap-2 font-mono text-white/80">RANK #{user.stats?.rank || 999}</span>
                        </div>

                        <p className="text-gray-400 text-md leading-relaxed mb-8 max-w-2xl italic">
                            "{user.bio || 'Building the future, one byte at a time. Specializing in high-performance architecture and creative engineering.'}"
                        </p>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                            {onMessageClick && (
                                <button
                                    onClick={() => {
                                        if (onMessageClick) {
                                            onMessageClick(user);
                                            router.push('/messages');
                                        }
                                    }}
                                    className="flex items-center gap-2 px-8 py-3 bg-accent1 text-black font-bold uppercase tracking-widest text-xs rounded-xl hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,229,255,0.4)]"
                                >
                                    <MessageSquare className="w-4 h-4" /> Message
                                </button>
                            )}
                            <div className="flex gap-2">
                                {user.github && <SocialLink icon={Github} url={user.github} />}
                                {user.linkedin && <SocialLink icon={Linkedin} url={user.linkedin} />}
                                {user.portfolio && <SocialLink icon={Globe} url={user.portfolio} />}
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Navigation Tabs */}
            <div className="flex gap-2 mb-10 overflow-x-auto pb-2 no-scrollbar border-b border-white/5">
                {[
                    { id: "overview", label: "Agent Overview", icon: Shield },
                    { id: "achievements", label: "Credentials", icon: Award },
                    { id: "history", label: "Battle History", icon: Trophy }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={cn(
                            "group flex items-center gap-3 px-8 py-4 text-xs font-bold uppercase tracking-widest transition-all relative overflow-hidden",
                            activeTab === tab.id
                                ? "text-accent1"
                                : "text-gray-500 hover:text-white"
                        )}
                    >
                        <tab.icon className={cn("w-4 h-4 transition-colors", activeTab === tab.id ? "text-accent1" : "text-gray-500 group-hover:text-gray-300")} />
                        {tab.label}
                        {activeTab === tab.id && (
                            <motion.div layoutId="profileTab" className="absolute bottom-0 left-0 w-full h-0.5 bg-accent1" />
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="min-h-[400px]"
                >
                    {activeTab === "overview" && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Skills & Arsena */}
                            <div className="lg:col-span-2 space-y-8">
                                <section className="bg-white/5 border border-white/10 rounded-2xl p-8">
                                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                                        <Trophy className="w-5 h-5 text-accent2" /> Core Arsena
                                    </h3>
                                    <div className="flex flex-wrap gap-3">
                                        {(user.skills || []).map((skill, i) => (
                                            <div key={i} className="group relative">
                                                <div className="absolute inset-0 bg-accent1/20 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                                                <div className="relative px-4 py-2 bg-white/5 border border-white/10 text-gray-300 text-sm rounded-lg hover:border-accent1/50 hover:text-white transition-all">
                                                    {skill}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <StatCard label="Hackathons Won" value={user.stats?.eventsWon || 0} icon={Trophy} color="text-yellow-500" />
                                    <StatCard label="Global Rank" value={`#${user.stats?.rank || 999}`} icon={Star} color="text-accent1" />
                                </div>
                            </div>

                            {/* Sidebar Info */}
                            <div className="space-y-6">
                                <div className="bg-gradient-to-br from-accent1/10 to-transparent border border-accent1/20 rounded-2xl p-6">
                                    <h4 className="text-sm font-bold text-accent1 uppercase tracking-widest mb-4">Availability</h4>
                                    <div className="flex items-center gap-3 text-white">
                                        <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]" />
                                        <span className="font-medium">Open for Collaboration</span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-2">Highly responsive to direct messages within 2 hours.</p>
                                </div>

                                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Top Accomplishment</h4>
                                    <div className="space-y-4">
                                        <div className="p-4 bg-black/40 border border-white/5 rounded-xl">
                                            <div className="text-accent2 font-bold text-sm mb-1">Global AI Hackathon 2025</div>
                                            <div className="text-white text-xs">First Place - Financial Inclusion Track</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "achievements" && (
                        <AchievementsGallery achievements={user.achievements || []} />
                    )}

                    {activeTab === "history" && (
                        <CompetitionHistory history={user.competitionHistory || []} />
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

function SocialLink({ icon: Icon, url }: { icon: any, url: string }) {
    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-accent1/10 hover:border-accent1/40 text-gray-400 hover:text-accent1 transition-all"
        >
            <Icon className="w-5 h-5" />
        </a>
    );
}

function StatCard({ label, value, icon: Icon, color }: { label: string, value: string | number, icon: any, color: string }) {
    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center justify-between group hover:border-white/20 transition-all">
            <div>
                <div className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">{label}</div>
                <div className="text-2xl font-bold text-white">{value}</div>
            </div>
            <div className={cn("p-3 bg-white/5 rounded-xl group-hover:scale-110 transition-transform", color)}>
                <Icon className="w-6 h-6" />
            </div>
        </div>
    );
}

function UserPlaceholder() {
    return (
        <svg className="w-16 h-16 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
    );
}
