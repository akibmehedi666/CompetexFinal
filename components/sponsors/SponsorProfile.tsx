import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { SponsorProfile as ISponsorProfile } from "@/types";
import { Building2, Globe, Mail, MapPin, Award, Calendar, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { SponsorshipRequestModal } from "@/components/organizer/SponsorshipRequestModal";

// Mock Data for Development
export const MOCK_SPONSOR: ISponsorProfile = {
    id: "s1",
    userId: "u_sponsor1",
    companyName: "TechCorp Industries",
    logo: "https://api.dicebear.com/7.x/initials/svg?seed=TC&backgroundColor=00E5FF",
    industry: "Technology & Hardware",
    description: "Leading global provider of high-performance computing hardware and AI solutions. dedicated to empowering the next generation of innovators.",
    website: "https://techcorp.example.com",
    email: "sponsorships@techcorp.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    sponsorshipCategories: ["Hackathons", "Robotics", "AI Research", "Gaming"],
    pastSponsorships: [
        { eventId: "e1", eventName: "CyberHack 2024", year: "2024", category: "Hackathon", level: "Platinum" },
        { eventId: "e2", eventName: "RoboWars Nationals", year: "2023", category: "Robotics", level: "Gold" },
        { eventId: "e3", eventName: "CodeSprint", year: "2023", category: "Coding", level: "Silver" },
    ],
    preferences: {
        targetAudience: ["Developers", "Engineering Students", "Startups"],
        preferredEventTypes: ["Hackathons", "Technical Workshops"],
        minAudienceSize: 200
    },
    verified: true,
    sponsorshipRoles: [
        {
            id: "r1",
            sponsorId: "s1",
            title: "Title Sponsor",
            category: ["Hackathon", "Coding"],
            minEventLevel: "National",
            offerings: ["$10,000 Cash", "Cloud Credits", "Internship Opportunities"],
            benefits: ["Top Logo Placement", "Keynote Session", "Booth Space"],
            status: "Open",
            createdAt: "2025-01-01"
        },
        {
            id: "r2",
            sponsorId: "s1",
            title: "Beverage Partner",
            category: ["Hackathon", "Sports"],
            minEventLevel: "College",
            offerings: ["Energy Drinks", "Snacks"],
            benefits: ["Logo on Banners", "Stall"],
            status: "Open",
            createdAt: "2025-01-10"
        }
    ]
};

export function SponsorProfile({ profile = MOCK_SPONSOR }: { profile?: ISponsorProfile }) {
    const [selectedRole, setSelectedRole] = useState<any | null>(null);

    return (
        <div className="space-y-8">
            <AnimatePresence>
                {selectedRole && (
                    <SponsorshipRequestModal
                        role={selectedRole}
                        sponsorName={profile.companyName}
                        onClose={() => setSelectedRole(null)}
                        onSubmit={(data) => {
                            console.log("Request Submitted:", data);
                            // Handle submission logic here
                        }}
                    />
                )}
            </AnimatePresence>

            {/* Header / Hero Section */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent1/5 rounded-full blur-[80px]" />

                <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start">
                    <div className="w-24 h-24 rounded-xl bg-white/10 p-1 border border-white/20">
                        <img src={profile.logo} alt={profile.companyName} className="w-full h-full object-cover rounded-lg" />
                    </div>

                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <h1 className="text-3xl font-bold text-white tracking-tight">{profile.companyName}</h1>
                            {profile.verified && <CheckCircle className="w-6 h-6 text-accent1" />}
                        </div>

                        <div className="flex items-center gap-2 text-accent1 font-medium mb-4">
                            <Building2 className="w-4 h-4" />
                            <span>{profile.industry}</span>
                        </div>

                        <p className="text-gray-400 max-w-2xl leading-relaxed mb-6">
                            {profile.description}
                        </p>

                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-black/30 rounded-lg border border-white/5">
                                <MapPin className="w-4 h-4" /> {profile.location}
                            </span>
                            <a href={profile.website} target="_blank" className="flex items-center gap-1.5 px-3 py-1.5 bg-black/30 rounded-lg border border-white/5 hover:text-accent1 hover:border-accent1/30 transition-colors">
                                <Globe className="w-4 h-4" /> Website
                            </a>
                            <a href={`mailto:${profile.email}`} className="flex items-center gap-1.5 px-3 py-1.5 bg-black/30 rounded-lg border border-white/5 hover:text-accent1 hover:border-accent1/30 transition-colors">
                                <Mail className="w-4 h-4" /> Contact
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Available Roles Section */}
            {profile.sponsorshipRoles && profile.sponsorshipRoles.length > 0 && (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Award className="w-6 h-6 text-accent1" /> Available Sponsorship Roles
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {profile.sponsorshipRoles.map(role => (
                            <div key={role.id} className="bg-black/40 border border-white/5 rounded-xl p-6 hover:border-accent1/30 transition-colors group">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h4 className="text-lg font-bold text-white group-hover:text-accent1 transition-colors">{role.title}</h4>
                                        <div className="flex gap-2 text-xs mt-1">
                                            <span className="bg-white/10 text-gray-300 px-2 py-0.5 rounded border border-white/5">{role.minEventLevel}</span>
                                            {role.status === 'Open' ? (
                                                <span className="bg-green-500/10 text-green-400 px-2 py-0.5 rounded border border-green-500/20">Open</span>
                                            ) : (
                                                <span className="bg-red-500/10 text-red-400 px-2 py-0.5 rounded border border-red-500/20">Closed</span>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedRole(role)}
                                        className="px-3 py-1.5 bg-accent1/10 text-accent1 text-xs font-bold rounded-lg border border-accent1/20 hover:bg-accent1 hover:text-black transition-colors"
                                    >
                                        Request
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <p className="text-xs font-bold text-gray-500 uppercase mb-1">We Provide</p>
                                        <div className="flex flex-wrap gap-1">
                                            {role.offerings.map((item, i) => (
                                                <span key={i} className="text-xs text-gray-300 bg-white/5 px-2 py-0.5 rounded">{item}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-500 uppercase mb-1">We Expect</p>
                                        <p className="text-xs text-gray-400 leading-relaxed">
                                            {role.benefits.join(", ")}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column: Preferences & Categories */}
                <div className="space-y-6">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                            <Award className="w-5 h-5 text-accent1" /> Sponsorship Focus
                        </h3>
                        <div className="flex flex-wrap gap-2 mb-6">
                            {profile.sponsorshipCategories.map((cat: string) => (
                                <span key={cat} className="px-3 py-1 rounded-full bg-accent1/10 text-accent1 text-xs font-bold border border-accent1/20">
                                    {cat}
                                </span>
                            ))}
                        </div>

                        <h4 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">Target Audience</h4>
                        <div className="space-y-2">
                            {profile.preferences.targetAudience.map((target: string) => (
                                <div key={target} className="flex items-center gap-2 text-sm text-gray-300">
                                    <div className="w-1.5 h-1.5 rounded-full bg-accent1" />
                                    {target}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 rounded-xl p-6">
                        <h3 className="font-bold text-white mb-2">Interested in working with us?</h3>
                        <p className="text-sm text-gray-400 mb-4">We are actively looking for events in our preferred categories.</p>
                    </div>
                </div>

                {/* Right Column: Past Sponsorships */}
                <div className="md:col-span-2">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-accent1" /> Sponsorship History
                        </h3>

                        <div className="space-y-4">
                            {profile.pastSponsorships.map((event: any) => (
                                <div key={event.eventId} className="flex items-center justify-between p-4 bg-black/40 border border-white/5 rounded-lg hover:bg-black/60 transition-colors group">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center font-bold text-xl text-gray-500 group-hover:text-white transition-colors">
                                            {event.eventName.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white group-hover:text-accent1 transition-colors">{event.eventName}</h4>
                                            <div className="flex gap-2 text-xs text-gray-500 mt-1">
                                                <span>{event.year}</span>
                                                <span>•</span>
                                                <span>{event.category}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={cn(
                                        "px-3 py-1 rounded-full text-xs font-bold border",
                                        event.level === "Platinum" ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" :
                                            event.level === "Gold" ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" :
                                                event.level === "Silver" ? "bg-gray-400/10 text-gray-300 border-gray-400/20" :
                                                    "bg-orange-500/10 text-orange-400 border-orange-500/20"
                                    )}>
                                        {event.level} Partner
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
