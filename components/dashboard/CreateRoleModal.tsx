"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, Save } from "lucide-react";

interface CreateRoleModalProps {
    onClose: () => void;
    onSave: (role: any) => void;
}

export function CreateRoleModal({ onClose, onSave }: CreateRoleModalProps) {
    const [title, setTitle] = useState("");
    const [level, setLevel] = useState("College");
    const [status, setStatus] = useState("Open");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            title,
            minEventLevel: level,
            status,
            category: ["General"],
            offerings: ["Custom Offering"],
            benefits: ["Brand Exposure"],
            createdAt: new Date().toISOString().split('T')[0]
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#111] border border-white/10 rounded-xl w-full max-w-md p-6 relative"
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white"
                >
                    <X className="w-4 h-4" />
                </button>

                <h2 className="text-xl font-bold text-white mb-6">Create New Role</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Role Title</label>
                        <input
                            type="text"
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-accent1 outline-none"
                            placeholder="e.g. Platinum Sponsor"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Minimum Event Level</label>
                        <select
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-accent1 outline-none appearance-none"
                            value={level}
                            onChange={(e) => setLevel(e.target.value)}
                        >
                            <option value="College">College</option>
                            <option value="National">National</option>
                            <option value="International">International</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Status</label>
                        <select
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-accent1 outline-none appearance-none"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                        >
                            <option value="Open">Open</option>
                            <option value="Closed">Closed</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 bg-accent1 text-black font-bold rounded-lg hover:bg-white transition-colors flex items-center justify-center gap-2 mt-2"
                    >
                        <Save className="w-4 h-4" /> Save Role
                    </button>
                </form>
            </motion.div>
        </div>
    );
}
