"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/store/useStore";
import {
    Bell, Menu, X, ChevronDown,
    Map, Calendar, BookOpen,
    Trophy, Users, Star,
    MessageSquare, Briefcase, Handshake,
    User, LayoutDashboard, Building2, LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NotificationsDropdown } from "@/components/ui/NotificationsDropdown";

const NAV_ITEMS = {
    Common: [
        {
            label: "Explore",
            items: [
                { label: "Event Hub", icon: Calendar, href: "/events" },
                { label: "Venue Map", icon: Map, href: "/map" },
                { label: "Institutions", icon: Building2, href: "/institutions" },
            ]
        },
        {
            label: "Careers",
            items: [
                { label: "Job Board", icon: Briefcase, href: "/jobs" },
                { label: "Find Mentors", icon: Users, href: "/mentors" },
            ]
        }
    ],
    Participant: [
        {
            label: "Compete",
            items: [
                { label: "Leaderboard", icon: Trophy, href: "/leaderboard" },
                { label: "Team Builder", icon: Users, href: "/teams" },
                { label: "Rating System", icon: Star, href: "/rating" },
            ]
        },
        {
            label: "Network",
            items: [
                { label: "Community", icon: Users, href: "/people" },
                { label: "Messaging", icon: MessageSquare, href: "/messages" },
            ]
        },
        {
            label: "Resources",
            items: [
                { label: "Free Resources", icon: BookOpen, href: "/resources" },
                { label: "Paid Resources", icon: Star, href: "/resources/paid" },
            ]
        }
    ],
    Organizer: [
        {
            label: "Compete",
            items: [
                { label: "Leaderboard", icon: Trophy, href: "/leaderboard" },
            ]
        },
        {
            label: "Network",
            items: [
                { label: "Community", icon: Users, href: "/people" },
                { label: "Messaging", icon: MessageSquare, href: "/messages" },
                { label: "Sponsorships", icon: Handshake, href: "/dashboard" },
            ]
        },
        {
            label: "Portals",
            items: [
                { label: "Organizer Dashboard", icon: LayoutDashboard, href: "/organizer/dashboard" },
            ]
        }
    ],
    Sponsor: [
        {
            label: "Compete",
            items: [
                { label: "Leaderboard", icon: Trophy, href: "/leaderboard" },
            ]
        },
        {
            label: "Network",
            items: [
                { label: "Community", icon: Users, href: "/people" },
                { label: "Sponsorships", icon: Handshake, href: "/sponsorship" },
            ]
        }
    ],
    Recruiter: [
        {
            label: "Compete",
            items: [
                { label: "Leaderboard", icon: Trophy, href: "/leaderboard" },
            ]
        },
        {
            label: "Network",
            items: [
                { label: "Messaging", icon: MessageSquare, href: "/messages" },
                { label: "Community", icon: Users, href: "/people" },
                { label: "Recruitment", icon: Briefcase, href: "/recruitment" },
            ]
        }
    ],
    Mentor: [
        {
            label: "Network",
            items: [
                { label: "Community", icon: Users, href: "/people" },
                { label: "Messaging", icon: MessageSquare, href: "/messages" },
            ]
        }
    ]
};

export function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const { currentUser, logout, initAuth } = useStore();
    const [notificationOpen, setNotificationOpen] = useState(false);

    useEffect(() => {
        initAuth();
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [initAuth]);

    const role = currentUser?.role || "Participant";
    const navItems = [
        ...NAV_ITEMS.Common,
        ...(NAV_ITEMS[role as keyof typeof NAV_ITEMS] || NAV_ITEMS.Participant)
    ];

    return (
        <>
            <nav
                className={cn(
                    "fixed top-0 left-0 right-0 z-50 h-20 transition-all duration-300 border-b border-transparent",
                    scrolled ? "bg-black/80 backdrop-blur-xl border-white/5" : "bg-transparent"
                )}
            >
                <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="text-2xl font-bold tracking-tighter text-white group">
                        Compete<span className="text-accent1 group-hover:text-accent2 transition-colors">X</span>
                    </Link>

                    <div className="hidden md:flex items-center gap-8">
                        {navItems.map((group) => (
                            <div
                                key={group.label}
                                className="relative group"
                                onMouseEnter={() => setActiveDropdown(group.label)}
                                onMouseLeave={() => setActiveDropdown(null)}
                            >
                                <button className="flex items-center gap-1 text-sm font-medium text-gray-300 hover:text-white transition-colors py-8">
                                    {group.label}
                                    <ChevronDown className={cn("w-4 h-4 transition-transform duration-300", activeDropdown === group.label ? "rotate-180" : "")} />
                                </button>

                                <AnimatePresence>
                                    {activeDropdown === group.label && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                            className="absolute top-[80%] -left-4 w-64 bg-black/90 backdrop-blur-xl border border-accent1/30 rounded-lg p-2 shadow-[0_0_30px_rgba(0,229,255,0.1)] overflow-hidden"
                                        >
                                            {group.items.map((item) => (
                                                <Link
                                                    key={item.label}
                                                    href={item.href}
                                                    className="flex items-center gap-3 p-3 rounded-md text-sm text-gray-400 hover:text-white hover:bg-white/5 hover:border-l-2 hover:border-accent2 transition-all group/item"
                                                >
                                                    <item.icon className="w-4 h-4 text-accent1 group-hover/item:text-accent2 transition-colors" />
                                                    {item.label}
                                                </Link>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>

                    {/* Action Core */}
                    <div className="hidden md:flex items-center gap-6">
                        {/* Notification Bell */}
                        {currentUser && (
                            <div className="relative">
                                <button
                                    onClick={() => setNotificationOpen(!notificationOpen)}
                                    className="relative group p-2 rounded-full hover:bg-white/5 transition-colors"
                                >
                                    <Bell className="w-5 h-5 text-gray-400 group-hover:text-accent2 transition-colors" />
                                    <span className="absolute top-2 right-2 w-2 h-2 bg-accent1 rounded-full animate-pulse shadow-[0_0_10px_#00E5FF]" />
                                </button>

                                <AnimatePresence>
                                    {notificationOpen && (
                                        <NotificationsDropdown onClose={() => setNotificationOpen(false)} />
                                    )}
                                </AnimatePresence>
                            </div>
                        )}

                        <div className="h-6 w-px bg-white/10" />

                        {currentUser ? (
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <button
                                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                                        className="flex items-center gap-2"
                                    >
                                        <div className={`w-8 h-8 rounded-full bg-accent1/20 border border-accent1/50 overflow-hidden transition-all ${userMenuOpen ? 'ring-2 ring-accent1' : ''}`}>
                                            <img src={currentUser.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=User"} alt="User" className="w-full h-full object-cover" />
                                        </div>
                                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {/* User Dropdown */}
                                    <AnimatePresence>
                                        {userMenuOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                className="absolute top-full right-0 mt-2 w-48 bg-black/90 border border-white/10 rounded-lg p-2 shadow-xl z-50"
                                            >
                                                <Link
                                                    href="/profile"
                                                    onClick={() => setUserMenuOpen(false)}
                                                    className="flex items-center gap-2 p-2 hover:bg-white/5 rounded text-sm text-gray-300 hover:text-white"
                                                >
                                                    <User className="w-4 h-4" /> Profile
                                                </Link>
                                                {(currentUser.role === 'Organizer' || currentUser.role === 'Sponsor' || currentUser.role === 'Recruiter' || currentUser.role === 'Mentor') && (
                                                    <Link
                                                        href={currentUser.role === 'Organizer' ? '/organizer/dashboard' : currentUser.role === 'Sponsor' ? '/sponsorship' : currentUser.role === 'Recruiter' ? '/recruitment' : '/mentor/dashboard'}
                                                        onClick={() => setUserMenuOpen(false)}
                                                        className="flex items-center gap-2 p-2 hover:bg-white/5 rounded text-sm text-gray-300 hover:text-white"
                                                    >
                                                        <LayoutDashboard className="w-4 h-4" /> Dashboard
                                                    </Link>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <button
                                    onClick={logout}
                                    title="Logout"
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all"
                                >
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <>
                                <button
                                    onClick={() => window.location.href = '/login'}
                                    className="h-10 px-5 flex items-center justify-center text-sm font-bold uppercase tracking-wider text-accent1 hover:text-white transition-colors"
                                >
                                    Login
                                </button>

                                <button
                                    onClick={() => window.location.href = '/signup'}
                                    className="h-10 px-6 flex items-center justify-center text-xs font-bold uppercase tracking-widest bg-accent1 text-black rounded-sm shadow-[0_0_20px_rgba(0,229,255,0.4)] hover:shadow-[0_0_30px_rgba(0,229,255,0.6)] hover:bg-white hover:scale-105 transition-all">
                                    Sign Up
                                </button>
                            </>
                        )}
                    </div>

                    {/* Mobile Toggle */}
                    <button onClick={() => setMobileOpen(true)} className="md:hidden p-2 text-white">
                        <Menu className="w-6 h-6" />
                    </button>
                </div>
            </nav>

            {/* Mobile Overlay */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-2xl flex flex-col p-6 overflow-y-auto"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <span className="text-2xl font-bold text-white">Compete<span className="text-accent1">X</span></span>
                            <button onClick={() => setMobileOpen(false)} className="p-2 text-gray-400 hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex-grow space-y-8">
                            {navItems.map((group) => (
                                <div key={group.label} className="space-y-4">
                                    <h4 className="text-accent1 text-xs font-bold uppercase tracking-widest border-b border-accent1/20 pb-2">
                                        {group.label}
                                    </h4>
                                    <div className="grid grid-cols-1 gap-2">
                                        {group.items.map((item) => (
                                            <Link
                                                key={item.label}
                                                href={item.href}
                                                onClick={() => setMobileOpen(false)}
                                                className="flex items-center gap-4 p-3 rounded-lg text-lg font-medium text-gray-300 hover:text-white hover:bg-white/5 border-l-2 border-transparent hover:border-accent2 transition-all"
                                            >
                                                <item.icon className="w-5 h-5 text-gray-500" />
                                                {item.label}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col gap-4 mt-8 pt-8 border-t border-white/10">
                            {currentUser ? (
                                <button
                                    onClick={logout}
                                    className="w-full py-4 border border-red-500/50 text-red-500 font-bold uppercase tracking-widest rounded-lg"
                                >
                                    Logout
                                </button>
                            ) : (
                                <button
                                    onClick={() => window.location.href = '/signup'}
                                    className="w-full py-4 bg-accent1 text-black font-bold uppercase tracking-widest rounded-lg shadow-[0_0_20px_rgba(0,229,255,0.4)]"
                                >
                                    Sign Up
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
