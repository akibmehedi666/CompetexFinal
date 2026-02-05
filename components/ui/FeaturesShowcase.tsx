"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import {
    Calendar,
    Users,
    Trophy,
    MapPin,
    BookOpen,
    MessageSquare,
    Handshake,
    Star,
    Building2,
    Briefcase,
    Shield,
    Zap
} from "lucide-react";
import Link from "next/link";

const FEATURES = [
    {
        icon: Calendar,
        title: "Event Hub",
        description: "Discover hackathons, competitions, and seminars from universities nationwide. Filter by category, mode, and status.",
        href: "/events",
        color: "from-blue-500 to-cyan-500",
        bgGlow: "bg-blue-500/10"
    },
    {
        icon: Users,
        title: "Team Builder",
        description: "Build your dream squad. Search for talent by skills, invite members, and collaborate on competition projects.",
        href: "/teams",
        color: "from-purple-500 to-pink-500",
        bgGlow: "bg-purple-500/10"
    },
    {
        icon: Trophy,
        title: "Leaderboard",
        description: "Track your rank and compete with the best. View institution rankings and individual achievements.",
        href: "/leaderboard",
        color: "from-yellow-500 to-orange-500",
        bgGlow: "bg-yellow-500/10"
    },
    {
        icon: MapPin,
        title: "Venue Map",
        description: "Interactive map showing event locations across the country. Never miss an event near you.",
        href: "/map",
        color: "from-green-500 to-emerald-500",
        bgGlow: "bg-green-500/10"
    },
    {
        icon: MessageSquare,
        title: "Community",
        description: "Connect with fellow competitors, view profiles, and start direct conversations with potential teammates.",
        href: "/people",
        color: "from-accent1 to-accent2",
        bgGlow: "bg-accent1/10"
    },
    {
        icon: BookOpen,
        title: "Resources",
        description: "Access curated learning materials, tutorials, and courses to sharpen your competitive edge.",
        href: "/resources",
        color: "from-indigo-500 to-purple-500",
        bgGlow: "bg-indigo-500/10"
    },
    {
        icon: Handshake,
        title: "Sponsorships",
        description: "Organizers can find sponsors, and sponsors can discover promising events to support.",
        href: "/sponsorship",
        color: "from-rose-500 to-red-500",
        bgGlow: "bg-rose-500/10"
    },
    {
        icon: Briefcase,
        title: "Recruitment",
        description: "Launch your career. Recruiters can scout top talent based on real performance data, and students can find dream opportunities.",
        href: "/recruitment",
        color: "from-teal-500 to-emerald-500",
        bgGlow: "bg-teal-500/10"
    },
    {
        icon: Building2,
        title: "Institutions",
        description: "Explore university profiles, rankings, and their competitive achievements across the platform.",
        href: "/institutions",
        color: "from-slate-500 to-gray-500",
        bgGlow: "bg-slate-500/10"
    },
    {
        icon: Star,
        title: "Rating System",
        description: "Rate events you've participated in and help others make informed decisions.",
        href: "/rating",
        color: "from-amber-500 to-yellow-500",
        bgGlow: "bg-amber-500/10"
    }
];

const STATS = [
    { label: "Active Events", value: "150+", icon: Zap },
    { label: "Universities", value: "50+", icon: Building2 },
    { label: "Participants", value: "10K+", icon: Users },
    { label: "Success Rate", value: "95%", icon: Shield }
];

export function FeaturesShowcase() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <section ref={ref} className="relative py-32 px-4 overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent1/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent2/5 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-20"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mb-6">
                        <Zap className="w-4 h-4 text-accent1" />
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-300">
                            Platform Features
                        </span>
                    </div>
                    <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
                        Everything You Need to <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent1 to-accent2">Compete</span>
                    </h2>
                    <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                        A comprehensive ecosystem designed for students, organizers, sponsors, and recruiters to connect, compete, and grow.
                    </p>
                </motion.div>

                {/* Stats Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20"
                >
                    {STATS.map((stat, index) => (
                        <div
                            key={stat.label}
                            className="relative group bg-white/5 border border-white/10 rounded-2xl p-6 text-center hover:border-accent1/50 transition-all"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-accent1/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                            <stat.icon className="w-8 h-8 text-accent1 mx-auto mb-3" />
                            <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                            <div className="text-sm text-gray-400">{stat.label}</div>
                        </div>
                    ))}
                </motion.div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {FEATURES.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 30 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.5, delay: 0.1 * index }}
                        >
                            <Link href={feature.href}>
                                <div className="group relative h-full bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:border-accent1/50 transition-all hover:shadow-[0_0_40px_rgba(0,229,255,0.15)] cursor-pointer">
                                    {/* Glow Effect */}
                                    <div className={`absolute inset-0 ${feature.bgGlow} opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl blur-xl`} />

                                    {/* Content */}
                                    <div className="relative z-10">
                                        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} p-3 mb-6 group-hover:scale-110 transition-transform`}>
                                            <feature.icon className="w-full h-full text-white" />
                                        </div>

                                        <h3 className="text-xl font-bold text-white mb-3 group-hover:text-accent1 transition-colors">
                                            {feature.title}
                                        </h3>

                                        <p className="text-gray-400 text-sm leading-relaxed mb-4">
                                            {feature.description}
                                        </p>

                                        <div className="flex items-center gap-2 text-accent1 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                            Explore <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* CTA Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    className="mt-20 text-center"
                >
                    <div className="bg-gradient-to-r from-accent1/10 to-accent2/10 border border-accent1/20 rounded-2xl p-12">
                        <h3 className="text-3xl font-bold text-white mb-4">
                            Ready to Start Competing?
                        </h3>
                        <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
                            Join thousands of students, organizers, and sponsors already using CompeteX to discover, participate, and excel in competitions.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/signup">
                                <button className="px-8 py-4 bg-accent1 text-black font-bold uppercase tracking-widest text-sm rounded-lg hover:scale-105 transition-all shadow-[0_0_30px_rgba(0,229,255,0.3)]">
                                    Create Free Account
                                </button>
                            </Link>
                            <Link href="/events">
                                <button className="px-8 py-4 border border-white/20 text-white font-bold uppercase tracking-widest text-sm rounded-lg hover:bg-white/5 transition-all">
                                    Browse Events
                                </button>
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
