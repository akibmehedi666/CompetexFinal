"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { motion } from "framer-motion";

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-colors group"
            aria-label="Toggle theme"
        >
            <div className="relative w-5 h-5">
                <motion.div
                    initial={false}
                    animate={{
                        rotate: theme === "dark" ? 0 : 90,
                        scale: theme === "dark" ? 1 : 0,
                        opacity: theme === "dark" ? 1 : 0,
                    }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 flex items-center justify-center"
                >
                    <Moon className="w-5 h-5 text-gray-400 group-hover:text-accent2 transition-colors" />
                </motion.div>

                <motion.div
                    initial={false}
                    animate={{
                        rotate: theme === "light" ? 0 : -90,
                        scale: theme === "light" ? 1 : 0,
                        opacity: theme === "light" ? 1 : 0,
                    }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 flex items-center justify-center"
                >
                    <Sun className="w-5 h-5 text-gray-600 group-hover:text-orange-500 transition-colors" />
                </motion.div>
            </div>

            {/* Glow effect for dark mode */}
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full opacity-0 dark:group-hover:opacity-100 bg-accent1 blur-md transition-opacity" />
        </button>
    );
}
