"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Building2, Mail, MapPin, Globe, Award, Star, TrendingUp, Calendar, Edit2, Save, Users, Plus, Code, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/lib/api_config";

// Extended type for Organizer stats (mocked for now)
interface OrganizerStats {
    reputationScore: number;
    totalEvents: number;
    avgRating: number;
    responseTime: string;
}

const MOCK_STATS: OrganizerStats = {
    reputationScore: 98,
    totalEvents: 15,
    avgRating: 4.8,
    responseTime: "< 2 hours"
};

export function OrganizerProfile() {
    // In a real app, we'd fetch the current user and their specific organizer profile
    // For now, we'll mock the state
    const [profile, setProfile] = useState<any>({
        name: "",
        university: "", // Maps to institution
        department: "",
        bio: "",
        email: "",
        location: "",
        portfolio: "",  // Maps to website
        verified: false,
        avatar: ""
    });

    const [isEditing, setIsEditing] = useState(false);
    const [hostedEvents, setHostedEvents] = useState<any[]>([]);
    const [hostedLoading, setHostedLoading] = useState(false);

    useEffect(() => {
        // Load user from local storage
        const stored = localStorage.getItem("competex_user_session");
        if (stored) {
            try {
                const user = JSON.parse(stored);
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || API_BASE_URL;
                fetch(`${apiUrl}/get_profile.php?user_id=${encodeURIComponent(user.id)}`)
                    .then(res => res.json())
                    .then(data => {
                        if (data.status === 'success') {
                            setProfile({ ...user, ...data.user });
                        }
                    });
            } catch (e) {
                console.error("Error parsing user:", e);
            }
        }
    }, []);

    useEffect(() => {
        const loadHostedEvents = async () => {
            if (!profile?.id) return;
            setHostedLoading(true);
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || API_BASE_URL;
                const res = await fetch(`${apiUrl}/get_organizer_events_with_requests.php?organizer_id=${encodeURIComponent(profile.id)}`);
                const data = await res.json();
                if (data?.status === "success" && Array.isArray(data.data)) {
                    setHostedEvents(data.data);
                } else {
                    setHostedEvents([]);
                }
            } catch (e) {
                console.error("Failed to fetch organizer events", e);
                setHostedEvents([]);
            } finally {
                setHostedLoading(false);
            }
        };

        loadHostedEvents();
    }, [profile?.id]);

    const handleSave = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || API_BASE_URL;
            const res = await fetch(`${apiUrl}/update_profile.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: profile.id,
                    university: profile.university,
                    department: profile.department,
                    bio: profile.bio,
                    location: profile.location,
                    portfolio: profile.portfolio
                })
            });
            const data = await res.json();

            if (data.status === 'success') {
                const updated = { ...profile, ...data.user };
                setProfile(updated);
                localStorage.setItem("competex_user_session", JSON.stringify(updated));
                setIsEditing(false);
            }
        } catch (error) {
            console.error("Failed to save profile", error);
        }
    };

    const totalEvents = hostedEvents.length;
    const avgRating = (() => {
        const totalReviews = hostedEvents.reduce((acc: number, e: any) => acc + (Number(e.rating_count) || 0), 0);
        if (totalReviews <= 0) return 0;
        const weighted = hostedEvents.reduce((acc: number, e: any) => acc + (Number(e.avg_rating) || 0) * (Number(e.rating_count) || 0), 0);
        return Math.round((weighted / totalReviews) * 10) / 10;
    })();
    const stats: OrganizerStats = { ...MOCK_STATS, totalEvents, avgRating };

    return (
        <div className="space-y-8">
            {/* Header Section */}
            {/* Header Section */}
            <div className="bg-white/5 border border-white/10 rounded-2xl relative overflow-hidden group/header">

                {/* Banner Image */}
                <div className="h-48 w-full bg-gradient-to-r from-gray-900 to-black relative">
                    {profile.banner ? (
                        <img src={profile.banner} alt="Banner" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-700">
                            <Building2 className="w-12 h-12 opacity-20" />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

                    {/* Banner Edit Button */}
                    {isEditing && (
                        <div className="absolute top-4 right-4 z-20">
                            <label className="cursor-pointer px-4 py-2 bg-black/60 backdrop-blur-md border border-white/10 rounded-lg text-xs font-bold uppercase text-white hover:bg-accent1 hover:text-black transition-colors flex items-center gap-2">
                                <Edit2 className="w-3 h-3" /> Change Banner
                                <input
                                    type="text"
                                    className="hidden"
                                    onChange={(e) => {
                                        // Mock: In real app, this would be file upload. 
                                        // Here we just prompt or assume a URL for simplicity? 
                                        // Let's toggle a prompt or just set a random one for demo if input isn't easy.
                                        const url = prompt("Enter banner URL:", "https://images.unsplash.com/photo-1540575339264-569259387a45?auto=format&fit=crop&w=1000&q=80");
                                        if (url) setProfile({ ...profile, banner: url });
                                    }}
                                />
                            </label>
                        </div>
                    )}
                </div>

                <div className="px-8 pb-8 relative z-10 flex flex-col md:flex-row gap-8 items-start -mt-12">
                    {/* Profile Picture (Avatar) */}
                    <div className="relative group/avatar">
                        <div className="w-32 h-32 rounded-2xl bg-[#111] border-4 border-[#111] shadow-2xl flex items-center justify-center text-4xl overflow-hidden">
                            {profile.avatar ? <img src={profile.avatar} className="w-full h-full object-cover" /> : "🎓"}
                        </div>
                        {isEditing && (
                            <button
                                onClick={() => {
                                    const url = prompt("Enter avatar URL:", "https://api.dicebear.com/7.x/avataaars/svg?seed=NewAvatar");
                                    if (url) setProfile({ ...profile, avatar: url });
                                }}
                                className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity rounded-2xl cursor-pointer"
                            >
                                <Edit2 className="w-6 h-6 text-white" />
                            </button>
                        )}
                    </div>

                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                            <div>
                                <h2 className="text-3xl font-bold text-white flex items-center gap-2">
                                    {profile.name}
                                    {profile.verified && <Award className="w-6 h-6 text-accent1" />}
                                </h2>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={profile.university || ""}
                                        onChange={e => setProfile({ ...profile, university: e.target.value })}
                                        className="bg-black/40 border border-white/10 rounded px-2 py-1 text-accent1 font-medium w-full"
                                        placeholder="Institution Name"
                                    />
                                ) : (
                                    <p className="text-accent1 font-medium">{profile.university || "Institution Name"}</p>
                                )}
                            </div>
                            <button
                                onClick={isEditing ? handleSave : () => setIsEditing(true)}
                                className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                            >
                                {isEditing ? <Save className="w-5 h-5 text-accent1" /> : <Edit2 className="w-5 h-5" />}
                            </button>
                        </div>

                        {isEditing ? (
                            <textarea
                                value={profile.bio || ""}
                                onChange={(e) => setProfile((prev: any) => ({ ...prev, bio: e.target.value }))}
                                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-gray-300 focus:border-accent1 outline-none min-h-[80px] mb-4"
                                placeholder="Bio..."
                            />
                        ) : (
                            <p className="text-gray-400 max-w-2xl mb-6 leading-relaxed">
                                {profile.bio || "No bio added yet."}
                            </p>
                        )}

                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-black/30 rounded-lg border border-white/5">
                                <Building2 className="w-4 h-4" />
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={profile.department || ""}
                                        onChange={e => setProfile({ ...profile, department: e.target.value })}
                                        className="bg-transparent border-none outline-none text-gray-300 w-32"
                                        placeholder="Department"
                                    />
                                ) : (
                                    profile.department || "Department"
                                )}
                            </span>
                            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-black/30 rounded-lg border border-white/5">
                                <MapPin className="w-4 h-4" />
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={profile.location || ""}
                                        onChange={e => setProfile({ ...profile, location: e.target.value })}
                                        className="bg-transparent border-none outline-none text-gray-300 w-32"
                                        placeholder="Location"
                                    />
                                ) : (
                                    profile.location || "Location"
                                )}
                            </span>
                            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-black/30 rounded-lg border border-white/5">
                                <Mail className="w-4 h-4" /> {profile.email}
                            </span>
                            {(profile.portfolio || isEditing) && (
                                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-black/30 rounded-lg border border-white/5 hover:text-accent1 transition-colors">
                                    <Globe className="w-4 h-4" />
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={profile.portfolio || ""}
                                            onChange={e => setProfile({ ...profile, portfolio: e.target.value })}
                                            className="bg-transparent border-none outline-none text-gray-300 w-32"
                                            placeholder="Website URL"
                                        />
                                    ) : (
                                        <a href={profile.portfolio} target="_blank">Website</a>
                                    )}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatBox
                    icon={Star}
                    label="Reputation Score"
                    value={stats.reputationScore}
                    suffix="/100"
                    color="text-yellow-400"
                />
                <StatBox
                    icon={Calendar}
                    label="Events Hosted"
                    value={stats.totalEvents}
                    color="text-blue-400"
                />
                <StatBox
                    icon={TrendingUp}
                    label="Avg Rating"
                    value={stats.avgRating}
                    suffix="/5.0"
                    color="text-green-400"
                />
                <StatBox
                    icon={Award}
                    label="Response Time"
                    value={stats.responseTime}
                    color="text-purple-400"
                    isText
                />
            </div>

            {/* Institution Clubs & Departments */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Users className="w-5 h-5 text-accent1" /> Clubs & Departments
                    </h3>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white transition-colors">
                        <Plus className="w-4 h-4" /> Add Club
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Mock Club Cards */}
                    <div className="p-4 bg-black/40 border border-white/5 rounded-xl hover:border-accent1/30 transition-all cursor-pointer group">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                                <Code className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-white group-hover:text-accent1 transition-colors">Computer Club</h4>
                                <p className="text-xs text-gray-500">Founded 2012</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-400 mb-3">Organizes hackathons, coding contests, and tech workshops.</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1"><Users className="w-3 h-3" /> 120 Members</span>
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> 5 Events</span>
                        </div>
                    </div>

                    <div className="p-4 bg-black/40 border border-white/5 rounded-xl hover:border-accent1/30 transition-all cursor-pointer group">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                                <Cpu className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-white group-hover:text-accent1 transition-colors">Robotics Club</h4>
                                <p className="text-xs text-gray-500">Founded 2015</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-400 mb-3">Focuses on robotics, automation, and hardware projects.</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1"><Users className="w-3 h-3" /> 85 Members</span>
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> 3 Events</span>
                        </div>
                    </div>

                    <div className="p-4 bg-black/40 border border-white/5 rounded-xl hover:border-accent1/30 transition-all cursor-pointer group border-dashed hover:border-solid flex flex-col items-center justify-center text-center py-8">
                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <Plus className="w-6 h-6 text-gray-400" />
                        </div>
                        <h4 className="font-bold text-gray-400 group-hover:text-white transition-colors">Register New Entity</h4>
                        <p className="text-xs text-gray-600 mt-1">Add a club, lab, or department</p>
                    </div>
                </div>
            </div>

            {/* Past & Upcoming Events */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-accent1" /> Event History
                </h3>

                <div className="space-y-4">
                    {hostedLoading ? (
                        <p className="text-gray-500 text-center py-8">Loading events...</p>
                    ) : hostedEvents.length > 0 ? (
                        hostedEvents.map((event: any) => (
                            <div key={event.id} className="flex items-center justify-between p-4 bg-black/40 border border-white/5 rounded-xl hover:border-white/20 transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-white/5 overflow-hidden">
                                        {event.image ? (
                                            <img
                                                src={event.image}
                                                alt={event.title || "Event"}
                                                className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-white/10 via-black to-black" />
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white group-hover:text-accent1 transition-colors">{event.title}</h4>
                                        <p className="text-xs text-gray-500">
                                            {event.date} • {event.category} • <span className={cn(
                                                event.status === "Live" ? "text-green-400" :
                                                    event.status === "Upcoming" ? "text-blue-400" : "text-gray-500"
                                            )}>{event.status}</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-bold text-white font-mono">{event.participants_count ?? 0}</div>
                                    <div className="text-xs text-gray-500">Participants</div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 text-center py-8">No events found.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

function StatBox({ icon: Icon, label, value, suffix, color, isText }: any) {
    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-colors group">
            <div className="flex items-start justify-between mb-4">
                <div className={cn("p-2 rounded-lg bg-black/40", color)}>
                    <Icon className="w-5 h-5" />
                </div>
            </div>
            <div>
                <div className="flex items-baseline gap-1">
                    <span className={cn("text-2xl font-bold font-mono text-white", isText ? "text-lg" : "text-3xl")}>
                        {value}
                    </span>
                    {suffix && <span className="text-sm text-gray-500 font-medium">{suffix}</span>}
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-wide mt-1">{label}</div>
            </div>
        </div>
    );
}
