"use client";

import { Building2, Award, Calendar } from "lucide-react";

export function InstitutionProfile() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-8 flex items-center gap-6">
                <div className="w-24 h-24 bg-white/10 rounded-lg flex items-center justify-center border border-white/10">
                    <Building2 className="w-10 h-10 text-gray-400" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-white">TechUniversity</h2>
                    <p className="text-gray-400 mb-2">Pioneering Excellence in Tech</p>
                    <div className="flex gap-4 text-sm">
                        <span className="flex items-center gap-1 text-accent2"><Award className="w-4 h-4" /> National Rank #5</span>
                        <span className="flex items-center gap-1 text-accent1"><Calendar className="w-4 h-4" /> 12 Events Hosted</span>
                    </div>
                </div>
            </div>

            {/* Event Archive */}
            <h3 className="text-xl font-bold text-white">Event Archive</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="group relative aspect-video bg-black rounded-lg overflow-hidden border border-white/10">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
                        <h4 className="absolute bottom-4 left-4 z-20 font-bold text-white group-hover:text-accent1 transition-colors">
                            TechFest 202{4 - i}
                        </h4>
                    </div>
                ))}
            </div>
        </div>
    );
}
