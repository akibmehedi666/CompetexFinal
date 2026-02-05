"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Filter, ExternalLink, Handshake, MapPin, Globe, Mail, BadgeCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ENDPOINTS } from "@/lib/api_config";
import { useStore } from "@/store/useStore";
import { toast } from "sonner";
import { SendSponsorshipRequestModal } from "@/components/organizer/SendSponsorshipRequestModal";

type SponsorRow = {
    sponsor_profile_id: string;
    sponsor_user_id: string;
    sponsor_name: string;
    company_name?: string | null;
    industry?: string | null;
    description?: string | null;
    website?: string | null;
    location?: string | null;
    sponsorship_categories: string[];
    verified?: number | string | boolean | null;
    email?: string | null;
    avatar?: string | null;
};

type OrganizerEvent = {
    id: string;
    title: string;
};

export function SponsorDiscovery() {
    const { currentUser } = useStore();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedSponsor, setSelectedSponsor] = useState<SponsorRow | null>(null);
    const [sponsors, setSponsors] = useState<SponsorRow[]>([]);
    const [events, setEvents] = useState<OrganizerEvent[]>([]);
    const [loading, setLoading] = useState(true);

    const [requestSponsor, setRequestSponsor] = useState<SponsorRow | null>(null);
    const [requestOpen, setRequestOpen] = useState(false);

    useEffect(() => {
        if (!currentUser?.id) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const [sponsorsRes, eventsRes] = await Promise.all([
                    fetch(ENDPOINTS.GET_SPONSORS),
                    fetch(ENDPOINTS.GET_ORGANIZER_EVENTS(currentUser.id))
                ]);
                const sponsorsJson = await sponsorsRes.json();
                const eventsJson = await eventsRes.json();

                if (sponsorsJson?.status === "success" && Array.isArray(sponsorsJson.data)) {
                    setSponsors(sponsorsJson.data);
                } else {
                    setSponsors([]);
                }

                if (eventsJson?.status === "success" && Array.isArray(eventsJson.data)) {
                    setEvents(eventsJson.data.map((e: any) => ({ id: e.id, title: e.title })));
                } else {
                    setEvents([]);
                }
            } catch (err) {
                console.error(err);
                toast.error("Failed to load sponsors");
                setSponsors([]);
                setEvents([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentUser?.id]);

    const filteredSponsors = useMemo(() => {
        return sponsors.filter((sponsor) => {
            const name = (sponsor.company_name || sponsor.sponsor_name || "").toLowerCase();
            const industry = (sponsor.industry || "").toLowerCase();
            const matchesSearch = name.includes(searchQuery.toLowerCase()) || industry.includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory ? (sponsor.sponsorship_categories || []).includes(selectedCategory) : true;
            return matchesSearch && matchesCategory;
        });
    }, [sponsors, searchQuery, selectedCategory]);

    const allCategories = useMemo(() => {
        return Array.from(new Set(sponsors.flatMap((s) => s.sponsorship_categories || []))).filter(Boolean);
    }, [sponsors]);

    const openRequest = (sponsor: SponsorRow) => {
        if (!currentUser?.id) {
            toast.error("Please log in as an organizer.");
            return;
        }
        setRequestSponsor(sponsor);
        setRequestOpen(true);
    };

    return (
        <div className="space-y-6">
            <SendSponsorshipRequestModal
                isOpen={requestOpen}
                onClose={() => setRequestOpen(false)}
                organizerId={currentUser?.id || ""}
                sponsor={requestSponsor}
                events={events}
                onSent={() => { /* optionally refresh outbox elsewhere */ }}
            />
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white">Find Sponsors</h2>
                    <p className="text-sm text-gray-400">Connect with top companies to support your event.</p>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search companies..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:border-accent1 outline-none"
                        />
                    </div>
                    <button className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-400">
                        <Filter className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Category Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                <button
                    onClick={() => setSelectedCategory(null)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap border transition-colors ${!selectedCategory ? "bg-accent1 text-black border-accent1" : "bg-white/5 border-white/10 text-gray-400 hover:text-white"}`}
                >
                    All Types
                </button>
                {allCategories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap border transition-colors ${selectedCategory === cat ? "bg-accent1 text-black border-accent1" : "bg-white/5 border-white/10 text-gray-400 hover:text-white"}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Sponsor Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {loading && (
                        <div className="col-span-full text-gray-500 text-sm">Loading sponsors...</div>
                    )}
                    {filteredSponsors.map(sponsor => (
                        <motion.div
                            key={sponsor.sponsor_profile_id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-accent1/30 transition-all group cursor-pointer"
                            onClick={() => setSelectedSponsor(sponsor)}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-white/10 rounded-lg p-1 border border-white/10">
                                        <img
                                            src={sponsor.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(sponsor.company_name || sponsor.sponsor_name || "S")}&backgroundColor=00E5FF`}
                                            alt={sponsor.company_name || sponsor.sponsor_name}
                                            className="w-full h-full object-cover rounded"
                                        />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-white group-hover:text-accent1 transition-colors">{sponsor.company_name || sponsor.sponsor_name}</h3>
                                            {Boolean(sponsor.verified) && <BadgeCheck className="w-4 h-4 text-accent1" />}
                                        </div>
                                        <p className="text-xs text-gray-400">{sponsor.industry || "—"}</p>
                                    </div>
                                </div>
                            </div>

                            <p className="text-sm text-gray-400 line-clamp-2 mb-4 h-10">
                                {sponsor.description || "No description provided."}
                            </p>

                            <div className="flex flex-wrap gap-2 mb-4">
                                {(sponsor.sponsorship_categories || []).slice(0, 3).map((cat: string) => (
                                    <span key={cat} className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-[10px] text-gray-300">
                                        {cat}
                                    </span>
                                ))}
                            </div>

                            <div className="flex items-center gap-2 mt-auto">
                                <button
                                    onClick={(e) => { e.stopPropagation(); openRequest(sponsor); }}
                                    className="flex-1 py-2 bg-accent1/10 hover:bg-accent1/20 border border-accent1/20 text-accent1 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors"
                                >
                                    <Handshake className="w-4 h-4" /> Request
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); if (sponsor.website) window.open(sponsor.website, "_blank"); }}
                                    className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                                    aria-label="Open sponsor website"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
            </div>

            {!loading && filteredSponsors.length === 0 && (
                <div className="text-center py-12">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="w-8 h-8 text-gray-500" />
                    </div>
                    <h3 className="text-lg font-bold text-white">No sponsors found</h3>
                    <p className="text-gray-400">Try adjusting your search or filters.</p>
                </div>
            )}

            {/* Sponsor Detail Modal */}
            <AnimatePresence>
                {selectedSponsor && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedSponsor(null)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-[#0A0A0A] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-6">
                                <div className="flex justify-end mb-4">
                                    <button onClick={() => setSelectedSponsor(null)} className="text-gray-400 hover:text-white">Close</button>
                                </div>

                                <div className="flex flex-col md:flex-row gap-6">
                                    <div className="w-24 h-24 rounded-xl bg-white/10 p-1 border border-white/20 flex-shrink-0">
                                        <img
                                            src={selectedSponsor.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(selectedSponsor.company_name || selectedSponsor.sponsor_name || "S")}&backgroundColor=00E5FF`}
                                            alt={selectedSponsor.company_name || selectedSponsor.sponsor_name}
                                            className="w-full h-full object-cover rounded-lg"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-2xl font-bold text-white">{selectedSponsor.company_name || selectedSponsor.sponsor_name}</h3>
                                            {Boolean(selectedSponsor.verified) && <BadgeCheck className="w-5 h-5 text-accent1" />}
                                        </div>
                                        <p className="text-sm text-gray-400 mt-1">{selectedSponsor.industry || "—"}</p>
                                        <p className="text-gray-300 mt-4 leading-relaxed">{selectedSponsor.description || "No description provided."}</p>

                                        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-300">
                                            {selectedSponsor.location && (
                                                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                                                    <MapPin className="w-4 h-4 text-accent1" />
                                                    <span>{selectedSponsor.location}</span>
                                                </div>
                                            )}
                                            {selectedSponsor.website && (
                                                <button
                                                    onClick={() => window.open(selectedSponsor.website as string, "_blank")}
                                                    className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 hover:bg-white/10 text-left"
                                                >
                                                    <Globe className="w-4 h-4 text-accent1" />
                                                    <span className="truncate">{selectedSponsor.website}</span>
                                                </button>
                                            )}
                                            {selectedSponsor.email && (
                                                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                                                    <Mail className="w-4 h-4 text-accent1" />
                                                    <span className="truncate">{selectedSponsor.email}</span>
                                                </div>
                                            )}
                                        </div>

                                        {(selectedSponsor.sponsorship_categories || []).length > 0 && (
                                            <div className="mt-6">
                                                <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Sponsorship Categories</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedSponsor.sponsorship_categories.map((cat) => (
                                                        <span key={cat} className="px-3 py-1 rounded-full bg-accent1/10 text-accent1 text-xs font-bold border border-accent1/20">
                                                            {cat}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-white/10 flex justify-end gap-3">
                                    <button onClick={() => setSelectedSponsor(null)} className="px-6 py-2 rounded-lg border border-white/10 text-gray-300 hover:bg-white/5">Close</button>
                                    <button
                                        onClick={() => { setSelectedSponsor(null); openRequest(selectedSponsor); }}
                                        className="px-6 py-2 rounded-lg bg-accent1 text-black font-bold hover:bg-accent2"
                                    >
                                        Request Sponsorship
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
