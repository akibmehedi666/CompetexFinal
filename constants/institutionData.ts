import { Building2, Code, Palette, Cpu, Globe } from "lucide-react";

export interface Institution {
    id: string;
    name: string;
    description: string;
    logo: any; // Lucide Icon or string URL
    color: string; // Tailwind color class or hex for glowing effects
    stats: {
        rank: number;
        totalEvents: number;
        members: number;
    };
    hostedEvents: string[]; // IDs from DETAILED_EVENTS
    location: string;
    verified: boolean;
}

export const INSTITUTIONS: Institution[] = [
    {
        id: "inst-mit",
        name: "Massachusetts Institute of Technology",
        description: "Advancing knowledge and educating students in science, technology, and other areas of scholarship that will best serve the nation and the world.",
        logo: Code,
        color: "#A31F34", // MIT Red-ish
        location: "Cambridge, MA",
        verified: true,
        stats: {
            rank: 1,
            totalEvents: 24,
            members: 12500
        },
        hostedEvents: ["e1", "e5", "e-past-1"] // Neon City Hack, Quantum Challenge, Winter AI Summit
    },
    {
        id: "inst-stanford",
        name: "Stanford University",
        description: "A place for learning, discovery, innovation, expression and discourse.",
        logo: Cpu,
        color: "#8C1515", // Stanford Cardinal
        location: "Stanford, CA",
        verified: true,
        stats: {
            rank: 2,
            totalEvents: 18,
            members: 8900
        },
        hostedEvents: ["e2", "e4"] // RoboWars, Algo Trading
    },
    {
        id: "inst-risd",
        name: "Rhode Island School of Design",
        description: "One of the oldest and best-known colleges of art and design.",
        logo: Palette,
        color: "#1d1d1b", // RISD Black/White (using dark gray for glow)
        location: "Providence, RI",
        verified: true,
        stats: {
            rank: 8,
            totalEvents: 12,
            members: 4200
        },
        hostedEvents: ["e3"] // Eco-Design
    },
    {
        id: "inst-digipen",
        name: "DigiPen Institute of Technology",
        description: "The first college in the world dedicated to real-time interactive simulation and video game programming.",
        logo: Globe,
        color: "#F58025", // DigiPen Orange
        location: "Redmond, WA",
        verified: true,
        stats: {
            rank: 15,
            totalEvents: 9,
            members: 3100
        },
        hostedEvents: ["e6"] // GameDev Retro Jam
    },
    {
        id: "inst-mech",
        name: "MechInstitute of Engineering",
        description: "Focusing on hardware innovation, robotics, and mechanical systems design for the next industrial revolution.",
        logo: Cpu, // Reuse Cpu or similar
        color: "#00E5FF", // Cyan
        location: "Detroit, MI",
        verified: true,
        stats: {
            rank: 12,
            totalEvents: 6,
            members: 1800
        },
        hostedEvents: ["e-past-2"] // MechWar Legacy
    }
];
