"use client";

import { useEffect, useMemo, useState } from "react";
import { Navbar } from "@/components/ui/Navbar";
import { MentorCard } from "@/components/mentors/MentorCard";
import { MentorProfile } from "@/types";
import { Search, Filter } from "lucide-react";
import { ENDPOINTS } from "@/lib/api_config";
import { toast } from "sonner";

export default function MentorsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [mentors, setMentors] = useState<MentorProfile[]>([]);
    const [loading, setLoading] = useState(true);

    const categories = ["All", "AI/ML", "Algorithms", "Design", "Robotics", "Business", "Web Dev", "Competitive Programming"];

    useEffect(() => {
        const fetchMentors = async () => {
            setLoading(true);
            try {
                const res = await fetch(ENDPOINTS.GET_MENTORS);
                const data = await res.json();
                if (data?.status === "success" && Array.isArray(data.data)) {
                    const mapped: MentorProfile[] = data.data.map((m: any) => ({
                        id: String(m.mentor_profile_id),
                        userId: String(m.user_id),
                        name: String(m.name || ""),
                        title: String(m.position || "Mentor"),
                        organization: String(m.company_name || "CompeteX"),
                        location: String(m.location || "Remote"),
                        avatar: m.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(m.name || "Mentor")}`,
                        bio: String(m.bio || ""),
                        expertise: Array.isArray(m.expertise) ? m.expertise : [],
                        rating: 0,
                        reviewCount: 0,
                        hourlyRate: 0,
                        currency: "$",
                        availability: { slots: [], nextAvailable: "" },
                        socials: { linkedin: m.linkedin || "", website: m.website || "" },
                        offerings: [],
                        languages: [],
                        verified: Boolean(m.verified)
                    }));
                    setMentors(mapped);
                } else {
                    setMentors([]);
                }
            } catch (err) {
                console.error(err);
                setMentors([]);
                toast.error("Failed to load mentors");
            } finally {
                setLoading(false);
            }
        };

        fetchMentors();
    }, []);

    const filteredMentors = useMemo(() => {
        const q = searchTerm.toLowerCase();
        return mentors.filter((mentor) => {
            const matchesSearch = mentor.name.toLowerCase().includes(q) ||
                (mentor.organization || "").toLowerCase().includes(q) ||
                (mentor.expertise || []).some((e) => String(e).toLowerCase().includes(q));

            const matchesCategory =
                selectedCategory === "All" ||
                (mentor.expertise || []).some((e) => String(e).includes(selectedCategory === "Business" ? "Product" : selectedCategory));

            return matchesSearch && matchesCategory;
        });
    }, [mentors, searchTerm, selectedCategory]);

    return (
        <div className="min-h-screen bg-black text-white selection:bg-accent1 selection:text-black">
            <Navbar />

            <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                            Find Your <span className="text-accent1">Mentor</span>
                        </h1>
                        <p className="text-gray-400 max-w-2xl text-lg">
                            Connect with industry experts, past winners, and researchers to fast-track your growth.
                        </p>
                    </div>

                    <div className="flex gap-8">
                        <div className="text-center">
                            <h4 className="text-3xl font-bold text-white">{loading ? "…" : mentors.length}</h4>
                            <p className="text-xs text-gray-500 uppercase tracking-widest">Mentors</p>
                        </div>
                        <div className="text-center">
                            <h4 className="text-3xl font-bold text-accent1">24/7</h4>
                            <p className="text-xs text-gray-500 uppercase tracking-widest">Support</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-6 mb-12 sticky top-24 z-30 bg-black/80 backdrop-blur-xl p-4 rounded-xl border border-white/5">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name, company, or skill..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-12 pl-12 pr-4 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-accent1/50 transition-colors"
                        />
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0">
                        <Filter className="w-4 h-4 text-gray-500 flex-shrink-0" />
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`h-12 px-6 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${selectedCategory === cat
                                    ? "bg-accent1 text-black shadow-[0_0_20px_rgba(0,229,255,0.3)]"
                                    : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-20 text-gray-500">Loading mentors...</div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredMentors.map((mentor) => (
                                <MentorCard key={mentor.id} mentor={mentor} />
                            ))}
                        </div>

                        {filteredMentors.length === 0 && (
                            <div className="text-center py-20 text-gray-500">
                                <p>No mentors found matching your criteria.</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

