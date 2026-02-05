"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useStore } from "@/store/useStore";
import { EventCard } from "@/components/events/EventCard";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

const FILTERS = ["All", "Offline", "Online", "Hackathon", "AI/ML"];

export function BentoGrid() {
    const { filteredEvents, setFilter, fetchEvents } = useStore();
    const [activeFilter, setActiveLocal] = useState("All"); // Local state for UI active class

    useEffect(() => {
        fetchEvents();
    }, []);

    const handleFilter = (filter: string) => {
        setActiveLocal(filter);
        setFilter(filter);
    };

    return (
        <section id="events" className="py-20 px-6 md:px-12 max-w-[1400px] mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                <div>
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-2">
                        Explore <span className="text-accent1">Events</span>
                    </h2>
                    <p className="text-gray-400">Curated competitions for the elite.</p>
                </div>

                <div className="flex flex-wrap gap-2">
                    {FILTERS.map((filter) => (
                        <button
                            key={filter}
                            onClick={() => handleFilter(filter)}
                            className={cn(
                                "px-4 py-2 text-sm font-medium rounded-sm border transition-all duration-300",
                                activeFilter === filter
                                    ? "bg-accent1 text-black border-accent1 shadow-[0_0_15px_rgba(0,229,255,0.3)]"
                                    : "bg-white/5 text-gray-400 border-white/10 hover:border-white/30 hover:text-white"
                            )}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </div>

            <motion.div
                layout
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 auto-rows-[350px] gap-6"
            >
                <AnimatePresence>
                    {filteredEvents.map((event, index) => (
                        <motion.div
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.3 }}
                            key={event.id}
                            className={cn(
                                "rounded-xl block h-full",
                                // Dynamic spanning logic for "Bento" feel - simplified for 4-col
                                // First item spans 2 cols, others 1
                                index === 0 ? "lg:col-span-2 lg:row-span-1" : "lg:col-span-1"
                            )}
                        >
                            <Link href={`/events/${event.id}`} className="block h-full">
                                <EventCard event={event} />
                            </Link>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>
        </section>
    );
}
