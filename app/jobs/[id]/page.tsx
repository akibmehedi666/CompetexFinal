"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/ui/Navbar";
import { ENDPOINTS } from "@/lib/api_config";
import { useStore } from "@/store/useStore";
import { toast } from "sonner";
import { Briefcase, MapPin, DollarSign, Clock, ArrowLeft, Send } from "lucide-react";

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
    recruiter_name?: string | null;
};

export default function JobDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const jobId = useMemo(() => String((params as any)?.id || ""), [params]);
    const { currentUser, initAuth } = useStore();

    const [job, setJob] = useState<JobPosting | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState("");
    const [cvFile, setCvFile] = useState<File | null>(null);
    const [docsFiles, setDocsFiles] = useState<File[]>([]);
    const [applied, setApplied] = useState(false);
    const [eligible, setEligible] = useState(false);

    useEffect(() => {
        initAuth();
    }, [initAuth]);

    useEffect(() => {
        const load = async () => {
            if (!jobId) return;
            setLoading(true);
            try {
                const viewerQuery = currentUser?.id ? `&viewer_id=${encodeURIComponent(currentUser.id)}` : "";
                const res = await fetch(`${ENDPOINTS.GET_JOB_POSTING(jobId)}${viewerQuery}`);
                const data = await res.json();
                if (data?.status === "success" && data.data) {
                    const j = data.data;
                    setJob({
                        id: String(j.id),
                        title: String(j.title || ""),
                        company_name: j.company_name ?? null,
                        location: j.location ?? null,
                        salary_range: j.salary_range ?? null,
                        employment_type: j.employment_type ?? null,
                        description: j.description ?? null,
                        deadline: j.deadline ?? null,
                        tags: Array.isArray(j.tags) ? j.tags : [],
                        created_at: j.created_at ?? null,
                        recruiter_name: j.recruiter_name ?? null,
                    });
                    setApplied(Boolean(j.viewer_applied));
                    setEligible(Boolean(j.viewer_eligible));
                } else {
                    setJob(null);
                    setApplied(false);
                    setEligible(false);
                }
            } catch (e) {
                console.error(e);
                setJob(null);
                setApplied(false);
                setEligible(false);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [jobId, currentUser?.id]);

    const handleApply = async () => {
        if (!currentUser?.id) {
            toast.error("Please login to apply.");
            router.push("/login");
            return;
        }
        if (!job?.id) return;
        if (applied) return;
        if (!eligible) {
            toast.error("Only users ranked in the top 5 of any event leaderboard can apply.");
            return;
        }
        if (!cvFile) {
            toast.error("Please upload your CV.");
            return;
        }

        setSubmitting(true);
        try {
            const fd = new FormData();
            fd.append("job_id", job.id);
            fd.append("applicant_id", currentUser.id);
            if (message.trim()) fd.append("message", message.trim());
            fd.append("cv", cvFile);
            docsFiles.forEach((f) => fd.append("documents[]", f));

            const res = await fetch(ENDPOINTS.APPLY_JOB, { method: "POST", body: fd });
            const data = await res.json().catch(() => null);
            if (res.ok && data?.status === "success") {
                toast.success("Application submitted!");
                setCvFile(null);
                setDocsFiles([]);
                setMessage("");
                setApplied(true);
                return;
            }
            if (res.status === 409) {
                toast.success("Already applied");
                setApplied(true);
                return;
            }
            toast.error(data?.message || "Failed to apply");
        } catch (e) {
            console.error(e);
            toast.error("Network error submitting application");
        } finally {
            setSubmitting(false);
        }
    };

    const postedAt = useMemo(() => {
        if (!job?.created_at) return null;
        const created = new Date(job.created_at).getTime();
        if (!Number.isFinite(created)) return null;
        const diffDays = Math.max(0, Math.floor((Date.now() - created) / (1000 * 60 * 60 * 24)));
        return diffDays;
    }, [job?.created_at]);

    return (
        <div className="min-h-screen bg-black text-white pt-24 pb-20 px-6">
            <Navbar />

            <div className="max-w-4xl mx-auto space-y-6">
                <button
                    onClick={() => router.push("/jobs")}
                    className="inline-flex items-center gap-2 text-sm text-gray-300 hover:text-white"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Job Board
                </button>

                {loading ? (
                    <div className="text-center py-24 text-gray-500">Loading job...</div>
                ) : !job ? (
                    <div className="text-center py-24 text-gray-500">Job not found.</div>
                ) : (
                    <>
                        <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 space-y-5">
                            <div className="flex items-start justify-between gap-6">
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-bold text-white">{job.title}</h1>
                                    <p className="text-gray-400 mt-1">
                                        {job.company_name || "—"} {job.recruiter_name ? `• Posted by ${job.recruiter_name}` : ""}
                                    </p>
                                </div>
                                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                                    <Briefcase className="w-6 h-6 text-accent1" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-300">
                                <div className="flex items-center gap-2 bg-black/40 border border-white/5 rounded-xl p-3">
                                    <MapPin className="w-4 h-4 text-accent2" />
                                    <span>{job.location || "—"}</span>
                                </div>
                                <div className="flex items-center gap-2 bg-black/40 border border-white/5 rounded-xl p-3">
                                    <DollarSign className="w-4 h-4 text-green-400" />
                                    <span>{job.salary_range || "—"}</span>
                                </div>
                                <div className="flex items-center gap-2 bg-black/40 border border-white/5 rounded-xl p-3">
                                    <Clock className="w-4 h-4 text-orange-400" />
                                    <span>{postedAt === null ? "Posted recently" : `Posted ${postedAt} days ago`}</span>
                                </div>
                            </div>

                            {job.tags?.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {job.tags.map((t) => (
                                        <span key={t} className="px-2 py-1 bg-white/5 rounded text-xs text-gray-300 border border-white/10">
                                            {t}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <div className="pt-2">
                                <h2 className="text-lg font-bold text-white mb-2">Job Description</h2>
                                <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                                    {job.description || "—"}
                                </div>
                            </div>

                            {job.deadline && (
                                <div className="text-sm text-gray-400">
                                    Deadline: <span className="text-gray-200">{job.deadline}</span>
                                </div>
                            )}
                        </div>

                        <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 space-y-4">
                            <h2 className="text-xl font-bold text-white">Apply Now</h2>
                            <p className="text-sm text-gray-400">
                                Upload your CV and any additional documents. Your application will be saved as pending.
                            </p>

                            {applied ? (
                                <button
                                    disabled
                                    className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-500/20 text-green-300 font-bold uppercase tracking-wider rounded-xl border border-green-500/30"
                                >
                                    Applied
                                </button>
                            ) : !currentUser?.id ? (
                                <div className="text-sm text-gray-400">
                                    Please <button onClick={() => router.push("/login")} className="text-accent1 underline">login</button> to apply.
                                </div>
                            ) : !eligible ? (
                                <div className="text-sm text-gray-400 border border-white/10 rounded-xl p-4 bg-black/20">
                                    Only users ranked in the <span className="text-white font-bold">top 5</span> of any event leaderboard can apply for jobs.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Message (optional)</label>
                                        <textarea
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            rows={4}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-accent1 outline-none"
                                            placeholder="Short note to the recruiter..."
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">CV (required)</label>
                                            <input
                                                type="file"
                                                accept=".pdf,.doc,.docx"
                                                onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                                                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Documents (optional)</label>
                                            <input
                                                type="file"
                                                multiple
                                                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                                                onChange={(e) => setDocsFiles(e.target.files ? Array.from(e.target.files) : [])}
                                                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleApply}
                                        disabled={submitting}
                                        className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-accent1 text-black font-bold uppercase tracking-wider rounded-xl hover:bg-white transition-colors disabled:opacity-70"
                                    >
                                        {submitting ? (
                                            <>
                                                <span className="animate-spin w-4 h-4 border-2 border-black border-t-transparent rounded-full" />
                                                Submitting...
                                            </>
                                        ) : (
                                            <>
                                                Submit Application <Send className="w-4 h-4" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
