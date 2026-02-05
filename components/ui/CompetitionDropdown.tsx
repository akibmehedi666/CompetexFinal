"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown, X, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface CompetitionDropdownProps {
    competitions: string[];
    selected: string;
    onSelect: (competition: string) => void;
    counts?: Record<string, number>;
    label?: string;
}

export function CompetitionDropdown({
    competitions,
    selected,
    onSelect,
    counts = {},
    label = "Competition:"
}: CompetitionDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const filteredCompetitions = competitions.filter(comp =>
        comp.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Click outside to close
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchQuery("");
            }
        }

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            setTimeout(() => searchInputRef.current?.focus(), 100);
        }

        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    const handleSelect = (comp: string) => {
        onSelect(comp);
        setIsOpen(false);
        setSearchQuery("");
    };

    return (
        <div ref={dropdownRef} className="relative">
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "group flex items-center gap-3 px-5 py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all",
                    "bg-black/40 backdrop-blur-xl border",
                    isOpen
                        ? "border-accent1/50 shadow-[0_0_20px_rgba(0,229,255,0.2)]"
                        : "border-white/10 hover:border-white/20"
                )}
            >
                <div className="flex items-center gap-2">
                    <Trophy className={cn("w-4 h-4 transition-colors", isOpen ? "text-accent1" : "text-gray-500")} />
                    <span className="text-gray-400 text-xs hidden sm:inline">{label}</span>
                </div>
                <span className="text-white max-w-[150px] truncate">{selected}</span>
                {counts[selected] !== undefined && (
                    <span className="text-xs text-gray-500">({counts[selected]})</span>
                )}
                <ChevronDown
                    className={cn(
                        "w-4 h-4 text-gray-500 transition-transform flex-shrink-0",
                        isOpen && "rotate-180"
                    )}
                />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 mt-2 w-80 z-50 pt-2"
                    >
                        <div className="bg-[#0F0F0F] backdrop-blur-3xl border border-white/10 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.8)] overflow-hidden">
                            {/* Search Input */}
                            <div className="p-4 border-b border-white/5">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        placeholder="Search competitions..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-10 text-white text-sm placeholder:text-gray-500 focus:border-accent1/50 focus:outline-none focus:ring-2 focus:ring-accent1/20 transition-all"
                                    />
                                    {searchQuery && (
                                        <button
                                            onClick={() => setSearchQuery("")}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Scrollable List */}
                            <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                                {filteredCompetitions.length > 0 ? (
                                    <div className="p-2">
                                        {filteredCompetitions.map((comp) => (
                                            <button
                                                key={comp}
                                                onClick={() => handleSelect(comp)}
                                                className={cn(
                                                    "w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-all group",
                                                    selected === comp
                                                        ? "bg-accent1/10 border border-accent1/50"
                                                        : "bg-transparent border border-transparent hover:bg-white/5"
                                                )}
                                            >
                                                <span
                                                    className={cn(
                                                        "font-semibold text-sm truncate pr-2",
                                                        selected === comp
                                                            ? "text-accent1"
                                                            : "text-gray-300 group-hover:text-white"
                                                    )}
                                                >
                                                    {comp}
                                                </span>
                                                {counts[comp] !== undefined && (
                                                    <span
                                                        className={cn(
                                                            "text-xs px-2 py-0.5 rounded-full flex-shrink-0",
                                                            selected === comp
                                                                ? "bg-accent1/20 text-accent1 font-bold"
                                                                : "bg-white/5 text-gray-500"
                                                        )}
                                                    >
                                                        {counts[comp]}
                                                    </span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center text-gray-500 text-sm">
                                        No competitions found
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
