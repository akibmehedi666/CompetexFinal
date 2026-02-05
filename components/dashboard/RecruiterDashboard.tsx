"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Briefcase, Eye, LayoutDashboard, Search, Settings, Star, Users } from "lucide-react";

import { User } from "@/types";
import { cn } from "@/lib/utils";
import { ENDPOINTS } from "@/lib/api_config";
import { EventWinnersFeed } from "@/components/dashboard/EventWinnersFeed";
import { RecruiterProfileEditor } from "@/components/dashboard/RecruiterProfileEditor";

interface RecruiterDashboardProps {
    user: User;
}

export function RecruiterDashboard({ user }: RecruiterDashboardProps) {
    const [activeTab, setActiveTab] = useState<"overview" | "jobs" | "profile">("overview");
    const [profileData, setProfileData] = useState<any>(user);
    const router = useRouter();

    useEffect(() => {
        if (!user?.id) return;
        fetch(`http://localhost/Competex/api/get_profile.php?user_id=${encodeURIComponent(user.id)}`)
            .then(res => res.json())
            .then(data => {
                if (data?.status === "success") setProfileData(data.user);
            })
            .catch(err => console.error("Failed to fetch recruiter profile", err));
    }, [user?.id]);

    const displayName = profileData?.name || "Recruiter";
    const displaySubtitle = `${profileData?.recruiter_position || "Recruiter"} at ${profileData?.recruiter_company || "Company"}`;

    return (
        <div className="max-w-6xl mx-auto py-8 px-6">
            <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">{displayName}</h1>
                    <p className="text-gray-400">{displaySubtitle} • Hire based on real performance and profiles.</p>
                </div>
                {activeTab === "overview" && (
                    <div className="flex gap-3">
                        <button
                            onClick={() => router.push("/recruitment")}
                            className="px-6 py-2 bg-purple-600 text-white font-bold uppercase tracking-wider rounded-lg hover:bg-purple-500 transition-all shadow-[0_0_15px_rgba(147,51,234,0.3)] flex items-center gap-2"
                        >
                            <Search className="w-4 h-4" /> Scout Talent
                        </button>
                        <button
                            onClick={() => router.push("/jobs/post")}
                            className="px-6 py-2 bg-white/5 text-white font-bold uppercase tracking-wider rounded-lg hover:bg-white/10 transition-all border border-white/10"
                        >
                            Post Job
                        </button>
                    </div>
                )}
            </div>

            <div className="flex gap-2 mb-8 border-b border-white/10 overflow-x-auto">
                <TabButton active={activeTab === "overview"} onClick={() => setActiveTab("overview")} icon={LayoutDashboard} label="Overview" />
                <TabButton active={activeTab === "jobs"} onClick={() => setActiveTab("jobs")} icon={Briefcase} label="Jobs" />
                <TabButton active={activeTab === "profile"} onClick={() => setActiveTab("profile")} icon={Settings} label="Profile Settings" />
            </div>

            <div className="animate-in fade-in zoom-in-95 duration-300">
                {activeTab === "profile" ? (
                    <RecruiterProfileEditor user={user} />
                ) : activeTab === "jobs" ? (
                    <JobsTab recruiterId={user.id} />
                ) : (
                    <OverviewTab />
                )}
            </div>
        </div>
    );
}

function TabButton({ active, onClick, icon: Icon, label }: any) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex items-center gap-2 px-6 py-4 border-b-2 font-bold text-sm transition-all whitespace-nowrap",
                active
                    ? "border-purple-500 text-purple-400 bg-purple-500/10"
                    : "border-transparent text-gray-400 hover:text-white hover:bg-white/5"
            )}
        >
            <Icon className="w-4 h-4" />
            {label}
        </button>
    );
}

function OverviewTab() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard icon={Briefcase} label="Active Jobs" value="—" color="text-blue-400" bg="bg-blue-500/10" border="border-blue-500/20" />
                    <StatCard icon={Users} label="Applicants" value="—" color="text-green-400" bg="bg-green-500/10" border="border-green-500/20" />
                    <StatCard icon={Star} label="Shortlists" value="—" color="text-purple-400" bg="bg-purple-500/10" border="border-purple-500/20" />
                    <StatCard icon={Search} label="Scouts" value="—" color="text-orange-400" bg="bg-orange-500/10" border="border-orange-500/20" />
                </div>

                <EventWinnersFeed />
            </div>

            <div className="lg:col-span-1 space-y-6">
                <h2 className="text-xl font-bold text-white">Quick Links</h2>
                <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-3">
                    <Link href="/jobs" className="block text-gray-300 hover:text-white underline">
                        View Job Board
                    </Link>
                    <Link href="/jobs/post" className="block text-gray-300 hover:text-white underline">
                        Post a Job
                    </Link>
                    <Link href="/recruitment" className="block text-gray-300 hover:text-white underline">
                        Recruitment
                    </Link>
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, color, bg, border }: any) {
    return (
        <div className={cn("p-6 rounded-xl border bg-backdrop-blur-sm", bg, border)}>
            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-3 bg-black/40", color)}>
                <Icon className="w-6 h-6" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">{value}</div>
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</div>
        </div>
    );
}

function JobsTab({ recruiterId }: { recruiterId: string }) {
    const [jobs, setJobs] = useState<any[]>([]);
    const [selectedJob, setSelectedJob] = useState<any | null>(null);
    const [applicants, setApplicants] = useState<any[]>([]);
    const [loadingJobs, setLoadingJobs] = useState(true);
    const [loadingApplicants, setLoadingApplicants] = useState(false);

    const phpBase = useMemo(() => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost/Competex/api";
        return apiUrl.replace(/\/api\/?$/, "");
    }, []);

    useEffect(() => {
        const loadJobs = async () => {
            setLoadingJobs(true);
            try {
                const res = await fetch(ENDPOINTS.GET_RECRUITER_JOB_POSTINGS(recruiterId));
                const data = await res.json();
                if (data?.status === "success" && Array.isArray(data.data)) {
                    setJobs(data.data);
                } else {
                    setJobs([]);
                }
            } catch (e) {
                console.error(e);
                toast.error("Failed to load your jobs");
                setJobs([]);
            } finally {
                setLoadingJobs(false);
            }
        };
        loadJobs();
    }, [recruiterId]);

    const loadApplicants = async (job: any) => {
        setSelectedJob(job);
        setLoadingApplicants(true);
        try {
            const res = await fetch(ENDPOINTS.GET_JOB_APPLICANTS(job.id, recruiterId));
            const data = await res.json();
            if (data?.status === "success" && Array.isArray(data.data)) {
                setApplicants(data.data);
            } else {
                setApplicants([]);
            }
        } catch (e) {
            console.error(e);
            toast.error("Failed to load applicants");
            setApplicants([]);
        } finally {
            setLoadingApplicants(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-white/5 border border-white/10 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">Your Jobs</h3>
                    <Link
                        href="/jobs/post"
                        className="px-3 py-1.5 bg-purple-600 text-white text-xs font-bold uppercase rounded-lg hover:bg-purple-500"
                    >
                        Post Job
                    </Link>
                </div>

                {loadingJobs ? (
                    <div className="text-gray-500 text-sm py-6 text-center">Loading...</div>
                ) : jobs.length === 0 ? (
                    <div className="text-gray-500 text-sm py-6 text-center">No jobs posted yet.</div>
                ) : (
                    <div className="space-y-3">
                        {jobs.map((job) => (
                            <button
                                key={job.id}
                                onClick={() => loadApplicants(job)}
                                className={cn(
                                    "w-full text-left p-4 rounded-xl border transition-all",
                                    selectedJob?.id === job.id
                                        ? "bg-purple-500/10 border-purple-500/30"
                                        : "bg-black/30 border-white/10 hover:bg-white/5 hover:border-white/20"
                                )}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="font-bold text-white line-clamp-1">{job.title}</div>
                                        <div className="text-xs text-gray-400 line-clamp-1">{job.company_name || "—"}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-gray-400">Applicants</div>
                                        <div className="text-sm font-bold text-white">{job.applicant_count ?? 0}</div>
                                        {(job.pending_count ?? 0) > 0 && (
                                            <div className="text-[11px] font-bold text-green-400">{job.pending_count} new</div>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-3 text-xs text-gray-500">
                                    {job.location || "—"} • {job.employment_type || "—"}
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">
                        {selectedJob ? `Applicants • ${selectedJob.title}` : "Applicants"}
                    </h3>
                    {selectedJob && (
                        <Link
                            href={`/jobs/${encodeURIComponent(selectedJob.id)}`}
                            className="inline-flex items-center gap-2 text-sm text-purple-300 hover:text-purple-200"
                        >
                            <Eye className="w-4 h-4" /> View Job
                        </Link>
                    )}
                </div>

                {!selectedJob ? (
                    <div className="text-gray-500 text-sm py-10 text-center border border-white/10 rounded-xl border-dashed bg-black/20">
                        Select a job to view applicants.
                    </div>
                ) : loadingApplicants ? (
                    <div className="text-gray-500 text-sm py-10 text-center">Loading applicants...</div>
                ) : applicants.length === 0 ? (
                    <div className="text-gray-500 text-sm py-10 text-center border border-white/10 rounded-xl border-dashed bg-black/20">
                        No applications yet.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {applicants.map((a, idx) => (
                            <motion.div
                                key={a.application_id || idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-black/30 border border-white/10 rounded-xl p-4"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0">
                                        <Link href={`/people/${encodeURIComponent(a.user_id)}`} className="font-bold text-white hover:text-accent1">
                                            {a.name || "Applicant"}
                                        </Link>
                                        <div className="text-xs text-gray-400">
                                            {a.university || "—"} {a.department ? `• ${a.department}` : ""}
                                        </div>
                                        {Array.isArray(a.skills) && a.skills.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {a.skills.slice(0, 6).map((s: string) => (
                                                    <span key={s} className="px-2 py-1 bg-white/5 rounded text-[11px] text-gray-300 border border-white/10">
                                                        {s}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-right whitespace-nowrap">
                                        <div className="text-xs text-gray-500">Status</div>
                                        <div className="text-sm font-bold text-white">{a.application_status}</div>
                                        <div className="text-xs text-gray-500 mt-2">Applied</div>
                                        <div className="text-xs text-gray-300">{a.applied_at}</div>
                                    </div>
                                </div>

                                {a.application_message && (
                                    <div className="mt-3 text-sm text-gray-300 whitespace-pre-wrap">
                                        {a.application_message}
                                    </div>
                                )}

                                <div className="flex flex-wrap gap-3 mt-4">
                                    {a.cv_path && (
                                        <a
                                            href={`${phpBase}/${a.cv_path}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-sm text-purple-300 hover:text-purple-200 underline"
                                        >
                                            Download CV
                                        </a>
                                    )}
                                    {Array.isArray(a.documents) && a.documents.length > 0 && (
                                        a.documents.slice(0, 3).map((d: any, docIdx: number) => (
                                            <a
                                                key={`${a.application_id}-doc-${docIdx}`}
                                                href={`${phpBase}/${d.path}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-sm text-gray-300 hover:text-white underline"
                                            >
                                                {d.name || `Document ${docIdx + 1}`}
                                            </a>
                                        ))
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

