"use client";

import { MentorProfile } from "@/types";
import { Star, MapPin, Briefcase, ChevronRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface MentorCardProps {
    mentor: MentorProfile;
}

export function MentorCard({ mentor }: MentorCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-accent1/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,229,255,0.1)]"
        >
            <div className="p-6 flex flex-col items-center text-center">
                {/* Avatar */}
                <div className="relative mb-4">
                    <div className="w-24 h-24 rounded-full border-2 border-accent1/30 p-1 overflow-hidden group-hover:border-accent1 transition-colors">
                        <img
                            src={mentor.avatar}
                            alt={mentor.name}
                            className="w-full h-full rounded-full object-cover"
                        />
                    </div>
                    {mentor.verified && (
                        <div className="absolute bottom-0 right-0 bg-accent1 text-black p-1 rounded-full border-2 border-black" title="Verified Mentor">
                            <Star className="w-3 h-3 fill-current" />
                        </div>
                    )}
                </div>

                {/* Info */}
                <h3 className="text-xl font-bold text-white mb-1 group-hover:text-accent1 transition-colors">
                    {mentor.name}
                </h3>
                <p className="text-gray-400 text-sm mb-3">{mentor.title} @ <span className="text-white">{mentor.organization}</span></p>

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-4 bg-white/5 px-4 py-2 rounded-full">
                    <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        <span className="text-white font-bold">{mentor.rating}</span>
                        <span className="text-gray-600">({mentor.reviewCount})</span>
                    </div>
                    <div className="w-px h-3 bg-white/20" />
                    <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{mentor.location || "Remote"}</span>
                    </div>
                </div>

                {/* Expertise Tags */}
                <div className="flex flex-wrap justify-center gap-2 mb-6">
                    {mentor.expertise.slice(0, 3).map((skill) => (
                        <span key={skill} className="px-2 py-1 bg-accent1/10 text-accent1 text-xs rounded border border-accent1/20">
                            {skill}
                        </span>
                    ))}
                    {mentor.expertise.length > 3 && (
                        <span className="px-2 py-1 bg-white/5 text-gray-400 text-xs rounded border border-white/10">
                            +{mentor.expertise.length - 3}
                        </span>
                    )}
                </div>

                {/* Footer / Price */}
                <div className="w-full pt-4 border-t border-white/10 flex items-center justify-between">
                    <div className="text-left">
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Rate</p>
                        <p className="text-white font-bold">
                            {mentor.hourlyRate === 0 ? "Free" : `${mentor.currency}${mentor.hourlyRate}/hr`}
                        </p>
                    </div>
                    <Link
                        href={`/mentors/${mentor.id}`}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-accent1 hover:text-black rounded-lg transition-all text-sm font-medium border border-white/10 hover:border-transparent group/btn"
                    >
                        View Profile
                        <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}
