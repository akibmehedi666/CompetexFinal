"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, DollarSign, Clock, Briefcase, Filter, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ENDPOINTS } from "@/lib/api_config";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";

type JobPosting = {
    id: string;
    title: string;
    company_name?: string | null;
    location?: string | null;
    salary_range?: string | null;
    employment_type?: string | null;
    description?: string | null;
    deadline?: string | null;
    tags: string[];
    created_at?: string | null;
};

const FILTERS = ["All", "Full-time", "Internship", "Part-time", "Contract"];

export default function JobBoard() {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("All");
    const [jobs, setJobs] = useState<JobPosting[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { currentUser, initAuth } = useStore();
    const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        initAuth();
    }, [initAuth]);

    useEffect(() => {
        const fetchJobs = async () => {
            setLoading(true);
            try {
                const res = await fetch(ENDPOINTS.GET_JOB_POSTINGS);
                const data = await res.json();
                if (data?.status === "success" && Array.isArray(data.data)) {
                    setJobs(
                        data.data.map((j: any) => ({
                            id: String(j.id),
                            title: String(j.title || ""),
                            company_name: j.company_name ?? null,
                            location: j.location ?? null,
                            salary_range: j.salary_range ?? null,
                            employment_type: j.employment_type ?? null,
                            description: j.description ?? null,
                            deadline: j.deadline ?? null,
                            tags: Array.isArray(j.tags) ? j.tags : [],
                            created_at: j.created_at ?? null
                        }))
                    );
                } else {
                    setJobs([]);
                }
            } catch (err) {
                console.error(err);
                setJobs([]);
                toast.error("Failed to load jobs");
            } finally {
                setLoading(false);
            }
        };

        fetchJobs();
    }, []);

    useEffect(() => {
        const loadApplied = async () => {
            if (!currentUser?.id) {
                setAppliedJobIds(new Set());
                return;
            }
            try {
                const res = await fetch(ENDPOINTS.GET_USER_APPLIED_JOBS(currentUser.id));
                const data = await res.json();
                if (data?.status === "success" && Array.isArray(data.data)) {
                    setAppliedJobIds(new Set(data.data.map((r: any) => String(r.job_id))));
                } else {
                    setAppliedJobIds(new Set());
                }
            } catch {
                setAppliedJobIds(new Set());
            }
        };
        loadApplied();
    }, [currentUser?.id]);

    const filteredJobs = useMemo(() => {
        const q = searchQuery.toLowerCase();
        return jobs.filter((job) => {
            const matchesSearch =
                (job.title || "").toLowerCase().includes(q) ||
                (job.company_name || "").toLowerCase().includes(q);
            const matchesFilter = activeFilter === "All" || job.employment_type === activeFilter;
            return matchesSearch && matchesFilter;
        });
    }, [jobs, searchQuery, activeFilter]);

    const handleViewJob = (id: string) => {
        router.push(`/jobs/${encodeURIComponent(id)}`);
    };

    const postedAtDays = (createdAt?: string | null) => {
        if (!createdAt) return null;
        const created = new Date(createdAt).getTime();
        if (!Number.isFinite(created)) return null;
        const diffDays = Math.max(0, Math.floor((Date.now() - created) / (1000 * 60 * 60 * 24)));
        return diffDays;
    };

    return (
        <div className="min-h-screen bg-black text-white pt-24 pb-20 px-6">
            <div className="max-w-7xl mx-auto space-y-12">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-2">
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                            Career <span className="text-accent1">Hub</span>
                        </h1>
                        <p className="text-gray-400 max-w-md">
                            Discover your next big opportunity. Connect with top tech companies and innovative startups.
                        </p>
                    </div>

                    <div className="w-full md:w-auto flex flex-col sm:flex-row gap-4">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-accent1 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search jobs, companies..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full sm:w-80 bg-black border border-white/10 rounded-xl px-12 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-accent1 focus:ring-1 focus:ring-accent1/30 transition-all"
                            />
                        </div>

                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                            <select
                                value={activeFilter}
                                onChange={(e) => setActiveFilter(e.target.value)}
                                className="w-full sm:w-48 bg-black border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-accent1 focus:ring-1 focus:ring-accent1/30 transition-all appearance-none"
                            >
                                {FILTERS.map((f) => (
                                    <option key={f} value={f}>
                                        {f}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {filteredJobs.map((job, index) => {
                            const days = postedAtDays(job.created_at);
                            return (
                                <motion.div
                                    key={job.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 20 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="group relative bg-[#0A0A0A] border border-white/5 rounded-xl p-6 overflow-hidden hover:border-accent1/30 transition-all"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-accent1/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                                    <div className="relative z-10 flex flex-col h-full space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-xl font-bold text-white group-hover:text-accent1 transition-colors line-clamp-1">
                                                    {job.title}
                                                </h3>
                                                <p className="text-gray-400 text-sm font-medium">{job.company_name || "Company"}</p>
                                            </div>
                                            <div className="p-2 bg-white/5 rounded-lg border border-white/5 group-hover:border-accent1/20 transition-colors">
                                                <Briefcase className="w-5 h-5 text-gray-400 group-hover:text-accent1 transition-colors" />
                                            </div>
                                        </div>

                                        <div className="space-y-2 text-sm text-gray-400">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-accent2" />
                                                {job.location || "—"}
                                            </div>
                                            {job.salary_range && (
                                                <div className="flex items-center gap-2">
                                                    <DollarSign className="w-4 h-4 text-green-400" />
                                                    {job.salary_range}
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-orange-400" />
                                                {days === null ? "Posted recently" : `Posted ${days} days ago`}
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2 pt-2">
                                            {(job.tags || []).slice(0, 3).map((tag) => (
                                                <span key={tag} className="px-2 py-1 bg-white/5 rounded text-xs text-gray-300 border border-white/5">
                                                    {tag}
                                                </span>
                                            ))}
                                            {(job.tags || []).length > 3 && (
                                                <span className="px-2 py-1 bg-white/5 rounded text-xs text-gray-300 border border-white/5">
                                                    +{job.tags.length - 3}
                                                </span>
                                            )}
                                            {appliedJobIds.has(job.id) && (
                                                <span className="px-2 py-1 bg-green-500/10 rounded text-xs text-green-300 border border-green-500/20">
                                                    Applied
                                                </span>
                                            )}
                                        </div>

                                        <div className="pt-4 mt-auto">
                                            <button
                                                onClick={() => handleViewJob(job.id)}
                                                className={cn(
                                                    "w-full py-3 bg-white text-black font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 hover:bg-accent1 transition-colors group/btn disabled:opacity-70 disabled:cursor-not-allowed",
                                                )}
                                            >
                                                View Job
                                                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>

                {!loading && filteredJobs.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-gray-500 text-lg">No jobs found matching your criteria.</p>
                        <button
                            onClick={() => { setSearchQuery(""); setActiveFilter("All"); }}
                            className="mt-4 text-accent1 hover:underline"
                        >
                            Clear filters
                        </button>
                    </div>
                )}
                {loading && (
                    <div className="text-center py-24 text-gray-500">
                        <p>Loading jobs...</p>
                    </div>
                )}
            </div>
        </div>
    );
}
