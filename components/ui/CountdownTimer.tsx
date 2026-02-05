"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CountdownTimerProps {
    targetDate?: string | null;
    status?: string | null;
    className?: string;
    size?: "sm" | "lg";
}

export function CountdownTimer({ targetDate, status, className, size = "sm" }: CountdownTimerProps) {
    const [timeLeft, setTimeLeft] = useState<{
        days: number;
        hours: number;
        minutes: number;
        seconds: number;
        mode: "countdown" | "live" | "ended" | "tbd";
    } | null>(null);

    useEffect(() => {
        const calculateTime = () => {
            const normalizedStatus = String(status || "").toLowerCase();
            if (normalizedStatus === "live") {
                return { days: 0, hours: 0, minutes: 0, seconds: 0, mode: "live" as const };
            }
            if (normalizedStatus === "completed" || normalizedStatus === "ended") {
                return { days: 0, hours: 0, minutes: 0, seconds: 0, mode: "ended" as const };
            }

            if (!targetDate) {
                return { days: 0, hours: 0, minutes: 0, seconds: 0, mode: "tbd" as const };
            }

            const difference = new Date(targetDate).getTime() - new Date().getTime();

            if (isNaN(difference)) {
                return { days: 0, hours: 0, minutes: 0, seconds: 0, mode: "tbd" as const };
            }

            if (difference <= 0) {
                return { days: 0, hours: 0, minutes: 0, seconds: 0, mode: "ended" as const };
            }

            return {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
                mode: "countdown" as const,
            };
        };

        // Initial calculation
        setTimeLeft(calculateTime());

        const timer = setInterval(() => {
            setTimeLeft(calculateTime());
        }, 1000);

        return () => clearInterval(timer);
    }, [targetDate, status]);

    if (!timeLeft) return <div className={cn("animate-pulse text-gray-500", className)}>Loading...</div>;

    if (timeLeft.mode === "tbd") {
        return (
            <div className={cn(
                "font-mono font-bold text-gray-400",
                size === "lg" ? "text-2xl" : "text-xs",
                className
            )}>
                TBA
            </div>
        );
    }

    if (timeLeft.mode === "live") {
        return (
            <div className={cn(
                "font-mono font-bold text-accent2 animate-pulse drop-shadow-[0_0_8px_rgba(173,255,0,0.8)]",
                size === "lg" ? "text-4xl" : "text-xs",
                className
            )}>
                EVENT LIVE
            </div>
        );
    }

    if (timeLeft.mode === "ended") {
        return (
            <div className={cn(
                "font-mono font-bold text-gray-400",
                size === "lg" ? "text-2xl" : "text-xs",
                className
            )}>
                EVENT ENDED
            </div>
        );
    }

    const isUrgent = timeLeft.days === 0 && timeLeft.hours < 24;

    return (
        <div
            className={cn(
                "font-mono tabular-nums tracking-widest text-accent1/90",
                size === "lg" ? "text-4xl" : "text-xs",
                isUrgent && "animate-pulse text-accent2", // Pulse if < 24h
                className
            )}
        >
            {String(timeLeft.days).padStart(2, '0')}d : {String(timeLeft.hours).padStart(2, '0')}h : {String(timeLeft.minutes).padStart(2, '0')}m : {String(timeLeft.seconds).padStart(2, '0')}s
        </div>
    );
}
