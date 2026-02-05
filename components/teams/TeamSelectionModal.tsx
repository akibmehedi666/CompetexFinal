"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Users, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface Team {
    id: string;
    name: string;
    description: string;
    role: string;
    members_count?: number; // Optional if available
}

interface TeamSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    teams: Team[];
    onSelect: (teamId: string) => void;
    isLoading?: boolean;
}

export function TeamSelectionModal({ isOpen, onClose, teams, onSelect, isLoading }: TeamSelectionModalProps) {
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const handleConfirm = () => {
        if (selectedId) {
            onSelect(selectedId);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-y-auto"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden pointer-events-auto">
                            <div className="p-6 border-b border-white/10 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-white">Select Team</h2>
                                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>

                            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-3">
                                <p className="text-gray-400 text-sm mb-4">
                                    Which team would you like to register for this event?
                                </p>

                                {teams.map(team => (
                                    <div
                                        key={team.id}
                                        onClick={() => setSelectedId(team.id)}
                                        className={cn(
                                            "p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between group",
                                            selectedId === team.id
                                                ? "bg-accent1/10 border-accent1"
                                                : "bg-white/5 border-white/10 hover:bg-white/10"
                                        )}
                                    >
                                        <div>
                                            <h3 className={cn(
                                                "font-bold",
                                                selectedId === team.id ? "text-accent1" : "text-white"
                                            )}>{team.name}</h3>
                                            <p className="text-xs text-gray-400 mt-1 line-clamp-1">{team.description}</p>
                                        </div>
                                        {selectedId === team.id && (
                                            <CheckCircle className="w-5 h-5 text-accent1" />
                                        )}
                                    </div>
                                ))}

                                {teams.length === 0 && (
                                    <div className="text-center py-8 text-gray-500">
                                        <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                        No teams found where you are a leader.
                                    </div>
                                )}
                            </div>

                            <div className="p-6 border-t border-white/10 flex justify-end gap-3 bg-black/20">
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    disabled={!selectedId || isLoading}
                                    className="px-6 py-2 rounded-lg text-sm font-bold bg-accent1 text-black hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm & Join"}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
