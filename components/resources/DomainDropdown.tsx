"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DomainDropdownProps {
    domains: string[];
    selected: string;
    onSelect: (domain: string) => void;
    resourceCounts: Record<string, number>;
}

export function DomainDropdown({ domains, selected, onSelect, resourceCounts }: DomainDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const filteredDomains = domains.filter(domain =>
        domain.toLowerCase().includes(searchQuery.toLowerCase())
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
            // Focus search input when opened
            setTimeout(() => searchInputRef.current?.focus(), 100);
        }

        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    // Keyboard navigation
    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if (!isOpen) return;

            if (event.key === "Escape") {
                setIsOpen(false);
                setSearchQuery("");
            }
        }

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen]);

    const handleSelect = (domain: string) => {
        onSelect(domain);
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
                    "bg-black/60 backdrop-blur-xl border",
                    isOpen
                        ? "border-[#AAFF00]/50 shadow-[0_0_20px_rgba(170,255,0,0.2)]"
                        : "border-white/10 hover:border-white/20"
                )}
            >
                <span className="text-gray-400 text-xs">Competition Domain:</span>
                <span className="text-white">{selected}</span>
                <span className="text-xs text-gray-500">({resourceCounts[selected] || 0})</span>
                <ChevronDown
                    className={cn(
                        "w-4 h-4 text-gray-500 transition-transform",
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
                        className="absolute top-full left-0 mt-2 w-80 z-50"
                    >
                        <div className="bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden">
                            {/* Search Input */}
                            <div className="p-4 border-b border-white/5">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        placeholder="Search domains..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-10 text-white text-sm placeholder:text-gray-500 focus:border-[#AAFF00]/50 focus:outline-none focus:ring-2 focus:ring-[#AAFF00]/20 transition-all"
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
                                {filteredDomains.length > 0 ? (
                                    <div className="p-2">
                                        {filteredDomains.map((domain) => (
                                            <button
                                                key={domain}
                                                onClick={() => handleSelect(domain)}
                                                className={cn(
                                                    "w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-all group",
                                                    selected === domain
                                                        ? "bg-[#AAFF00]/10 border border-[#AAFF00]/50 shadow-[0_0_15px_rgba(170,255,0,0.2)]"
                                                        : "bg-transparent border border-transparent hover:bg-white/5 hover:border-[#AAFF00]/20"
                                                )}
                                            >
                                                <span
                                                    className={cn(
                                                        "font-semibold text-sm",
                                                        selected === domain
                                                            ? "text-[#AAFF00]"
                                                            : "text-white group-hover:text-[#AAFF00]/80"
                                                    )}
                                                >
                                                    {domain}
                                                </span>
                                                <span
                                                    className={cn(
                                                        "text-xs px-2 py-1 rounded-full",
                                                        selected === domain
                                                            ? "bg-[#AAFF00]/20 text-[#AAFF00] font-bold"
                                                            : "bg-white/5 text-gray-500"
                                                    )}
                                                >
                                                    {resourceCounts[domain] || 0}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center text-gray-500 text-sm">
                                        No domains found
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
