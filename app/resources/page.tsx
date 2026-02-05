"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/ui/Navbar";
import { ResourceUploadModal } from "@/components/resources/ResourceUploadModal";
import { DomainDropdown } from "@/components/resources/DomainDropdown";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Download, FileText, Image as ImageIcon, Archive, Plus, User, Clock, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ENDPOINTS } from "@/lib/api_config";
import { useStore } from "@/store/useStore";

interface Resource {
    id: string;
    name: string;
    domain: string;      // Primary: "Olympiad", "Competitive Programming", etc.
    subject: string;     // Secondary: "Math", "Algorithms", etc.
    description: string;
    fileUrl: string;
    fileType: string;
    fileName: string;
    fileSize: string;
    uploaderName: string;
    date: string;
    downloads: number;
    category?: string;
}

const COMPETITION_DOMAINS = {
    "All": [],
    "Olympiad": ["All", "Math", "Physics", "Biology", "Chemistry", "Informatics"],
    "Competitive Programming": ["All", "Algorithms", "Data Structures", "Problem Solving", "Practice Platforms"],
    "Robotics": ["All", "Hardware", "Programming", "Design", "Electronics"],
    "Hackathons": ["All", "Project Ideas", "Team Building", "Pitching", "Tech Stacks"],
    "Design": ["All", "UI/UX", "Graphic Design", "Product Design"],
    "Debate": ["All", "Techniques", "Research", "Case Studies"],
    "CTF": ["All", "Web Security", "Cryptography", "Forensics", "Reverse Engineering"]
};

const DUMMY_RESOURCES: Resource[] = [
    // Olympiad - Math
    {
        id: "r1",
        name: "IMO Problem Solving Techniques",
        domain: "Olympiad",
        subject: "Math",
        description: "Comprehensive guide to solving International Mathematical Olympiad problems with proven strategies and practice sets.",
        fileUrl: "#",
        fileType: "application/pdf",
        fileName: "imo_techniques.pdf",
        fileSize: "4.2 MB",
        uploaderName: "Math Olympiad Team",
        date: "Jan 10, 2026",
        downloads: 342
    },
    {
        id: "r2",
        name: "Number Theory Fundamentals",
        domain: "Olympiad",
        subject: "Math",
        description: "Complete course on number theory covering divisibility, modular arithmetic, and Diophantine equations.",
        fileUrl: "#",
        fileType: "application/pdf",
        fileName: "number_theory.pdf",
        fileSize: "3.8 MB",
        uploaderName: "Dr. Ahmed",
        date: "Jan 8, 2026",
        downloads: 256
    },
    // Olympiad - Physics
    {
        id: "r3",
        name: "IPhO Mechanics Guide",
        domain: "Olympiad",
        subject: "Physics",
        description: "Advanced mechanics problems and solutions from past International Physics Olympiads.",
        fileUrl: "#",
        fileType: "application/pdf",
        fileName: "ipho_mechanics.pdf",
        fileSize: "5.1 MB",
        uploaderName: "Physics Academy",
        date: "Jan 5, 2026",
        downloads: 198
    },
    {
        id: "r4",
        name: "Electromagnetism Problem Set",
        domain: "Olympiad",
        subject: "Physics",
        description: "Challenging problems on electricity and magnetism with detailed step-by-step solutions.",
        fileUrl: "#",
        fileType: "application/pdf",
        fileName: "em_problems.pdf",
        fileSize: "2.9 MB",
        uploaderName: "Prof. Rahman",
        date: "Jan 3, 2026",
        downloads: 167
    },
    // Olympiad - Biology
    {
        id: "r5",
        name: "IBO Cell Biology Notes",
        domain: "Olympiad",
        subject: "Biology",
        description: "Comprehensive notes on cell structure, function, and molecular biology for Biology Olympiad prep.",
        fileUrl: "#",
        fileType: "application/pdf",
        fileName: "cell_biology.pdf",
        fileSize: "6.3 MB",
        uploaderName: "BioMasters",
        date: "Dec 30, 2025",
        downloads: 234
    },
    // Competitive Programming
    {
        id: "r6",
        name: "Dynamic Programming Patterns",
        domain: "Competitive Programming",
        subject: "Algorithms",
        description: "Master DP with 50+ patterns and problems from Codeforces, AtCoder, and LeetCode.",
        fileUrl: "#",
        fileType: "application/pdf",
        fileName: "dp_patterns.pdf",
        fileSize: "3.2 MB",
        uploaderName: "CP Champions",
        date: "Jan 12, 2026",
        downloads: 523
    },
    {
        id: "r7",
        name: "Graph Algorithms Cheatsheet",
        domain: "Competitive Programming",
        subject: "Algorithms",
        description: "Quick reference for BFS, DFS, Dijkstra, Floyd-Warshall, and advanced graph techniques.",
        fileUrl: "#",
        fileType: "application/pdf",
        fileName: "graph_algos.pdf",
        fileSize: "1.8 MB",
        uploaderName: "AlgoExpert",
        date: "Jan 9, 2026",
        downloads: 612
    },
    {
        id: "r8",
        name: "Advanced Data Structures Guide",
        domain: "Competitive Programming",
        subject: "Data Structures",
        description: "Segment trees, Fenwick trees, Trie, and other advanced structures with implementation.",
        fileUrl: "#",
        fileType: "application/zip",
        fileName: "advanced_ds.zip",
        fileSize: "4.5 MB",
        uploaderName: "CodeNinjas",
        date: "Jan 7, 2026",
        downloads: 445
    },
    {
        id: "r9",
        name: "Codeforces Practice Roadmap",
        domain: "Competitive Programming",
        subject: "Practice Platforms",
        description: "Structured 6-month practice plan to reach Expert rating on Codeforces.",
        fileUrl: "#",
        fileType: "application/pdf",
        fileName: "cf_roadmap.pdf",
        fileSize: "1.2 MB",
        uploaderName: "Red Coder",
        date: "Jan 4, 2026",
        downloads: 389
    },
    // Robotics
    {
        id: "r10",
        name: "Arduino Robotics Starter Kit",
        domain: "Robotics",
        subject: "Hardware",
        description: "Complete guide to building your first robot with Arduino, sensors, and motors.",
        fileUrl: "#",
        fileType: "application/zip",
        fileName: "arduino_kit.zip",
        fileSize: "8.7 MB",
        uploaderName: "RoboTech",
        date: "Jan 11, 2026",
        downloads: 278
    },
    {
        id: "r11",
        name: "ROS2 Programming Tutorial",
        domain: "Robotics",
        subject: "Programming",
        description: "Learn Robot Operating System 2 for autonomous navigation and perception.",
        fileUrl: "#",
        fileType: "application/pdf",
        fileName: "ros2_tutorial.pdf",
        fileSize: "5.9 MB",
        uploaderName: "AutoBot Labs",
        date: "Jan 6, 2026",
        downloads: 156
    },
    // Hackathons
    {
        id: "r12",
        name: "Hackathon Project Ideas 2026",
        domain: "Hackathons",
        subject: "Project Ideas",
        description: "50+ innovative project ideas across AI, blockchain, IoT, and social impact.",
        fileUrl: "#",
        fileType: "application/pdf",
        fileName: "project_ideas.pdf",
        fileSize: "2.3 MB",
        uploaderName: "HackMasters",
        date: "Jan 13, 2026",
        downloads: 501
    },
    {
        id: "r13",
        name: "Pitch Deck Masterclass",
        domain: "Hackathons",
        subject: "Pitching",
        description: "Winning pitch deck templates and presentation techniques from top hackathon winners.",
        fileUrl: "#",
        fileType: "application/zip",
        fileName: "pitch_deck.zip",
        fileSize: "12.4 MB",
        uploaderName: "StartupHub",
        date: "Jan 2, 2026",
        downloads: 367
    },
    {
        id: "r14",
        name: "Team Formation Guide",
        domain: "Hackathons",
        subject: "Team Building",
        description: "How to find the perfect team members and build chemistry for 48-hour sprints.",
        fileUrl: "#",
        fileType: "application/pdf",
        fileName: "team_guide.pdf",
        fileSize: "1.9 MB",
        uploaderName: "HackPros",
        date: "Dec 28, 2025",
        downloads: 223
    },
    // Design
    {
        id: "r15",
        name: "UI/UX Design System 2026",
        domain: "Design",
        subject: "UI/UX",
        description: "Modern design system with components, color theory, and typography best practices.",
        fileUrl: "#",
        fileType: "application/zip",
        fileName: "design_system.zip",
        fileSize: "15.2 MB",
        uploaderName: "DesignStudio",
        date: "Jan 14, 2026",
        downloads: 445
    },
    {
        id: "r18",
        name: "Figma Prototyping Masterclass",
        domain: "Design",
        subject: "UI/UX",
        description: "Learn advanced prototyping techniques in Figma for interactive design presentations.",
        fileUrl: "#",
        fileType: "application/pdf",
        fileName: "figma_prototyping.pdf",
        fileSize: "7.8 MB",
        uploaderName: "UX Guild",
        date: "Jan 11, 2026",
        downloads: 298
    },
    {
        id: "r19",
        name: "Logo Design Competition Guide",
        domain: "Design",
        subject: "Graphic Design",
        description: "Tips and techniques for winning logo design competitions with case studies.",
        fileUrl: "#",
        fileType: "application/pdf",
        fileName: "logo_design.pdf",
        fileSize: "4.1 MB",
        uploaderName: "GraphicsPro",
        date: "Jan 8, 2026",
        downloads: 167
    },
    {
        id: "r20",
        name: "Product Design Portfolio Template",
        domain: "Design",
        subject: "Product Design",
        description: "Professional portfolio template for showcasing product design work to competitions.",
        fileUrl: "#",
        fileType: "application/zip",
        fileName: "portfolio_template.zip",
        fileSize: "22.5 MB",
        uploaderName: "DesignHub",
        date: "Dec 29, 2025",
        downloads: 312
    },
    // CTF
    {
        id: "r16",
        name: "Web Exploitation Techniques",
        domain: "CTF",
        subject: "Web Security",
        description: "SQL injection, XSS, CSRF, and other web vulnerabilities with practice challenges.",
        fileUrl: "#",
        fileType: "application/pdf",
        fileName: "web_exploit.pdf",
        fileSize: "3.6 MB",
        uploaderName: "CyberSec Team",
        date: "Jan 1, 2026",
        downloads: 312
    },
    {
        id: "r17",
        name: "Cryptography Challenge Pack",
        domain: "CTF",
        subject: "Cryptography",
        description: "Classical and modern cryptography challenges from picoCTF and HackTheBox.",
        fileUrl: "#",
        fileType: "application/zip",
        fileName: "crypto_challenges.zip",
        fileSize: "2.1 MB",
        uploaderName: "CryptoMasters",
        date: "Dec 25, 2025",
        downloads: 189
    },
    {
        id: "r21",
        name: "Digital Forensics Toolkit",
        domain: "CTF",
        subject: "Forensics",
        description: "Tools and techniques for analyzing disk images, memory dumps, and network captures.",
        fileUrl: "#",
        fileType: "application/zip",
        fileName: "forensics_toolkit.zip",
        fileSize: "18.9 MB",
        uploaderName: "ForensicLab",
        date: "Jan 9, 2026",
        downloads: 234
    },
    {
        id: "r22",
        name: "Reverse Engineering Basics",
        domain: "CTF",
        subject: "Reverse Engineering",
        description: "Introduction to reverse engineering binaries with Ghidra and IDA Pro tutorials.",
        fileUrl: "#",
        fileType: "application/pdf",
        fileName: "reverse_eng.pdf",
        fileSize: "6.2 MB",
        uploaderName: "RevEng Masters",
        date: "Jan 6, 2026",
        downloads: 278
    },
    // Debate
    {
        id: "r23",
        name: "Parliamentary Debate Handbook",
        domain: "Debate",
        subject: "Techniques",
        description: "Master parliamentary debate format with argument structures and rebuttal strategies.",
        fileUrl: "#",
        fileType: "application/pdf",
        fileName: "parliamentary_debate.pdf",
        fileSize: "3.4 MB",
        uploaderName: "Debate Society",
        date: "Jan 12, 2026",
        downloads: 156
    },
    {
        id: "r24",
        name: "Persuasive Speaking Techniques",
        domain: "Debate",
        subject: "Techniques",
        description: "Learn rhetorical devices, body language, and vocal techniques for powerful speeches.",
        fileUrl: "#",
        fileType: "application/pdf",
        fileName: "persuasive_speaking.pdf",
        fileSize: "2.7 MB",
        uploaderName: "Orators Guild",
        date: "Jan 7, 2026",
        downloads: 201
    },
    {
        id: "r25",
        name: "Policy Debate Research Guide",
        domain: "Debate",
        subject: "Research",
        description: "How to conduct effective research for policy debates with source evaluation tips.",
        fileUrl: "#",
        fileType: "application/pdf",
        fileName: "debate_research.pdf",
        fileSize: "4.8 MB",
        uploaderName: "Research Team",
        date: "Jan 4, 2026",
        downloads: 178
    },
    {
        id: "r26",
        name: "Mock Trial Case Studies",
        domain: "Debate",
        subject: "Case Studies",
        description: "Analysis of winning mock trial performances with legal argumentation strategies.",
        fileUrl: "#",
        fileType: "application/pdf",
        fileName: "mock_trial_cases.pdf",
        fileSize: "5.5 MB",
        uploaderName: "Legal Eagles",
        date: "Dec 31, 2025",
        downloads: 145
    },
    // More Olympiad
    {
        id: "r27",
        name: "Chemistry Olympiad Lab Techniques",
        domain: "Olympiad",
        subject: "Chemistry",
        description: "Essential laboratory techniques and safety protocols for chemistry competitions.",
        fileUrl: "#",
        fileType: "application/pdf",
        fileName: "chem_lab_techniques.pdf",
        fileSize: "4.9 MB",
        uploaderName: "Chem Lab",
        date: "Jan 13, 2026",
        downloads: 189
    },
    {
        id: "r28",
        name: "IOI Training Problems",
        domain: "Olympiad",
        subject: "Informatics",
        description: "Practice problems from International Olympiad in Informatics with solutions.",
        fileUrl: "#",
        fileType: "application/zip",
        fileName: "ioi_problems.zip",
        fileSize: "3.1 MB",
        uploaderName: "IOI Team",
        date: "Jan 10, 2026",
        downloads: 267
    },
    // More Robotics
    {
        id: "r29",
        name: "CAD Design for Robotics",
        domain: "Robotics",
        subject: "Design",
        description: "Learn Fusion 360 and SolidWorks for designing competition-ready robot parts.",
        fileUrl: "#",
        fileType: "application/pdf",
        fileName: "cad_design.pdf",
        fileSize: "11.2 MB",
        uploaderName: "CAD Masters",
        date: "Jan 8, 2026",
        downloads: 134
    },
    {
        id: "r30",
        name: "Circuits and Sensors Guide",
        domain: "Robotics",
        subject: "Electronics",
        description: "Complete guide to sensors, motors, and circuit design for autonomous robots.",
        fileUrl: "#",
        fileType: "application/pdf",
        fileName: "circuits_sensors.pdf",
        fileSize: "6.7 MB",
        uploaderName: "ElectroBot",
        date: "Jan 5, 2026",
        downloads: 198
    },
    // More Hackathons
    {
        id: "r31",
        name: "MERN Stack Quick Start",
        domain: "Hackathons",
        subject: "Tech Stacks",
        description: "Build full-stack apps fast with MongoDB, Express, React, and Node.js.",
        fileUrl: "#",
        fileType: "application/pdf",
        fileName: "mern_stack.pdf",
        fileSize: "5.3 MB",
        uploaderName: "FullStack Dev",
        date: "Jan 11, 2026",
        downloads: 412
    },
    {
        id: "r32",
        name: "Firebase Integration Guide",
        domain: "Hackathons",
        subject: "Tech Stacks",
        description: "Add authentication, database, and hosting to your hackathon project with Firebase.",
        fileUrl: "#",
        fileType: "application/pdf",
        fileName: "firebase_guide.pdf",
        fileSize: "3.8 MB",
        uploaderName: "CloudExperts",
        date: "Jan 9, 2026",
        downloads: 356
    },
    // More Competitive Programming
    {
        id: "r33",
        name: "Interview Problem Patterns",
        domain: "Competitive Programming",
        subject: "Problem Solving",
        description: "Common patterns in coding interviews and competitive programming contests.",
        fileUrl: "#",
        fileType: "application/pdf",
        fileName: "interview_patterns.pdf",
        fileSize: "2.9 MB",
        uploaderName: "TechInterview",
        date: "Jan 12, 2026",
        downloads: 489
    }
];

export default function ResourcesPage() {
    const { currentUser, initAuth } = useStore();
    const [resources, setResources] = useState<Resource[]>([]);
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [selectedDomain, setSelectedDomain] = useState("All");
    const [selectedSubject, setSelectedSubject] = useState("All");
    const [loading, setLoading] = useState(true);

    const formatBytes = (bytes: number) => {
        if (!bytes || bytes <= 0) return "0 B";
        const units = ["B", "KB", "MB", "GB"];
        const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
        const value = bytes / Math.pow(1024, i);
        return `${value.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
    };

    useEffect(() => {
        initAuth();
    }, [initAuth]);

    useEffect(() => {
        const loadResources = async () => {
            setLoading(true);
            try {
                const res = await fetch(ENDPOINTS.GET_RESOURCES("free"));
                const data = await res.json().catch(() => null);
                const rows = data?.status === "success" && Array.isArray(data.data) ? data.data : [];
                setResources(
                    rows.map((r: any) => ({
                        id: String(r.id),
                        name: String(r.name || ""),
                        domain: String(r.domain || ""),
                        subject: String(r.subject || ""),
                        description: String(r.description || ""),
                        fileUrl: ENDPOINTS.DOWNLOAD_RESOURCE(String(r.id)),
                        fileType: String(r.fileType || "application/octet-stream"),
                        fileName: String(r.fileName || "resource"),
                        fileSize: formatBytes(Number(r.fileSizeBytes || 0)),
                        uploaderName: String(r.uploaderName || "Unknown"),
                        date: String(r.date || ""),
                        downloads: Number(r.downloads || 0),
                        category: r.category ?? undefined,
                    }))
                );
            } catch (e) {
                console.error("Failed to load resources", e);
                setResources([]);
            } finally {
                setLoading(false);
            }
        };
        loadResources();
    }, []);

    const handleUploaded = (newResource: any) => {
        if (!newResource?.id) return;
        const r: Resource = {
            id: String(newResource.id),
            name: String(newResource.name || ""),
            domain: String(newResource.domain || ""),
            subject: String(newResource.subject || ""),
            description: String(newResource.description || ""),
            fileUrl: ENDPOINTS.DOWNLOAD_RESOURCE(String(newResource.id)),
            fileType: String(newResource.fileType || "application/octet-stream"),
            fileName: String(newResource.fileName || "resource"),
            fileSize: formatBytes(Number(newResource.fileSizeBytes || 0)),
            uploaderName: String(newResource.uploaderName || "You"),
            date: String(newResource.date || ""),
            downloads: Number(newResource.downloads || 0),
            category: newResource.category ?? undefined,
        };
        setResources((prev) => [r, ...prev]);
        setIsUploadOpen(false);
    };

    const handleDownload = (resource: Resource) => {
        // Create a link and trigger download
        const link = document.createElement("a");
        link.href = ENDPOINTS.DOWNLOAD_RESOURCE(resource.id);
        link.download = resource.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getIcon = (type: string) => {
        if (type.includes("pdf")) return <FileText className="w-5 h-5 text-red-400" />;
        if (type.includes("zip") || type.includes("compressed")) return <Archive className="w-5 h-5 text-yellow-400" />;
        if (type.includes("image")) return <ImageIcon className="w-5 h-5 text-blue-400" />;
        return <FileText className="w-5 h-5 text-gray-400" />;
    };

    const filteredResources = resources.filter(r => {
        const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase()) ||
            r.domain.toLowerCase().includes(search.toLowerCase()) ||
            r.subject.toLowerCase().includes(search.toLowerCase()) ||
            r.description.toLowerCase().includes(search.toLowerCase());
        const matchesDomain = selectedDomain === "All" || r.domain === selectedDomain;
        const matchesSubject = selectedSubject === "All" || r.subject === selectedSubject;
        return matchesSearch && matchesDomain && matchesSubject;
    });

    const allDomains = (() => {
        const set = new Set<string>(Object.keys(COMPETITION_DOMAINS));
        resources.forEach((r) => {
            if (r.domain) set.add(r.domain);
        });
        const list = Array.from(set);
        list.sort((a, b) => {
            if (a === "All") return -1;
            if (b === "All") return 1;
            return a.localeCompare(b);
        });
        return list;
    })();

    // Get current subjects based on selected domain (DB-driven, with static fallback)
    const currentSubjects = (() => {
        if (selectedDomain === "All") return [];
        const set = new Set<string>();
        const fallback = COMPETITION_DOMAINS[selectedDomain as keyof typeof COMPETITION_DOMAINS] || [];
        fallback.forEach((s) => set.add(s));
        resources
            .filter((r) => r.domain === selectedDomain)
            .forEach((r) => {
                if (r.subject) set.add(r.subject);
            });
        const list = Array.from(set);
        list.sort((a, b) => {
            if (a === "All") return -1;
            if (b === "All") return 1;
            return a.localeCompare(b);
        });
        return list;
    })();

    // Reset subject filter when domain changes
    useEffect(() => {
        setSelectedSubject("All");
    }, [selectedDomain]);

    return (
        <div className="min-h-screen bg-black selection:bg-accent1/30">
            <Navbar />

            <ResourceUploadModal
                isOpen={isUploadOpen}
                onClose={() => setIsUploadOpen(false)}
                onUploaded={handleUploaded}
                uploaderId={currentUser?.id}
                domains={allDomains}
            />

            <div className="pt-24 pb-12 max-w-7xl mx-auto px-6">

                {/* Header */}
                <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Community <span className="text-accent2">Resources</span></h1>
                        <p className="text-gray-400 max-w-xl">
                            Share and discover tools, guides, and assets to level up your game.
                        </p>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <input
                                type="text"
                                placeholder="Search resources..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-full py-3 pl-10 pr-4 text-white text-sm focus:border-accent2 focus:outline-none transition-colors"
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        </div>
                        <button
                            onClick={() => setIsUploadOpen(true)}
                            className="flex items-center gap-2 px-6 py-3 bg-accent1 text-black font-bold rounded-full hover:bg-white transition-all shadow-[0_0_20px_rgba(0,229,255,0.3)]"
                        >
                            <Plus className="w-5 h-5" /> Share Resource
                        </button>
                    </div>
                </div>

                {/* Domain Selection Dropdown */}
                <div className="mb-6">
                    <DomainDropdown
                        domains={allDomains}
                        selected={selectedDomain}
                        onSelect={setSelectedDomain}
                        resourceCounts={allDomains.reduce((acc, domain) => {
                            acc[domain] = domain === "All" ? resources.length : resources.filter(r => r.domain === domain).length;
                            return acc;
                        }, {} as Record<string, number>)}
                    />
                </div>

                {/* Subject Pills (only show when a specific domain is selected) */}
                <AnimatePresence>
                    {selectedDomain !== "All" && currentSubjects.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-8 overflow-hidden"
                        >
                            <div className="flex items-center gap-2 mb-3">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">Subject</h3>
                                <ChevronRight className="w-4 h-4 text-gray-600" />
                            </div>
                            <div className="overflow-x-auto scrollbar-hide">
                                <div className="flex gap-2 min-w-max pb-2">
                                    {currentSubjects.map((subject) => (
                                        <button
                                            key={subject}
                                            onClick={() => setSelectedSubject(subject)}
                                            className={cn(
                                                "px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap",
                                                selectedSubject === subject
                                                    ? "bg-accent1 text-black shadow-[0_0_15px_rgba(0,229,255,0.4)]"
                                                    : "bg-white/5 text-gray-500 border border-white/5 hover:bg-white/10 hover:text-gray-300"
                                            )}
                                        >
                                            {subject}
                                            {subject !== "All" && (
                                                <span className="ml-1 text-xs opacity-70">
                                                    ({resources.filter(r => r.domain === selectedDomain && r.subject === subject).length})
                                                </span>
                                            )}
                                            {subject === "All" && (
                                                <span className="ml-1 text-xs opacity-70">
                                                    ({resources.filter(r => r.domain === selectedDomain).length})
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence mode="popLayout">
                        {filteredResources.map((resource) => (
                            <motion.div
                                key={resource.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="group relative bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-accent2/30 transition-all hover:bg-white/10 flex flex-col"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-white/20 transition-colors">
                                        {getIcon(resource.fileType)}
                                    </div>
                                    <div className="flex flex-col gap-1 items-end">
                                        <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-accent2/10 text-accent2 rounded-md border border-accent2/20">
                                            {resource.domain}
                                        </span>
                                        <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-accent1/10 text-accent1 rounded-md border border-accent1/20">
                                            {resource.subject}
                                        </span>
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-white mb-2 line-clamp-1" title={resource.name}>{resource.name}</h3>
                                <p className="text-sm text-gray-400 mb-6 line-clamp-2 min-h-[40px]">{resource.description}</p>

                                <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <User className="w-3 h-3" /> {resource.uploaderName}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <Clock className="w-3 h-3" /> {resource.date}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleDownload(resource)}
                                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-bold uppercase tracking-wider border border-white/10 hover:border-accent2/50 transition-all"
                                    >
                                        <Download className="w-4 h-4" /> Download
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {loading && (
                    <div className="text-center py-24 border border-dashed border-white/10 rounded-3xl">
                        <h3 className="text-white font-bold text-lg mb-2">Loading resources...</h3>
                        <p className="text-gray-500">Fetching latest community uploads.</p>
                    </div>
                )}

                {!loading && filteredResources.length === 0 && (
                    <div className="text-center py-24 border border-dashed border-white/10 rounded-3xl">
                        <FolderOpen className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-white font-bold text-lg mb-2">No resources found</h3>
                        <p className="text-gray-500">Try adjusting your search or upload a new resource.</p>
                    </div>
                )}

            </div>
        </div >
    );
}

// Icon for empty state
function FolderOpen({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="m6 14 1.45-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.55 6a2 2 0 0 1-1.94 1.5H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H18a2 2 0 0 1 2 2v2" />
        </svg>
    )
}
