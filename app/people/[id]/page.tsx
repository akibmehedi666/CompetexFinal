"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/ui/Navbar";
import { toast } from "sonner";
import { ArrowLeft, ExternalLink, Github, Globe, Linkedin } from "lucide-react";

export default function PublicProfilePage() {
    const params = useParams();
    const router = useRouter();
    const userId = useMemo(() => String((params as any)?.id || ""), [params]);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            if (!userId) return;
            setLoading(true);
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost/Competex/api";
                const res = await fetch(`${apiUrl}/get_profile.php?user_id=${encodeURIComponent(userId)}`);
                const data = await res.json();
                if (data?.status === "success") {
                    setUser(data.user);
                } else {
                    setUser(null);
                }
            } catch (e) {
                console.error(e);
                toast.error("Failed to load profile");
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [userId]);

    const skills: string[] = Array.isArray(user?.skills) ? user.skills : [];

    return (
        <div className="min-h-screen bg-black text-white pt-24 pb-20 px-6">
            <Navbar />
            <div className="max-w-4xl mx-auto space-y-6">
                <button
                    onClick={() => router.push("/people")}
                    className="inline-flex items-center gap-2 text-sm text-gray-300 hover:text-white"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Community
                </button>

                {loading ? (
                    <div className="text-center py-24 text-gray-500">Loading profile...</div>
                ) : !user ? (
                    <div className="text-center py-24 text-gray-500">Profile not found.</div>
                ) : (
                    <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6">
                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="flex flex-col items-center md:items-start gap-3">
                                <img
                                    src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name || user.email || user.id)}`}
                                    alt={user.name || "User"}
                                    className="w-24 h-24 rounded-2xl border border-white/10 bg-black/40 object-cover"
                                />
                                <div className="text-center md:text-left">
                                    <h1 className="text-2xl font-bold text-white">{user.name || "User"}</h1>
                                    <div className="text-sm text-gray-400">{user.role || ""}</div>
                                    <div className="text-sm text-gray-400">{user.university || user.location || ""}</div>
                                </div>
                            </div>

                            <div className="flex-1 space-y-5">
                                {user.bio && (
                                    <div>
                                        <h2 className="text-lg font-bold text-white mb-2">About</h2>
                                        <div className="text-gray-300 whitespace-pre-wrap">{user.bio}</div>
                                    </div>
                                )}

                                {skills.length > 0 && (
                                    <div>
                                        <h2 className="text-lg font-bold text-white mb-2">Skills</h2>
                                        <div className="flex flex-wrap gap-2">
                                            {skills.map((s) => (
                                                <span key={s} className="px-2 py-1 bg-white/5 rounded text-xs text-gray-300 border border-white/10">
                                                    {s}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="flex flex-wrap gap-3">
                                    {user.github && (
                                        <a href={user.github} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-gray-300 hover:text-white underline">
                                            <Github className="w-4 h-4" /> GitHub <ExternalLink className="w-3 h-3" />
                                        </a>
                                    )}
                                    {user.linkedin && (
                                        <a href={user.linkedin} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-gray-300 hover:text-white underline">
                                            <Linkedin className="w-4 h-4" /> LinkedIn <ExternalLink className="w-3 h-3" />
                                        </a>
                                    )}
                                    {user.portfolio && (
                                        <a href={user.portfolio} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-gray-300 hover:text-white underline">
                                            <Globe className="w-4 h-4" /> Portfolio <ExternalLink className="w-3 h-3" />
                                        </a>
                                    )}
                                </div>

                                <div className="pt-2">
                                    <Link href="/messages" className="inline-flex items-center gap-2 px-5 py-3 bg-white text-black font-bold uppercase tracking-wider rounded-xl hover:bg-accent1 transition-colors">
                                        Message
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
