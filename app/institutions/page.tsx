"use client";

import { useEffect, useMemo, useState } from "react";
import { Navbar } from "@/components/ui/Navbar";
import { motion } from "framer-motion";
import { Search, MapPin, Award, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ENDPOINTS } from "@/lib/api_config";
import { toast } from "sonner";

export default function InstitutionDirectoryPage() {
    const [search, setSearch] = useState("");
    const [institutions, setInstitutions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const res = await fetch(ENDPOINTS.GET_INSTITUTIONS);
                const data = await res.json();
                if (data?.status === "success" && Array.isArray(data.data)) {
                    setInstitutions(data.data);
                } else {
                    setInstitutions([]);
                }
            } catch (e) {
                console.error(e);
                setInstitutions([]);
                toast.error("Failed to load institutions");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const filteredInstitutions = useMemo(() => {
        const q = search.toLowerCase();
        return institutions.filter((inst) => {
            const name = String(inst.name || "").toLowerCase();
            const location = String(inst.location || "").toLowerCase();
            return name.includes(q) || location.includes(q);
        });
    }, [institutions, search]);

    const colorFor = (seed: string) => {
        // Deterministic accent colors for glow
        const colors = ["#00E5FF", "#A855F7", "#22C55E", "#F59E0B", "#EF4444"];
        let hash = 0;
        for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
        return colors[hash % colors.length];
    };

    return (
        <div className="min-h-screen bg-black selection:bg-accent1/30">
            <Navbar />

            <div className="pt-24 pb-12 max-w-7xl mx-auto px-6">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                        Partner <span className="text-accent2">Institutions</span>
                    </h1>
                    <p className="text-gray-400 mb-8">
                        Discover the universities and organizations driving the future of innovation through competitive events.
                    </p>

                    {/* Search Bar */}
                    <div className="relative group">
                        <div className="absolute inset-0 bg-accent2/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search universities..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-black/80 border border-white/10 rounded-full py-4 pl-12 pr-6 text-white text-lg focus:border-accent2 focus:outline-none transition-colors"
                            />
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading && (
                        <div className="col-span-full py-12 text-center text-gray-500 border border-dashed border-white/10 rounded-2xl">
                            Loading institutions...
                        </div>
                    )}

                    {!loading && filteredInstitutions.length === 0 && (
                        <div className="col-span-full py-12 text-center text-gray-500 border border-dashed border-white/10 rounded-2xl">
                            No institutions found.
                        </div>
                    )}

                    {!loading && filteredInstitutions.map((inst, index) => (
                        <motion.div
                            key={inst.institution_id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Link href={`/institutions/${inst.institution_id}`}>
                                <div className="group relative bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-accent2/50 transition-all hover:bg-white/10 h-full flex flex-col justify-between overflow-hidden">
                                    {/* Ambient Glow */}
                                    <div
                                        className="absolute -right-10 -top-10 w-32 h-32 blur-[60px] opacity-0 group-hover:opacity-20 transition-opacity rounded-full pointer-events-none"
                                        style={{ backgroundColor: colorFor(String(inst.institution_id || inst.name || index)) }}
                                    />

                                    <div>
                                        <div className="flex items-start justify-between mb-6">
                                            <div className="w-16 h-16 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                                <span className="text-2xl font-black text-white">
                                                    {String(inst.name || "I").slice(0, 1).toUpperCase()}
                                                </span>
                                            </div>
                                            {inst.is_institution && (
                                                <div className="flex items-center gap-1 px-2 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold rounded-full">
                                                    <ShieldCheck className="w-3 h-3" /> Verified
                                                </div>
                                            )}
                                        </div>

                                        <h3 className="text-2xl font-bold text-white mb-2 leading-tight group-hover:text-accent2 transition-colors">
                                            {inst.name}
                                        </h3>
                                        <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
                                            <MapPin className="w-4 h-4" /> {inst.location || "â€”"}
                                        </div>
                                        <div className="text-gray-500 text-sm line-clamp-3 mb-6">
                                            {inst.website ? (
                                                <span className="break-words">{inst.website}</span>
                                            ) : (
                                                "Hosted competitive events on CompeteX."
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                        <div className="flex flex-col">
                                            <span className="text-xs text-gray-500 uppercase font-bold">Total Events</span>
                                            <span className="text-white font-mono font-bold text-lg">{inst.total_events ?? 0}</span>
                                            <span className="text-xs text-gray-500 mt-1">{inst.upcoming_events ?? 0} upcoming</span>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-accent2 group-hover:text-black transition-all">
                                            <ArrowRight className="w-5 h-5" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
