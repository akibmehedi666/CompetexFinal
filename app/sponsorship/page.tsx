"use client";

import { Navbar } from "@/components/ui/Navbar";
import { SPONSORSHIP_OPPORTUNITIES } from "@/constants/mockSponsorships";
import { motion } from "framer-motion";
import { DollarSign, CheckCircle, Ticket, Users, TrendingUp, Handshake } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SponsorshipPage() {
    return (
        <div className="min-h-screen bg-black selection:bg-yellow-500/30">
            <Navbar />

            {/* Hero Section - Gold Theme */}
            <div className="relative pt-20 pb-10 overflow-hidden border-b border-white/10 flex flex-col justify-center min-h-[40vh]">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-yellow-500/20 blur-[120px] rounded-full pointer-events-none" />

                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
                        Fuel Your <span className="text-yellow-400">Events</span>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
                        Connect with top-tier brands looking to sponsor the next big thing in tech.
                        Secure funding, prizes, and partnerships.
                    </p>
                    <div className="flex items-center justify-center gap-4">
                        <button className="px-8 py-3 bg-yellow-500 text-black font-bold uppercase tracking-wider rounded-full hover:bg-yellow-400 hover:scale-105 transition-all shadow-[0_0_20px_rgba(234,179,8,0.3)]">
                            Pitch Your Event
                        </button>
                        <button className="px-8 py-3 bg-white/5 text-white font-bold uppercase tracking-wider rounded-full border border-white/10 hover:bg-white/10 transition-all">
                            View Success Stories
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-16">

                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    <div className="p-6 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-white">$2.4M+</div>
                            <div className="text-sm text-gray-400">Total Funding Secured</div>
                        </div>
                    </div>
                    <div className="p-6 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500">
                            <Handshake className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-white">450+</div>
                            <div className="text-sm text-gray-400">Active Partnerships</div>
                        </div>
                    </div>
                    <div className="p-6 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-white">85%</div>
                            <div className="text-sm text-gray-400">Success Rate</div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Ticket className="w-6 h-6 text-yellow-400" /> Active Opportunities
                    </h2>
                    <span className="text-sm text-gray-500">{SPONSORSHIP_OPPORTUNITIES.length} Offers Available</span>
                </div>

                {/* Opportunity Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {SPONSORSHIP_OPPORTUNITIES.map((offer, index) => (
                        <motion.div
                            key={offer.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-[#0F0F0F] border border-white/10 rounded-2xl p-6 hover:border-yellow-500/50 transition-colors group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-white/5 to-transparent -mr-8 -mt-8 rounded-full" />

                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                                        <offer.logo className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white">{offer.brandName}</h3>
                                        <span className="text-xs text-gray-500 uppercase tracking-wider">{offer.industry}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-bold text-yellow-400">{offer.budget}</div>
                                    <span className="text-[10px] text-gray-500 uppercase">Budget</span>
                                </div>
                            </div>

                            <p className="text-gray-400 text-sm mb-6 h-10 line-clamp-2">
                                {offer.description}
                            </p>

                            <div className="space-y-4 mb-6">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500">Min Reach</span>
                                    <span className="text-white font-medium flex items-center gap-1">
                                        <Users className="w-3 h-3 text-yellow-500" /> {offer.minReach}+
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500">Focus</span>
                                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-white/10 text-white border border-white/10">
                                        {offer.focus}
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-6">
                                {offer.requirements.slice(0, 2).map((req, i) => (
                                    <span key={i} className="px-2 py-1 text-[10px] text-gray-400 bg-white/5 rounded border border-white/5">
                                        {req}
                                    </span>
                                ))}
                                {offer.requirements.length > 2 && (
                                    <span className="px-2 py-1 text-[10px] text-gray-400 bg-white/5 rounded border border-white/5">
                                        +{offer.requirements.length - 2} more
                                    </span>
                                )}
                            </div>

                            <button className="w-full py-3 bg-white/5 hover:bg-yellow-500 hover:text-black text-white rounded-lg font-bold text-sm uppercase tracking-wider transition-all border border-white/10 hover:border-transparent group-hover:shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                                Apply Now
                            </button>
                        </motion.div>
                    ))}
                </div>

                {/* Community Sponsors Section (Request #6) */}
                <div className="mt-20 border-t border-white/10 pt-16">
                    <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
                        <Users className="w-8 h-8 text-accent2" /> Community Sponsors
                    </h2>
                    <p className="text-gray-400 mb-8 max-w-2xl">
                        Registered organizations and individuals who are actively supporting the community.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                        {/* Mock Community Sponsors */}
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col items-center text-center hover:bg-white/10 transition-colors">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-accent1/20 to-purple-500/20 mb-3 overflow-hidden border border-white/10">
                                    <img src={`https://api.dicebear.com/7.x/shapes/svg?seed=Sponsor${i}`} alt="Sponsor" className="w-full h-full object-cover" />
                                </div>
                                <h3 className="font-bold text-white text-sm">TechCorp {i}</h3>
                                <p className="text-xs text-gray-500 mb-2">Enterprise Partner</p>
                                <button className="text-[10px] uppercase font-bold text-accent1 border border-accent1/30 px-3 py-1 rounded-full hover:bg-accent1 hover:text-black transition-all">
                                    View Profile
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
