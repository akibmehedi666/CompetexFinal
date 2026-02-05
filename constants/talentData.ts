import { User } from "@/types";

export interface Talent extends Omit<User, 'stats'> {
    location: string;
    details: {
        availability: "Open to Work" | "Busy" | "Hiring";
        rate: string;
        experience: string;
    };
    stats: {
        wins: number;
        rank: number;
        avgScore: number;
        topAchievement?: string;
        points: number;     // Required to match User structure logical equivalence if needed, but we Omitted it so it's fine.
        eventsWon: number;  // Keeping consistent
    };
}

export const TALENT_POOL: Talent[] = [
    {
        id: "t1",
        name: "Fariya Nika Oshru",
        email: "fariya@dev.com",
        role: "Participant",
        university: "UIU",
        location: "Dhaka, Bangladesh", // Added location
        skills: ["React", "TypeScript", "Node.js"],
        competitions: ["Global AI Challenge", "Neon City Hackathon"],
        avatar: "/oshru.jpg",
        details: { availability: "Open to Work", rate: "$85/hr", experience: "4 Years" },
        stats: { rank: 12, points: 4500, eventsWon: 5, wins: 5, avgScore: 92, topAchievement: "Neon City Hack Winner" }
    },
    {
        id: "t2",
        name: "Toufiq Khan",
        email: "toufiq@design.com",
        role: "Participant",
        university: "UIU",
        location: "Dhaka, Bangladesh",
        skills: ["Figma", "UI/UX", "Three.js"],
        competitions: ["Design Wars", "Neon City Hackathon"],
        avatar: "/toufiq.jpg",
        details: { availability: "Busy", rate: "$95/hr", experience: "6 Years" },
        stats: { rank: 45, points: 2100, eventsWon: 2, wins: 2, avgScore: 88, topAchievement: "Best UI Design 2024" }
    },
    {
        id: "t3",
        name: "Partha Pratim Podder",
        email: "partha@code.com",
        role: "Participant",
        university: "UIU",
        location: "Dhaka, Bangladesh",
        skills: ["Python", "Django", "PostgreSQL"],
        competitions: ["Global AI Challenge", "Inter-University Coding Battle"],
        avatar: "/partha.jpg",
        details: { availability: "Hiring", rate: "$120/hr", experience: "8 Years" },
        stats: { rank: 8, points: 5200, eventsWon: 7, wins: 7, avgScore: 96, topAchievement: "Global Algo Champ" }
    },
    {
        id: "t4",
        name: "Elena Rodriguez",
        email: "elena@tech.com",
        role: "Participant",
        university: "Georgia Tech",
        location: "Atlanta, GA",
        skills: ["Rust", "WASM", "Systems"],
        competitions: ["Systems Design Olympiad"],
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Elena",
        details: { availability: "Open to Work", rate: "$100/hr", experience: "3 Years" },
        stats: { rank: 23, points: 3400, eventsWon: 3, wins: 3, avgScore: 91, topAchievement: "Systems Architect Award" }
    },
    {
        id: "t5",
        name: "Priya Patel",
        email: "priya@ml.com",
        role: "Participant",
        university: "CMU",
        location: "Pittsburgh, PA",
        skills: ["PyTorch", "TensorFlow", "CV"],
        competitions: ["Global AI Challenge", "Neon City Hackathon"],
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
        details: { availability: "Open to Work", rate: "$110/hr", experience: "5 Years" },
        stats: { rank: 5, points: 6000, eventsWon: 8, wins: 8, avgScore: 98, topAchievement: "AI Summit Gold" }
    },
    {
        id: "t6",
        name: "James Wilson",
        email: "james@web.com",
        role: "Participant",
        university: "Oxford",
        location: "Oxford, UK",
        skills: ["Vue.js", "Nuxt", "Tailwind"],
        competitions: ["Web Wiz 2026"],
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=James",
        details: { availability: "Busy", rate: "$70/hr", experience: "2 Years" },
        stats: { rank: 67, points: 1800, eventsWon: 1, wins: 1, avgScore: 85 }
    },
    {
        id: "t7",
        name: "Yuki Tanaka",
        email: "yuki@game.com",
        role: "Participant",
        university: "Tokyo Univ",
        location: "Tokyo, JP",
        skills: ["Unity", "C#", "Blender"],
        competitions: ["Game Jam X"],
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Yuki",
        details: { availability: "Open to Work", rate: "$90/hr", experience: "4 Years" },
        stats: { rank: 34, points: 2900, eventsWon: 4, wins: 4, avgScore: 93, topAchievement: "Indie Game Jam Winner" }
    },
    {
        id: "t8",
        name: "Omar Farooq",
        email: "omar@sec.com",
        role: "Participant",
        university: "Waterloo",
        location: "Waterloo, CA",
        skills: ["Cybersecurity", "Ethical Hacking", "Linux"],
        competitions: ["Capture The Flag World Cup"],
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Omar",
        details: { availability: "Hiring", rate: "$130/hr", experience: "7 Years" },
        stats: { rank: 15, points: 4100, eventsWon: 6, wins: 6, avgScore: 95, topAchievement: "CTF Grandmaster" }
    },
    {
        id: "t9",
        name: "Sophie Anderson",
        email: "sophie@pm.com",
        role: "Participant",
        university: "Harvard",
        location: "Cambridge, MA",
        skills: ["Product", "Agile", "Jira"],
        competitions: ["Product Hunt Hackathon"],
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie",
        details: { availability: "Open to Work", rate: "$105/hr", experience: "5 Years" },
        stats: { rank: 89, points: 1200, eventsWon: 0, wins: 0, avgScore: 82 }
    },
    {
        id: "t10",
        name: "Lucas Silva",
        email: "lucas@dev.com",
        role: "Participant",
        university: "USP",
        location: "São Paulo, BR",
        skills: ["Go", "Kubernetes", "Cloud"],
        competitions: ["Cloud Native Challenge"],
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lucas",
        details: { availability: "Busy", rate: "$115/hr", experience: "6 Years" },
        stats: { rank: 28, points: 3100, eventsWon: 3, wins: 3, avgScore: 90, topAchievement: "Cloud Native Expert" }
    },
    {
        id: "t11",
        name: "Emma Wright",
        email: "emma@ds.com",
        role: "Participant",
        university: "Imperial",
        location: "London, UK",
        skills: ["R", "Statistics", "SQL"],
        competitions: ["Data Science Bowl"],
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
        details: { availability: "Open to Work", rate: "$95/hr", experience: "3 Years" },
        stats: { rank: 56, points: 2000, eventsWon: 2, wins: 2, avgScore: 87 }
    },
    {
        id: "t12",
        name: "Ryan Chang",
        email: "ryan@mobile.com",
        role: "Participant",
        university: "UCLA",
        location: "Los Angeles, CA",
        skills: ["Swift", "iOS", "SwiftUI"],
        competitions: ["Mobile App Innovation Award"],
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ryan",
        details: { availability: "Open to Work", rate: "$100/hr", experience: "4 Years" },
        stats: { rank: 41, points: 2600, eventsWon: 2, wins: 2, avgScore: 89, topAchievement: "App Store Feature" }
    },
    {
        id: "t13",
        name: "Fatima Al-Sayed",
        email: "fatima@web.com",
        role: "Participant",
        university: "KAUST",
        location: "Thuwal, SA",
        skills: ["Angular", "RxJS", "SCSS"],
        competitions: ["Web Wiz 2026"],
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Fatima",
        details: { availability: "Busy", rate: "$80/hr", experience: "3 Years" },
        stats: { rank: 72, points: 1500, eventsWon: 1, wins: 1, avgScore: 86 }
    },
    {
        id: "t14",
        name: "Tom Baker",
        email: "tom@iot.com",
        role: "Participant",
        university: "ETH Zurich",
        location: "Zurich, CH",
        skills: ["C++", "Embedded", "IoT"],
        competitions: ["IoT Smart City Challenge"],
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Tom",
        details: { availability: "Hiring", rate: "$140/hr", experience: "9 Years" },
        stats: { rank: 19, points: 3800, eventsWon: 4, wins: 4, avgScore: 94, topAchievement: "IoT Innovation Prize" }
    },
    {
        id: "t15",
        name: "Anita Singh",
        email: "anita@blockchain.com",
        role: "Participant",
        university: "IIT Bombay",
        location: "Mumbai, IN",
        skills: ["Solidity", "Web3", "Ethereum"],
        competitions: ["Global Blockchain Summit"],
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Anita",
        details: { availability: "Open to Work", rate: "$125/hr", experience: "5 Years" },
        stats: { rank: 9, points: 4900, eventsWon: 6, wins: 6, avgScore: 97, topAchievement: "DeFi Hack Winner" }
    }
];
