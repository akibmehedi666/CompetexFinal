"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Users, Lock, Info } from "lucide-react";
import { ProfileVisibility } from "@/types";
import { cn } from "@/lib/utils";

interface VisibilityToggleProps {
    value: ProfileVisibility;
    onChange: (visibility: ProfileVisibility) => void;
}

const visibilityOptions: { value: ProfileVisibility; label: string; icon: any; description: string; color: string }[] = [
    {
        value: "public",
        label: "Public",
        icon: Eye,
        description: "Everyone can view your profile, including your competition history and achievements",
        color: "text-green-400"
    },
    {
        value: "recruiters-only",
        label: "Recruiters Only",
        icon: Users,
        description: "Only recruiters and event organizers can view your full profile",
        color: "text-blue-400"
    },
    {
        value: "private",
        label: "Private",
        icon: Lock,
        description: "Your profile is completely private. Only you can see your information",
        color: "text-gray-400"
    }
];

export function VisibilityToggle({ value, onChange }: VisibilityToggleProps) {
    const [showInfo, setShowInfo] = useState(false);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <EyeOff className="w-5 h-5 text-accent1" />
                    Profile Visibility
                </h3>
                <button
                    onClick={() => setShowInfo(!showInfo)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                    <Info className="w-4 h-4 text-gray-400" />
                </button>
            </div>

            {showInfo && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4"
                >
                    <p className="text-sm text-blue-300">
                        Control who can view your profile information. This affects your competition history,
                        achievements, and contact details visibility to recruiters and other users.
                    </p>
                </motion.div>
            )}

            <div className="space-y-3">
                {visibilityOptions.map((option) => {
                    const Icon = option.icon;
                    const isSelected = value === option.value;

                    return (
                        <motion.button
                            key={option.value}
                            onClick={() => onChange(option.value)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={cn(
                                "w-full p-4 rounded-xl border-2 transition-all text-left",
                                isSelected
                                    ? "bg-white/10 border-accent1 shadow-[0_0_15px_rgba(0,229,255,0.2)]"
                                    : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                            )}
                        >
                            <div className="flex items-start gap-4">
                                <div className={cn(
                                    "w-10 h-10 rounded-lg flex items-center justify-center",
                                    isSelected ? "bg-accent1/20" : "bg-white/5"
                                )}>
                                    <Icon className={cn("w-5 h-5", isSelected ? "text-accent1" : option.color)} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={cn(
                                            "font-bold",
                                            isSelected ? "text-white" : "text-gray-300"
                                        )}>
                                            {option.label}
                                        </span>
                                        {isSelected && (
                                            <span className="px-2 py-0.5 bg-accent1/20 text-accent1 text-xs font-bold rounded-full">
                                                Active
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-400">{option.description}</p>
                                </div>
                            </div>
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}
