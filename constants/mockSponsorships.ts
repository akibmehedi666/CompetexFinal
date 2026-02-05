import { DollarSign, Users, Globe, Zap, Target } from "lucide-react";

export interface SponsorshipOpportunity {
    id: string;
    brandName: string;
    logo: any; // Lucide icon for now
    industry: string;
    budget: string;
    focus: "AI" | "Robotics" | "Gaming" | "General";
    minReach: number; // Minimum number of participants/attendees
    requirements: string[];
    description: string;
    color: string;
}

export const SPONSORSHIP_OPPORTUNITIES: SponsorshipOpportunity[] = [
    {
        id: "sp-1",
        brandName: "TechTitan Corp",
        logo: Globe,
        industry: "Enterprise Software",
        budget: "$5,000 - $10,000",
        focus: "AI",
        minReach: 500,
        requirements: ["Keynote Slot", "Logo on T-shirts", "Access to Resume Database"],
        description: "Looking to sponsor high-impact AI hackathons. We want to connect with the next generation of machine learning engineers.",
        color: "#3B82F6" // Blue
    },
    {
        id: "sp-2",
        brandName: "CloudNet Systems",
        logo: Zap,
        industry: "Cloud Infrastructure",
        budget: "$2,500",
        focus: "General",
        minReach: 200,
        requirements: ["Workshop Session", "Social Media Shoutouts"],
        description: "Supporting student-led initiatives to foster community growth in cloud computing.",
        color: "#10B981" // Green
    },
    {
        id: "sp-3",
        brandName: "NextGen Robotics",
        logo: Target,
        industry: "Hardware",
        budget: "$8,000",
        focus: "Robotics",
        minReach: 300,
        requirements: ["Exclusive Hardware Demo", "Judges Panel Seat", "Branded Arena"],
        description: "We are scouting for the best robotics talent. Sponsoring combat robotics and automation challenges.",
        color: "#F59E0B" // Orange
    },
    {
        id: "sp-4",
        brandName: "PixelStream",
        logo: DollarSign, // Placeholder
        industry: "Gaming & Media",
        budget: "$15,000",
        focus: "Gaming",
        minReach: 2000,
        requirements: ["Title Sponsorship", "Live Stream Branding", "VIP Booth"],
        description: "The ultimate gaming partner. We sponsor major eSports tournaments and game jams.",
        color: "#8B5CF6" // Purple
    },
    {
        id: "sp-5",
        brandName: "CyberSec Inc",
        logo: Users,
        industry: "Cybersecurity",
        budget: "$4,000",
        focus: "General",
        minReach: 150,
        requirements: ["CTF Challenge Host", "Recruiting Booth"],
        description: "Identify top security talent through Capture The Flag events.",
        color: "#EF4444" // Red
    }
];
