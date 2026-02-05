"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Users, Target, Rocket, Lightbulb, Trophy } from "lucide-react";
import { toast } from "sonner";
import { ENDPOINTS } from "@/lib/api_config";
import { Event } from "@/types";
import { useStore } from "@/store/useStore";

interface TeamCreationModalProps {
    isOpen: boolean;
    onClose: () => void;
    events: Event[];
}

export function TeamCreationModal({ isOpen, onClose, events }: TeamCreationModalProps) {
    const { currentUser } = useStore();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        eventId: "",
        description: "",
        projectIdea: "",
        maxMembers: "4",
        requiredSkills: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) {
            toast.error("You must be logged in to create a team");
            return;
        }
        setLoading(true);

        const skillsArray = formData.requiredSkills.split(",").map(s => s.trim()).filter(Boolean);
        const maxMembersInt = parseInt(formData.maxMembers) || 4;

        try {
            const response = await fetch(ENDPOINTS.CREATE_TEAM, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    competition_id: formData.eventId,
                    leader_id: currentUser.id,
                    max_members: maxMembersInt,
                    description: formData.description,
                    project_idea: formData.projectIdea,
                    required_skills: skillsArray
                })
            });

            const data = await response.json();

            if (data.status === "success") {
                toast.success("Team created successfully!");
                onClose();
                // Optionally refresh team list
            } else {
                toast.error(data.message || "Failed to create team");
            }
        } catch (error) {
            console.error("Creation error:", error);
            toast.error("Failed to connect to server");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-y-auto"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto pointer-events-auto selection:bg-accent1/30">
                            <div className="p-6 border-b border-white/10 flex justify-between items-center sticky top-0 bg-[#0A0A0A] z-10">
                                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                    <Rocket className="w-6 h-6 text-accent1" /> Create New Team
                                </h2>
                                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                {/* Team Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Team Name</label>
                                    <div className="relative">
                                        <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-accent1 focus:outline-none transition-all"
                                            placeholder="e.g. Quantum Coders"
                                        />
                                    </div>
                                </div>

                                {/* Competition & Size */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Competition / Event</label>
                                        <div className="relative">
                                            <Trophy className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                            <select
                                                value={formData.eventId}
                                                onChange={(e) => setFormData({ ...formData, eventId: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-accent1 focus:outline-none transition-all appearance-none"
                                            >
                                                <option value="" className="bg-black">No Event (General Team)</option>
                                                {events.map((event) => (
                                                    <option key={event.id} value={event.id} className="bg-black">{event.title}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Max Members</label>
                                        <div className="relative">
                                            <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                            <input
                                                type="number"
                                                min="2"
                                                max="10"
                                                value={formData.maxMembers}
                                                onChange={(e) => setFormData({ ...formData, maxMembers: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-accent1 focus:outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Team Description</label>
                                    <div className="relative">
                                        <Target className="absolute left-4 top-4 w-5 h-5 text-gray-500" />
                                        <textarea
                                            required
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-accent1 focus:outline-none transition-all h-24 resize-none"
                                            placeholder="What is your team about?"
                                        />
                                    </div>
                                </div>

                                {/* Project Idea */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Project Idea (Optional)</label>
                                    <div className="relative">
                                        <Lightbulb className="absolute left-4 top-4 w-5 h-5 text-gray-500" />
                                        <textarea
                                            value={formData.projectIdea}
                                            onChange={(e) => setFormData({ ...formData, projectIdea: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-accent1 focus:outline-none transition-all h-24 resize-none"
                                            placeholder="Briefly describe what you want to build..."
                                        />
                                    </div>
                                </div>

                                {/* Skills */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Required Skills (Comma separated)</label>
                                    <input
                                        type="text"
                                        value={formData.requiredSkills}
                                        onChange={(e) => setFormData({ ...formData, requiredSkills: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-accent1 focus:outline-none transition-all"
                                        placeholder="e.g. React, Python, Design"
                                    />
                                </div>

                                <div className="pt-4 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="px-6 py-3 rounded-xl font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-8 py-3 bg-accent1 text-black font-bold uppercase tracking-wide rounded-xl hover:bg-white transition-all shadow-[0_0_20px_rgba(0,229,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? "Creating..." : "Create Team"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
