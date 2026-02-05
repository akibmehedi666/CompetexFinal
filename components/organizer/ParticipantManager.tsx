"use client";

import { useState } from "react";
import { Search, Filter, Download, Mail, CheckCircle, XCircle, MoreHorizontal } from "lucide-react";
import { EventRegistration } from "@/types";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

// Mock Data for dev
const MOCK_REGISTRATIONS: EventRegistration[] = [
    {
        id: "reg1",
        eventId: "evt1",
        userId: "u1",
        user: { id: "u1", name: "Alex Cyber", email: "alex@edu.com", role: "Participant", skills: ["React", "Node.js"], avatar: "" },
        teamId: "team1",
        teamName: "CyberPunkz",
        status: "confirmed",
        registeredAt: "2026-01-10T10:00:00"
    },
    {
        id: "reg2",
        eventId: "evt1",
        userId: "u5",
        user: { id: "u5", name: "Sarah Code", email: "sarah@edu.com", role: "Participant", skills: ["Python", "AI"], avatar: "" },
        teamId: "team1",
        teamName: "CyberPunkz",
        status: "pending",
        registeredAt: "2026-01-11T14:30:00"
    },
    {
        id: "reg3",
        eventId: "evt1",
        userId: "u6",
        user: { id: "u6", name: "Mike Dev", email: "mike@edu.com", role: "Participant", skills: ["Java", "Spring"], avatar: "" },
        status: "waitlisted",
        registeredAt: "2026-01-12T09:15:00"
    },
    // Add more mock data if needed
];

export function ParticipantManager() {
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState<"all" | "confirmed" | "pending" | "waitlisted" | "rejected">("all");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const filteredRegistrations = MOCK_REGISTRATIONS.filter(reg => {
        const matchesSearch = (reg.user?.name.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
            (reg.user?.email.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
            (reg.teamName && reg.teamName.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesStatus = filterStatus === "all" || reg.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const handleSelectAll = () => {
        if (selectedIds.length === filteredRegistrations.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredRegistrations.map(r => r.id));
        }
    };

    const handleSelectOne = (id: string) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(prev => prev.filter(item => item !== id));
        } else {
            setSelectedIds(prev => [...prev, id]);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name, email, or team..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:border-accent1 outline-none"
                    />
                </div>

                <div className="flex gap-2">
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as any)}
                        className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:border-accent1 outline-none"
                    >
                        <option value="all">All Status</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="pending">Pending</option>
                        <option value="waitlisted">Waitlisted</option>
                        <option value="rejected">Rejected</option>
                    </select>

                    <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white transition-colors">
                        <Filter className="w-4 h-4" /> Filter
                    </button>

                    <button className="flex items-center gap-2 px-4 py-2 bg-accent1/10 hover:bg-accent1/20 border border-accent1/30 rounded-lg text-sm text-accent1 transition-colors">
                        <Download className="w-4 h-4" /> Export
                    </button>
                </div>
            </div>

            {/* Batch Actions */}
            {selectedIds.length > 0 && (
                <div className="bg-accent1/10 border border-accent1/20 rounded-lg p-3 flex items-center justify-between">
                    <span className="text-sm text-accent1 font-bold px-2">{selectedIds.length} selected</span>
                    <div className="flex gap-2">
                        <button className="px-3 py-1.5 bg-green-500/20 text-green-400 text-xs font-bold rounded hover:bg-green-500/30">
                            Approve Selected
                        </button>
                        <button className="px-3 py-1.5 bg-red-500/20 text-red-400 text-xs font-bold rounded hover:bg-red-500/30">
                            Reject Selected
                        </button>
                        <button className="px-3 py-1.5 bg-white/10 text-white text-xs font-bold rounded hover:bg-white/20">
                            Send Email
                        </button>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/5 border-b border-white/10 text-xs font-bold text-gray-400 uppercase tracking-wider">
                            <th className="p-4 w-10">
                                <input
                                    type="checkbox"
                                    checked={selectedIds.length === filteredRegistrations.length && filteredRegistrations.length > 0}
                                    onChange={handleSelectAll}
                                    className="rounded border-white/20 bg-white/10"
                                />
                            </th>
                            <th className="p-4">Participant</th>
                            <th className="p-4">Team</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Registered</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filteredRegistrations.map((reg) => (
                            <tr key={reg.id} className="hover:bg-white/5 transition-colors">
                                <td className="p-4">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.includes(reg.id)}
                                        onChange={() => handleSelectOne(reg.id)}
                                        className="rounded border-white/20 bg-white/10"
                                    />
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
                                            {reg.user?.name?.charAt(0) || "?"}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-white">{reg.user?.name || "Unknown User"}</div>
                                            <div className="text-xs text-gray-500">{reg.user?.email || "No Email"}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    {reg.teamName ? (
                                        <span className="px-2 py-1 bg-white/10 rounded text-xs text-gray-300">
                                            {reg.teamName}
                                        </span>
                                    ) : (
                                        <span className="text-xs text-gray-500 italic">Individual</span>
                                    )}
                                </td>
                                <td className="p-4">
                                    <StatusBadge status={reg.status} />
                                </td>
                                <td className="p-4 text-sm text-gray-400">
                                    {new Date(reg.registeredAt).toLocaleDateString()}
                                </td>
                                <td className="p-4 text-right">
                                    <button className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filteredRegistrations.length === 0 && (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-gray-500">
                                    No participants found matching your filters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const config = {
        confirmed: { color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20", icon: CheckCircle },
        pending: { color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20", icon: null },
        waitlisted: { color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20", icon: null },
        rejected: { color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", icon: XCircle },
    }[status] || { color: "text-gray-400", bg: "bg-white/5", border: "border-white/10", icon: null };

    const Icon = config.icon;

    return (
        <span className={cn(
            "flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full text-xs font-bold border capitalize",
            config.color, config.bg, config.border
        )}>
            {Icon && <Icon className="w-3 h-3" />}
            {status}
        </span>
    );
}
