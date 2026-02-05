"use client";

import { useState, useEffect } from "react";
import { Save, Upload, Building2, Globe, Linkedin, MapPin, Briefcase } from "lucide-react";
import { User } from "@/types";

interface RecruiterProfileEditorProps {
    user: User;
}

export function RecruiterProfileEditor({ user }: RecruiterProfileEditorProps) {
    const [profile, setProfile] = useState({
        id: user.id,
        name: user.name || "",
        website: "",
        email: user.email || "",
        location: "",
        companyName: "",
        position: "",
        department: "",
        linkedin: "",
        avatar: user.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Recruiter"
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user?.id) {
            fetch(`http://localhost/Competex/api/get_profile.php?user_id=${user.id}`)
                .then(res => res.json())
                .then(data => {
                    if (data.status === 'success') {
                        const u = data.user;
                        setProfile(prev => ({
                            ...prev,
                            name: u.name || prev.name,
                            website: u.recruiter_website || u.website || u.portfolio || "",
                            email: u.email || "",
                            location: u.recruiter_location || u.location || "",
                            companyName: u.recruiter_company || u.company_name || "",
                            position: u.recruiter_position || u.position || "",
                            department: u.recruiter_department || u.department || "",
                            linkedin: u.recruiter_linkedin || u.linkedin || "",
                            avatar: u.avatar || prev.avatar
                        }));
                    }
                })
                .catch(err => console.error("Failed to fetch profile", err));
        }
    }, [user.id]);

    const handleSave = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost/Competex/api/update_profile.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: user.id,
                    name: profile.name,
                    website: profile.website,
                    email: profile.email,
                    location: profile.location,
                    companyName: profile.companyName,
                    position: profile.position,
                    department: profile.department,
                    linkedin: profile.linkedin,
                })
            });
            const data = await res.json();
            if (data.status === 'success') {
                const u = data.user;
                // Update local storage to keep session fresh
                const stored = localStorage.getItem("competex_user_session");
                if (stored) {
                    const session = JSON.parse(stored);
                    const updatedSession = { ...session, ...u };
                    localStorage.setItem("competex_user_session", JSON.stringify(updatedSession));
                }
                alert("Profile saved successfully!");
            } else {
                alert("Failed to save: " + data.message);
            }
        } catch (error) {
            console.error("Error saving profile:", error);
            alert("Error saving profile");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white">Profile Settings</h2>
                    <p className="text-gray-400">Manage your recruiter profile and company details.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-500 transition-colors disabled:opacity-50"
                >
                    <Save className="w-4 h-4" />
                    {loading ? "Saving..." : "Save Changes"}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Avatar & Basic Info */}
                <div className="space-y-6">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <h3 className="font-bold text-white mb-4">Profile Picture</h3>
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-32 h-32 bg-black/40 rounded-full border border-white/10 p-1">
                                <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                            </div>
                            <button className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors text-sm font-medium">
                                <Upload className="w-4 h-4" /> Upload New Photo
                            </button>
                        </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
                        <h3 className="font-bold text-white mb-2">Contact Information</h3>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
                            <input
                                type="text"
                                value={profile.name}
                                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-purple-500 outline-none transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
                            <input
                                type="email"
                                value={profile.email}
                                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-purple-500 outline-none transition-colors"
                                readOnly
                                title="Email cannot be changed directly"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Location</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                                <input
                                    type="text"
                                    value={profile.location}
                                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:border-purple-500 outline-none transition-colors"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Professional Details */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
                        <h3 className="font-bold text-white mb-2">Professional Details</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Company Name</label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                                    <input
                                        type="text"
                                        value={profile.companyName}
                                        onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:border-purple-500 outline-none transition-colors"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Position / Role</label>
                                <div className="relative">
                                    <Briefcase className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                                    <input
                                        type="text"
                                        value={profile.position}
                                        onChange={(e) => setProfile({ ...profile, position: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:border-purple-500 outline-none transition-colors"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Department</label>
                            <input
                                type="text"
                                value={profile.department}
                                onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                                placeholder="e.g. Engineering, HR, Talent Acquisition"
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-purple-500 outline-none transition-colors"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Website</label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                                    <input
                                        type="text"
                                        value={profile.website}
                                        onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:border-purple-500 outline-none transition-colors"
                                        placeholder="https://company.com"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">LinkedIn Profile</label>
                                <div className="relative">
                                    <Linkedin className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                                    <input
                                        type="text"
                                        value={profile.linkedin}
                                        onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:border-purple-500 outline-none transition-colors"
                                        placeholder="https://linkedin.com/in/..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
