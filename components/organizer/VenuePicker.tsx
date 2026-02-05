"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, ZoomIn, ZoomOut, Maximize } from "lucide-react";
import { cn } from "@/lib/utils";

// Simplified version of VenueMap with click-to-pick functionality
// In a real app, this would reuse the same canvas logic or library

interface VenuePickerProps {
    value: { x: number, y: number } | null;
    onChange: (coords: { x: number, y: number }) => void;
}

export function VenuePicker({ value, onChange }: VenuePickerProps) {
    const [scale, setScale] = useState(1);
    const containerRef = useRef<HTMLDivElement>(null);

    // Mock map dimensions (assuming generic layout)
    const MAP_WIDTH = 800;
    const MAP_HEIGHT = 600;

    const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / scale; // Adjust for scale if needed, but usually offset is enough relative to container
        const y = (e.clientY - rect.top) / scale;

        // Normalize to the internal map resolution if needed
        // For this mock, we just use relative percentage or pixels within container
        // Let's use simple relative coordinates for now

        onChange({ x, y });
    };

    return (
        <div className="border border-white/10 rounded-xl overflow-hidden bg-[#111] relative group">
            <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                <button onClick={() => setScale(s => Math.min(s + 0.2, 2))} className="p-2 bg-black/60 rounded-lg hover:bg-white/10 text-white"><ZoomIn className="w-4 h-4" /></button>
                <button onClick={() => setScale(s => Math.max(s - 0.2, 0.5))} className="p-2 bg-black/60 rounded-lg hover:bg-white/10 text-white"><ZoomOut className="w-4 h-4" /></button>
            </div>

            <div
                className="overflow-hidden relative h-[400px] cursor-crosshair"
                ref={containerRef}
                onClick={handleMapClick}
            >
                <motion.div
                    animate={{ scale }}
                    className="w-full h-full origin-top-left relative"
                >
                    {/* Mock Map Background - Using a dark grid/tech pattern */}
                    <div className="absolute inset-0 bg-[#050505] opacity-50"
                        style={{
                            backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)',
                            backgroundSize: '20px 20px'
                        }}
                    />

                    {/* Specific Venue Shapes (Simplified Mock) */}
                    <div className="absolute top-[100px] left-[100px] w-[200px] h-[150px] border-2 border-white/10 rounded-lg bg-white/5 flex items-center justify-center text-xs text-gray-500">
                        Main Hall
                    </div>
                    <div className="absolute top-[100px] left-[350px] w-[150px] h-[150px] border-2 border-white/10 rounded-lg bg-white/5 flex items-center justify-center text-xs text-gray-500">
                        Workshops
                    </div>

                    {/* Selected Pin */}
                    {value && (
                        <div
                            className="absolute -translate-x-1/2 -translate-y-full"
                            style={{ left: value.x, top: value.y }}
                        >
                            <MapPin className="w-8 h-8 text-accent1 drop-shadow-[0_0_10px_rgba(0,229,255,0.8)] fill-accent1/20" />
                        </div>
                    )}
                </motion.div>
            </div>

            <div className="p-3 bg-white/5 border-t border-white/10 text-xs text-gray-400 flex justify-between">
                <span>Click on the map to set the event location.</span>
                {value && <span>Selected: {Math.round(value.x)}, {Math.round(value.y)}</span>}
            </div>
        </div>
    );
}
