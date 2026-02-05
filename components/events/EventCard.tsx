"use client";

import { motion, useMotionTemplate, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { Users, Calendar, Mail, Phone } from "lucide-react";
import { toast } from "sonner";
import { useRef, useState } from "react";
import { Event } from "@/types";
import { cn } from "@/lib/utils";
import { CountdownTimer } from "@/components/ui/CountdownTimer";

interface EventCardProps {
    event: Event;
    className?: string;
}

export function EventCard({ event, className }: EventCardProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [showContact, setShowContact] = useState(false);

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseX = useSpring(x, { stiffness: 500, damping: 100 });
    const mouseY = useSpring(y, { stiffness: 500, damping: 100 });

    function onMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
        const { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    const maskImage = useMotionTemplate`radial-gradient(240px at ${mouseX}px ${mouseY}px, white, transparent)`;
    const style = { maskImage, WebkitMaskImage: maskImage };

    return (
        <div
            onMouseMove={onMouseMove}
            onMouseLeave={() => setShowContact(false)}
            className={cn(
                "group relative h-full w-full rounded-xl bg-white/5 border border-white/10 overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,229,255,0.15)] hover:border-accent1/50 hover:-translate-y-1",
                className
            )}
        >
            {/* Glow Follower */}
            <div className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100">
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-accent1/20 to-accent2/20 opacity-20"
                    style={style}
                />
            </div>

            <div className="p-6 h-full flex flex-col relative z-20">
                {/* Status Badge & Timer */}
                <div className="flex justify-between items-start mb-4">
                    <span className={cn(
                        "px-2 py-1 text-[10px] uppercase font-bold tracking-widest rounded-sm border",
                        event.mode === "Online" ? "border-accent1 text-accent1" : "border-accent2 text-accent2"
                    )}>
                        {event.mode}
                    </span>
                    <CountdownTimer targetDate={event.startDate} status={event.status} />
                </div>

                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-accent1 transition-colors">
                    {event.title}
                </h3>

                <p className="text-sm text-gray-400 mb-6 flex-grow">
                    Organized by <span className="text-gray-300">{event.organizer}</span>
                </p>

                {/* Contact Organizer Action */}
                <div className="mb-4 relative">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (event.organizerEmail || event.organizerPhone) {
                                setShowContact(!showContact);
                            } else {
                                toast.error("No contact info available");
                            }
                        }}
                        className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border",
                            (event.organizerEmail || event.organizerPhone)
                                ? "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white hover:border-white/20"
                                : "bg-transparent border-transparent text-gray-600 cursor-not-allowed"
                        )}
                        disabled={!event.organizerEmail && !event.organizerPhone}
                    >
                        <Mail className="w-3 h-3" />
                        Contact Organizer
                    </button>

                    <AnimatePresence>
                        {showContact && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                className="absolute bottom-full left-0 mb-2 w-64 bg-[#111] border border-white/20 rounded-xl p-4 shadow-2xl z-50 backdrop-blur-xl"
                            >
                                <div className="text-xs text-gray-400 mb-3 uppercase tracking-wider font-bold">Contact Details</div>
                                <div className="space-y-2">
                                    {event.organizerEmail && (
                                        <div
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                window.location.href = `mailto:${event.organizerEmail}`;
                                            }}
                                            className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg transition-colors group/item cursor-pointer"
                                        >
                                            <div className="w-6 h-6 rounded-full bg-accent1/20 flex items-center justify-center text-accent1 shrink-0">
                                                <Mail className="w-3 h-3" />
                                            </div>
                                            <span className="text-xs text-gray-300 group-hover/item:text-white truncate">{event.organizerEmail}</span>
                                        </div>
                                    )}
                                    {event.organizerPhone && (
                                        <div
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                window.location.href = `tel:${event.organizerPhone}`;
                                            }}
                                            className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg transition-colors group/item cursor-pointer"
                                        >
                                            <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 shrink-0">
                                                <Phone className="w-3 h-3" />
                                            </div>
                                            <span className="text-xs text-gray-300 group-hover/item:text-white truncate">{event.organizerPhone}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="absolute -bottom-2 left-4 w-4 h-4 bg-[#111] border-b border-r border-white/20 transform rotate-45" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 border-t border-white/5 pt-4">
                    <div className="flex items-center gap-1 text-accent1">
                        <Calendar className="w-3 h-3" />
                        <span>{event.date || (event.startDate ? new Date(event.startDate).toLocaleDateString() : "TBA")}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>{event.participantsCount} registered</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
