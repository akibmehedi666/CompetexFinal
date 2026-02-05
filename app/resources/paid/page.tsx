"use client";

import { useState } from "react";
import { Navbar } from "@/components/ui/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Users, Video, Clock, CheckCircle, Shield, Download, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock Data for Mentors
const MENTORS = [
    {
        id: "m1",
        name: "Dr. Sarah Chen",
        role: "Ex-Google, ICPC World Finalist",
        specialty: "Competitive Programming",
        rate: "$50/hr",
        rating: 4.9,
        reviews: 120,
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
        availability: "Mon, Wed, Fri",
        tags: ["Algorithms", "C++", "Interview Prep"]
    },
    {
        id: "m2",
        name: "James Wilson",
        role: "Senior AI Researcher, Stanford",
        specialty: "Machine Learning & AI",
        rate: "$75/hr",
        rating: 5.0,
        reviews: 85,
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=James",
        availability: "Weekends",
        tags: ["PyTorch", "NLP", "Research Paper Guidance"]
    },
    {
        id: "m3",
        name: "Anita Roy",
        role: "Product Designer @ Airbnb",
        specialty: "UI/UX Design",
        rate: "$45/hr",
        rating: 4.8,
        reviews: 200,
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Anita",
        availability: "Tue, Thu",
        tags: ["Figma", "Design Systems", "Portfolio Review"]
    }
];

// Mock Data for Premium Resources
const PREMIUM_RESOURCES = [
    {
        id: "p1",
        title: "Ultimate System Design Guide",
        description: "Everything you need to crack system design interviews at FAANG companies. Includes 50+ real-world case studies.",
        price: "$29.99",
        type: "Course + PDF",
        sales: 1500,
        rating: 4.9,
        features: ["10 Hours Video", "500 Page PDF", "Mock Interviews"]
    },
    {
        id: "p2",
        title: "Advanced React Patterns 2026",
        description: "Deep dive into performance optimization, server components, and enterprise architecture.",
        price: "$19.99",
        type: "Video Course",
        sales: 800,
        rating: 4.7,
        features: ["Source Code", "Lifetime Access", "Certificate"]
    },
    {
        id: "p3",
        title: "Hackathon Winning Pitch Decks",
        description: "Templates and analyzed examples of pitch decks that won over $1M in hackathon prizes.",
        price: "$14.99",
        type: "Templates",
        sales: 2300,
        rating: 4.8,
        features: ["PPT/Keynote Templates", "Script Guides", "Case Studies"]
    }
];

export default function PaidResourcesPage() {
    const [activeTab, setActiveTab] = useState<"mentorship" | "premium">("mentorship");

    return (
        <div className="min-h-screen bg-black selection:bg-accent1/30">
            <Navbar />

            <div className="pt-24 pb-12 max-w-7xl mx-auto px-6">
                {/* Header */}
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent1/30 bg-accent1/10 mb-6"
                    >
                        <Star className="w-4 h-4 text-accent1" />
                        <span className="text-xs font-bold uppercase tracking-wider text-accent1">Premium Access</span>
                    </motion.div>
                    <h1 className="text-5xl font-bold text-white mb-6">
                        Unlock Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent1 to-accent2">Full Potential</span>
                    </h1>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        Get personalized guidance from industry experts or access premium resources to fast-track your success.
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex justify-center mb-12">
                    <div className="p-1 bg-white/5 rounded-full border border-white/10 flex gap-1">
                        <button
                            onClick={() => setActiveTab("mentorship")}
                            className={cn(
                                "px-8 py-3 rounded-full text-sm font-bold uppercase tracking-wider transition-all flex items-center gap-2",
                                activeTab === "mentorship"
                                    ? "bg-accent1 text-black shadow-[0_0_20px_rgba(0,229,255,0.4)]"
                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <Users className="w-4 h-4" /> 1-on-1 Mentorship
                        </button>
                        <button
                            onClick={() => setActiveTab("premium")}
                            className={cn(
                                "px-8 py-3 rounded-full text-sm font-bold uppercase tracking-wider transition-all flex items-center gap-2",
                                activeTab === "premium"
                                    ? "bg-accent2 text-black shadow-[0_0_20px_rgba(170,255,0,0.4)]"
                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <Shield className="w-4 h-4" /> Premium Resources
                        </button>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === "mentorship" ? (
                        <motion.div
                            key="mentorship"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                        >
                            {MENTORS.map((mentor) => (
                                <div key={mentor.id} className="group relative bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-accent1/50 transition-all overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 pointer-events-none" />

                                    <div className="relative z-10 flex flex-col h-full">
                                        <div className="flex items-center gap-4 mb-6">
                                            <img src={mentor.image} alt={mentor.name} className="w-16 h-16 rounded-full border-2 border-accent1/30" />
                                            <div>
                                                <h3 className="text-xl font-bold text-white">{mentor.name}</h3>
                                                <p className="text-xs text-accent1 font-bold">{mentor.specialty}</p>
                                            </div>
                                        </div>

                                        <p className="text-gray-400 text-sm mb-4 line-clamp-2">{mentor.role}</p>

                                        <div className="flex flex-wrap gap-2 mb-6">
                                            {mentor.tags.map(tag => (
                                                <span key={tag} className="px-2 py-1 bg-white/5 rounded-md text-[10px] text-gray-300 border border-white/5">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>

                                        <div className="mt-auto flex items-center justify-between pt-6 border-t border-white/10">
                                            <div className="flex flex-col">
                                                <span className="text-lg font-bold text-white">{mentor.rate}</span>
                                                <div className="flex items-center gap-1 text-xs text-yellow-400">
                                                    <Star className="w-3 h-3 fill-current" /> {mentor.rating} ({mentor.reviews})
                                                </div>
                                            </div>
                                            <button className="px-6 py-2 bg-accent1 text-black font-bold uppercase text-xs rounded-lg hover:bg-white transition-colors">
                                                Book Session
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="premium"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                        >
                            {PREMIUM_RESOURCES.map((resource) => (
                                <div key={resource.id} className="group flex flex-col bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl overflow-hidden hover:border-accent2/50 transition-all">
                                    <div className="h-48 bg-white/5 relative overflow-hidden group-hover:bg-white/10 transition-colors flex items-center justify-center">
                                        <Lock className="w-12 h-12 text-white/20 group-hover:text-accent2/50 transition-colors" />
                                        <div className="absolute top-4 right-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-xs font-bold text-white border border-white/10">
                                            {resource.type}
                                        </div>
                                    </div>

                                    <div className="p-6 flex-grow flex flex-col">
                                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-accent2 transition-colors">{resource.title}</h3>
                                        <p className="text-gray-400 text-sm mb-6">{resource.description}</p>

                                        <ul className="space-y-3 mb-8">
                                            {resource.features.map(feature => (
                                                <li key={feature} className="flex items-center gap-2 text-sm text-gray-300">
                                                    <CheckCircle className="w-4 h-4 text-accent2" /> {feature}
                                                </li>
                                            ))}
                                        </ul>

                                        <div className="mt-auto pt-6 border-t border-white/10 flex items-center justify-between">
                                            <span className="text-2xl font-bold text-white">{resource.price}</span>
                                            <button className="px-6 py-2 bg-white/10 text-white border border-white/20 hover:bg-accent2 hover:text-black hover:border-accent2 rounded-lg font-bold uppercase text-xs transition-all">
                                                Buy Now
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
