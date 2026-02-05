"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, Eye, EyeOff, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SponsorshipRole } from "@/types";
import { cn } from "@/lib/utils";

// Mock Data
const MOCK_ROLES: SponsorshipRole[] = [
    {
        id: "r1",
        sponsorId: "s1",
        title: "Title Sponsor",
        category: ["Hackathon", "Coding"],
        minEventLevel: "National",
        offerings: ["$10,000 Cash", "Cloud Credits", "Internship Opportunities"],
        benefits: ["Top Logo Placement", "Keynote Session", "Booth Space"],
        status: "Open",
        createdAt: "2025-01-01"
    },
    {
        id: "r2",
        sponsorId: "s1",
        title: "Beverage Partner",
        category: ["Hackathon", "Sports"],
        minEventLevel: "College",
        offerings: ["Energy Drinks", "Snacks"],
        benefits: ["Logo on Banners", "Stall"],
        status: "Open",
        createdAt: "2025-01-10"
    }
];

import { CreateRoleModal } from "./CreateRoleModal";

export function SponsorshipRolesManager() {
    const [roles, setRoles] = useState<SponsorshipRole[]>(MOCK_ROLES);
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    const handleCreate = (newRole: any) => {
        setRoles([...roles, { ...newRole, id: `r${roles.length + 1}`, sponsorId: "s1" }]);
        setIsCreating(false);
    };

    return (
        <div className="space-y-6">
            {isCreating && (
                <CreateRoleModal
                    onClose={() => setIsCreating(false)}
                    onSave={handleCreate}
                />
            )}

            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white">Sponsorship Roles</h2>
                    <p className="text-gray-400">Define the types of sponsorship you offer to organizers.</p>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-accent1 text-black rounded-lg font-bold hover:bg-white transition-colors"
                >
                    <Plus className="w-4 h-4" /> Add New Role
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                    {roles.map((role) => (
                        <RoleCard key={role.id} role={role} />
                    ))}
                </AnimatePresence>

                {/* Empty State / Add New Placeholder */}
                <button
                    onClick={() => setIsCreating(true)}
                    className="border border-dashed border-white/10 rounded-xl p-6 flex flex-col items-center justify-center text-gray-500 hover:text-white hover:border-accent1/50 hover:bg-white/5 transition-all group min-h-[300px]"
                >
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Plus className="w-8 h-8" />
                    </div>
                    <h3 className="font-bold">Create New Role</h3>
                    <p className="text-sm mt-1">Define customized offerings</p>
                </button>
            </div>
        </div>
    );
}

function RoleCard({ role }: { role: SponsorshipRole }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-[#111] border border-white/10 rounded-xl overflow-hidden group hover:border-accent1/30 transition-colors"
        >
            <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            {role.title.includes("Title") && <Shield className="w-4 h-4 text-purple-400" />}
                            <h3 className="text-lg font-bold text-white">{role.title}</h3>
                        </div>
                        <div className="flex gap-2 text-xs">
                            <span className="bg-white/5 px-2 py-0.5 rounded text-gray-400 border border-white/5">{role.minEventLevel} Level</span>
                            <span className={cn(
                                "px-2 py-0.5 rounded border",
                                role.status === "Open" ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"
                            )}>{role.status}</span>
                        </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white"><Edit2 className="w-4 h-4" /></button>
                        <button className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">We Offer</h4>
                        <div className="flex flex-wrap gap-2">
                            {role.offerings.map((item, i) => (
                                <span key={i} className="text-xs bg-accent1/10 text-accent1 px-2 py-1 rounded border border-accent1/20">{item}</span>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">We Expect</h4>
                        <ul className="text-sm text-gray-400 space-y-1">
                            {role.benefits.map((item, i) => (
                                <li key={i} className="flex items-center gap-2">
                                    <span className="w-1 h-1 rounded-full bg-gray-500" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            <div className="bg-white/5 p-3 flex justify-between items-center text-xs text-gray-500 border-t border-white/5">
                <span>Created {role.createdAt}</span>
                <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> {role.category.join(", ")}</span>
            </div>
        </motion.div>
    );
}
