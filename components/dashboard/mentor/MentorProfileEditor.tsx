"use client";

import { useState, useEffect } from "react";
import { User, Achievement } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Upload, Save, Trophy, Trash2, Linkedin, Globe } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface MentorProfileEditorProps {
    user: any; // Using any for flexibility with backend response structure
    setUser: (user: any) => void;
}

export function MentorProfileEditor({ user, setUser }: MentorProfileEditorProps) {
    // Local state mapped to backend fields for editing
    const [formData, setFormData] = useState({
        name: user.mentor_name || user.name || "",
        mentorCompany: user.mentor_company || "",
        mentorPosition: user.mentor_position || "",
        mentorBio: user.mentor_bio || "",
        expertise: user.expertise || [],
        yearsExperience: user.years_experience || 0,
        mentorLinkedin: user.mentor_linkedin || "",
        mentorWebsite: user.mentor_website || "",
        hourlyRate: user.hourly_rate || 120, // Future proofing
        currency: user.currency || "$"
    });

    const [newExpertise, setNewExpertise] = useState("");
    const [achievements, setAchievements] = useState<Achievement[]>(user.achievements || []);
    const [isDirty, setIsDirty] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Sync when user prop updates (e.g. after save)
    useEffect(() => {
        setFormData({
            name: user.mentor_name || user.name || "",
            mentorCompany: user.mentor_company || "",
            mentorPosition: user.mentor_position || "",
            mentorBio: user.mentor_bio || "",
            expertise: user.expertise || [],
            yearsExperience: user.years_experience || 0,
            mentorLinkedin: user.mentor_linkedin || "",
            mentorWebsite: user.mentor_website || "",
            hourlyRate: user.hourly_rate || 120,
            currency: user.currency || "$"
        });
    }, [user]);

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setIsDirty(true);
    };

    const addExpertise = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && newExpertise.trim()) {
            if (!formData.expertise.includes(newExpertise.trim())) {
                const updated = [...formData.expertise, newExpertise.trim()];
                handleChange("expertise", updated);
                setNewExpertise("");
            }
        }
    };

    const removeExpertise = (tag: string) => {
        const updated = formData.expertise.filter((t: string) => t !== tag);
        handleChange("expertise", updated);
    };

    // Achievement Handling (Mock implementation for now as per previous version)
    const handleAchievementUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const newAchievement: Achievement = {
                id: Date.now().toString(),
                eventId: "custom-upload",
                eventTitle: "External Certification",
                title: file.name.split('.')[0],
                description: "Uploaded certificate/proof.",
                earnedDate: new Date().toISOString(),
                type: "special",
                badge: "🏆",
                certificateUrl: URL.createObjectURL(file)
            };
            setAchievements(prev => [...prev, newAchievement]);
            setIsDirty(true);
            toast.success("Certificate uploaded!");
        }
    };

    const removeAchievement = (id: string) => {
        setAchievements(prev => prev.filter(a => a.id !== id));
        setIsDirty(true);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/Competex/api';
            const res = await fetch(`${apiUrl}/update_profile.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: user.id,
                    ...formData,
                    achievements // Passing this even if backend doesn't handle it yet
                })
            });

            const data = await res.json();

            if (data.status === 'success') {
                const updated = { ...user, ...data.user };
                setUser(updated);
                if (typeof window !== "undefined") {
                    localStorage.setItem("competex_user_session", JSON.stringify(updated));
                }
                setIsDirty(false);
                toast.success("Profile updated successfully!");
            } else {
                toast.error(data.message || "Failed to update profile");
            }
        } catch (error) {
            console.error("Save error:", error);
            toast.error("An error occurred while saving.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Edit Mentor Profile</h2>
                <button
                    onClick={handleSave}
                    disabled={!isDirty || isSaving}
                    className={cn(
                        "flex items-center gap-2 px-6 py-2 rounded-lg font-bold uppercase tracking-wide text-sm transition-all",
                        isDirty && !isSaving
                            ? "bg-accent1 text-black shadow-[0_0_15px_rgba(0,229,255,0.3)] hover:scale-105"
                            : "bg-white/10 text-gray-500 cursor-not-allowed"
                    )}
                >
                    <Save className="w-4 h-4" /> {isSaving ? "Saving..." : "Save Changes"}
                </button>
            </div>

            {/* Top Bar: Identity */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col md:flex-row items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-accent1/20 border border-accent1/50 flex items-center justify-center text-3xl font-bold text-accent1">
                    {user.name ? user.name.charAt(0).toUpperCase() : "M"}
                </div>
                <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleChange("name", e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-accent1 outline-none font-bold text-lg"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
                        <input
                            type="text"
                            value={user.email}
                            disabled
                            className="w-full bg-black/20 border border-white/5 rounded-lg p-3 text-gray-500 cursor-not-allowed"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Basic Info */}
                <div className="space-y-6">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4">Basic Information</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Professional Position / Title</label>
                                <input
                                    type="text"
                                    value={formData.mentorPosition}
                                    onChange={(e) => handleChange("mentorPosition", e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-accent1 outline-none"
                                    placeholder="e.g. Senior Software Engineer"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Organization / Company</label>
                                <input
                                    type="text"
                                    value={formData.mentorCompany}
                                    onChange={(e) => handleChange("mentorCompany", e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-accent1 outline-none"
                                    placeholder="e.g. Google"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Years of Experience</label>
                                    <input
                                        type="number"
                                        value={formData.yearsExperience}
                                        onChange={(e) => handleChange("yearsExperience", parseInt(e.target.value))}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-accent1 outline-none"
                                        placeholder="5"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Bio</label>
                                <textarea
                                    value={formData.mentorBio}
                                    onChange={(e) => handleChange("mentorBio", e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-accent1 outline-none min-h-[120px]"
                                    placeholder="Tell mentees about your experience..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4">Expertise & Skills</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Add Skill (Press Enter)</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newExpertise}
                                        onChange={(e) => setNewExpertise(e.target.value)}
                                        onKeyDown={addExpertise}
                                        className="flex-1 bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-accent1 outline-none"
                                        placeholder="e.g. System Design"
                                    />
                                    <button
                                        onClick={() => {
                                            if (newExpertise.trim()) {
                                                if (!formData.expertise.includes(newExpertise.trim())) {
                                                    const updated = [...formData.expertise, newExpertise.trim()];
                                                    handleChange("expertise", updated);
                                                    setNewExpertise("");
                                                }
                                            }
                                        }}
                                        className="p-3 bg-white/10 rounded-lg hover:bg-white/20"
                                    >
                                        <Plus className="w-5 h-5 text-white" />
                                    </button>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-3">
                                {Array.isArray(formData.expertise) && formData.expertise.map((tag: string) => (
                                    <span key={tag} className="flex items-center gap-1 px-3 py-1 bg-accent1/10 border border-accent1/30 text-accent1 rounded-full text-sm group">
                                        {tag}
                                        <button onClick={() => removeExpertise(tag)} className="hover:text-white transition-colors">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Socials & Achievements */}
                <div className="space-y-6">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4">Social Presence</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">LinkedIn Profile</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={formData.mentorLinkedin}
                                        onChange={(e) => handleChange("mentorLinkedin", e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg p-3 pl-10 text-white focus:border-accent1 outline-none"
                                        placeholder="https://linkedin.com/in/..."
                                    />
                                    <Linkedin className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Website / Portfolio</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={formData.mentorWebsite}
                                        onChange={(e) => handleChange("mentorWebsite", e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg p-3 pl-10 text-white focus:border-accent1 outline-none"
                                        placeholder="https://yourwebsite.com"
                                    />
                                    <Globe className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-white">Achievements & Certificates</h3>
                            <label className="cursor-pointer flex items-center gap-2 px-3 py-1.5 bg-accent1/10 text-accent1 text-xs font-bold uppercase rounded-lg border border-accent1/20 hover:bg-accent1 hover:text-black transition-all">
                                <Upload className="w-3 h-3" /> Upload
                                <input type="file" className="hidden" accept="image/*,.pdf" onChange={handleAchievementUpload} />
                            </label>
                        </div>

                        <div className="space-y-3">
                            <AnimatePresence>
                                {achievements.map(ach => (
                                    <motion.div
                                        key={ach.id}
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="flex items-center gap-3 p-3 bg-black/40 rounded-lg border border-white/5 group"
                                    >
                                        <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center text-2xl">
                                            {ach.badge || "🏆"}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-bold text-white truncate">{ach.title}</h4>
                                            <p className="text-xs text-gray-500 truncate">{ach.eventTitle}</p>
                                        </div>
                                        <button
                                            onClick={() => removeAchievement(ach.id)}
                                            className="p-2 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            {achievements.length === 0 && (
                                <div className="text-center py-8 text-gray-500 text-sm border border-dashed border-white/10 rounded-lg">
                                    No achievements added yet.
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4">Mentorship Details</h3>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Hourly Rate (Mock)</label>
                                <input
                                    type="number"
                                    value={formData.hourlyRate}
                                    onChange={(e) => handleChange("hourlyRate", parseInt(e.target.value))}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-accent1 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Currency</label>
                                <select
                                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-accent1 outline-none"
                                    value={formData.currency}
                                    onChange={(e) => handleChange("currency", e.target.value)}
                                >
                                    <option value="$">USD ($)</option>
                                    <option value="€">EUR (€)</option>
                                    <option value="£">GBP (£)</option>
                                    <option value="৳">BDT (৳)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
