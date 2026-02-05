"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { useStore } from "@/store/useStore";

export function Hero() {
    const { currentUser } = useStore();
    return (
        <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-4 pt-16">
            {/* Background Ambience */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[20%] left-[20%] w-[30vw] h-[30vw] bg-accent1/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[20%] right-[20%] w-[25vw] h-[25vw] bg-accent2/10 rounded-full blur-[100px] animate-pulse delay-700" />
            </div>

            <div className="z-10 text-center max-w-5xl mx-auto space-y-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm"
                >
                    <span className="w-2 h-2 rounded-full bg-accent2 animate-pulse" />
                    <span className="text-xs font-medium uppercase tracking-wider text-gray-300">
                        The Future of Competition
                    </span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                    className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter text-white"
                >
                    Co<span className="opacity-50">m</span>pete<span className="text-accent1">X</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto"
                >
                    Centralizing national events into one ecosystem.
                    <br className="hidden md:block" />
                    The playground for <span className="text-white font-semibold">Visionaries</span>, <span className="text-white font-semibold">Hackers</span>, and <span className="text-white font-semibold">Leaders</span>.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8"
                >
                    <button
                        onClick={() => window.location.href = '/events'}
                        className="group relative px-8 py-4 bg-accent1 text-black font-bold uppercase tracking-widest text-sm overflow-hidden rounded-sm transition-all hover:shadow-[0_0_40px_rgba(0,229,255,0.4)]"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            Explore Events <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </span>
                    </button>
                    <button
                        onClick={() => window.location.href = '/signup'}
                        className="px-8 py-4 border border-white/20 text-white font-bold uppercase tracking-widest text-sm hover:bg-white/5 rounded-sm transition-all"
                    >
                        {currentUser ? "Go to Dashboard" : "Sign Up Now"}
                    </button>
                </motion.div>
            </div>
        </section>
    );
}
