"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Briefcase, MapPin, DollarSign, Clock, Eye, Edit3, Send } from "lucide-react";
import { useStore } from "@/store/useStore";
import { useRouter } from "next/navigation";
import { ENDPOINTS } from "@/lib/api_config";
import { toast } from "sonner";

export default function PostJob() {
    const { currentUser, initAuth } = useStore();
    const router = useRouter();

    const [formData, setFormData] = useState({
        title: "",
        company_name: "",
        location: "",
        salary_range: "",
        employment_type: "Full-time",
        description: "",
        tags: "",
        deadline: ""
    });

    const [showPreview, setShowPreview] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);

    useEffect(() => {
        initAuth();
    }, [initAuth]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (!currentUser) {
                router.push("/login");
            } else if (currentUser.role !== "Recruiter") {
                router.push("/dashboard");
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [currentUser, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePublish = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser?.id) return;

        if (!formData.title.trim() || !formData.location.trim() || !formData.description.trim()) {
            toast.error("Title, location, and description are required.");
            return;
        }

        const tags = formData.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean);

        setIsPublishing(true);
        try {
            const res = await fetch(ENDPOINTS.CREATE_JOB_POSTING, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    recruiter_id: currentUser.id,
                    title: formData.title.trim(),
                    company_name: formData.company_name.trim() || null,
                    location: formData.location.trim(),
                    salary_range: formData.salary_range.trim() || null,
                    employment_type: formData.employment_type,
                    description: formData.description.trim(),
                    deadline: formData.deadline.trim() || null,
                    tags
                })
            });
            const data = await res.json();
            if (data?.status === "success") {
                toast.success("Job posted");
                router.push("/jobs");
                return;
            }
            toast.error(data?.message || "Failed to post job");
        } catch (err) {
            console.error(err);
            toast.error("Network error posting job");
        } finally {
            setIsPublishing(false);
        }
    };

    const tagsList = formData.tags
        .split(",")
        .map(req => req.trim())
        .filter(req => req.length > 0);

    return (
        <div className="min-h-screen bg-black text-white pt-24 pb-20 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Post a <span className="text-accent1">Job</span></h1>
                        <p className="text-gray-400">Reach thousands of developers and designers.</p>
                    </div>
                    <button
                        onClick={() => setShowPreview(!showPreview)}
                        className="md:hidden flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg border border-white/10 text-sm font-medium"
                    >
                        {showPreview ? <Edit3 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        {showPreview ? "Edit" : "Preview"}
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative">
                    <motion.div
                        className={`space-y-8 ${showPreview ? "hidden md:block" : "block"}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <form onSubmit={handlePublish} className="space-y-6">
                            <div className="space-y-4 p-6 bg-[#0A0A0A] border border-white/5 rounded-xl">
                                <h3 className="text-lg font-semibold text-accent1 flex items-center gap-2">
                                    <Briefcase className="w-4 h-4" /> Job Details
                                </h3>

                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Job Title</label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleChange}
                                            placeholder="e.g. Senior Frontend Developer"
                                            className="w-full bg-black border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-accent1/50 focus:ring-1 focus:ring-accent1/50 transition-all placeholder:text-gray-700"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-1">Company Name</label>
                                            <input
                                                type="text"
                                                name="company_name"
                                                value={formData.company_name}
                                                onChange={handleChange}
                                                placeholder="e.g. TechCorp"
                                                className="w-full bg-black border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-accent1/50 focus:ring-1 focus:ring-accent1/50 transition-all placeholder:text-gray-700"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-1">Job Type</label>
                                            <select
                                                name="employment_type"
                                                value={formData.employment_type}
                                                onChange={handleChange}
                                                className="w-full bg-black border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-accent1/50 focus:ring-1 focus:ring-accent1/50 transition-all"
                                            >
                                                <option value="Full-time">Full-time</option>
                                                <option value="Internship">Internship</option>
                                                <option value="Part-time">Part-time</option>
                                                <option value="Contract">Contract</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-1">Location</label>
                                            <input
                                                type="text"
                                                name="location"
                                                value={formData.location}
                                                onChange={handleChange}
                                                placeholder="e.g. Dhaka / Remote"
                                                className="w-full bg-black border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-accent1/50 focus:ring-1 focus:ring-accent1/50 transition-all placeholder:text-gray-700"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-1">Salary Range</label>
                                            <input
                                                type="text"
                                                name="salary_range"
                                                value={formData.salary_range}
                                                onChange={handleChange}
                                                placeholder="e.g. $1200 - $2000"
                                                className="w-full bg-black border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-accent1/50 focus:ring-1 focus:ring-accent1/50 transition-all placeholder:text-gray-700"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Deadline (Optional)</label>
                                        <input
                                            type="datetime-local"
                                            name="deadline"
                                            value={formData.deadline}
                                            onChange={handleChange}
                                            className="w-full bg-black border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-accent1/50 focus:ring-1 focus:ring-accent1/50 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 p-6 bg-[#0A0A0A] border border-white/5 rounded-xl">
                                <h3 className="text-lg font-semibold text-accent2 flex items-center gap-2">
                                    <Send className="w-4 h-4" /> Description
                                </h3>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Job Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows={6}
                                        placeholder="Describe the role, responsibilities, and requirements..."
                                        className="w-full bg-black border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-accent1/50 transition-all placeholder:text-gray-700 resize-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Tags (comma separated)</label>
                                    <input
                                        type="text"
                                        name="tags"
                                        value={formData.tags}
                                        onChange={handleChange}
                                        placeholder="e.g. React, Node.js, SQL"
                                        className="w-full bg-black border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-accent1/50 transition-all placeholder:text-gray-700"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isPublishing}
                                className="w-full py-4 bg-accent1 text-black font-bold uppercase tracking-wider rounded-lg shadow-[0_0_20px_rgba(0,229,255,0.3)] hover:shadow-[0_0_30px_rgba(0,229,255,0.5)] hover:scale-[1.01] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isPublishing ? (
                                    <>
                                        <span className="animate-spin w-5 h-5 border-2 border-black border-t-transparent rounded-full" />
                                        Publishing...
                                    </>
                                ) : (
                                    <>
                                        Publish Job Post <Send className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>

                    <div className={`md:block ${showPreview ? "block" : "hidden"}`}>
                        <div className="sticky top-24 space-y-6">
                            <h2 className="text-xl font-bold text-gray-300 flex items-center gap-2">
                                <Eye className="w-5 h-5 text-accent2" /> Live Preview
                            </h2>

                            <motion.div
                                layout
                                className="group relative bg-[#0A0A0A] border border-white/5 rounded-xl p-6 overflow-hidden shadow-2xl"
                            >
                                <div className="absolute inset-0 border border-accent1/30 rounded-xl pointer-events-none" />
                                <div className="absolute top-0 right-0 p-2 bg-accent1 text-black text-xs font-bold uppercase tracking-widest rounded-bl-lg">
                                    Preview
                                </div>

                                <div className="relative z-10 flex flex-col h-full space-y-4">
                                    <div className="flex justify-between items-start pr-12">
                                        <div>
                                            <h3 className="text-xl font-bold text-white group-hover:text-accent1 transition-colors line-clamp-1">
                                                {formData.title || "Job Title"}
                                            </h3>
                                            <p className="text-gray-400 text-sm font-medium">{formData.company_name || "Company Name"}</p>
                                        </div>
                                        <div className="p-2 bg-white/5 rounded-lg border border-white/5">
                                            <Briefcase className="w-5 h-5 text-accent1" />
                                        </div>
                                    </div>

                                    <div className="space-y-2 text-sm text-gray-400">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-accent2" />
                                            {formData.location || "Location"}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <DollarSign className="w-4 h-4 text-green-400" />
                                            {formData.salary_range || "Salary Range"}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-orange-400" />
                                            Posted Just Now
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2 pt-2">
                                        {tagsList.length > 0 ? (
                                            tagsList.slice(0, 6).map((tag, i) => (
                                                <span key={`${tag}-${i}`} className="px-2 py-1 bg-white/5 rounded text-xs text-gray-300 border border-white/5">
                                                    {tag}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-xs text-gray-600">Tags will appear here</span>
                                        )}
                                    </div>

                                    <div className="text-sm text-gray-400 leading-relaxed line-clamp-5">
                                        {formData.description || "Job description preview..."}
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

