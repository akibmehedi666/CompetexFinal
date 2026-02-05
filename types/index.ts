export type UserRole = "Participant" | "Organizer" | "Sponsor" | "Recruiter" | "Mentor" | "Admin";
export type EventMode = "Offline" | "Online";
export type EventStatus = "Upcoming" | "Live" | "Ended";
export type ProfileVisibility = "public" | "recruiters-only" | "private";
export type CertificateStatus = "pending" | "issued" | "revoked";
export type SponsorshipStatus = "pending" | "approved" | "rejected" | "active" | "completed";
export type ApplicationStatus = "draft" | "submitted" | "under-review" | "accepted" | "rejected";
export type JobType = "full-time" | "part-time" | "internship" | "contract";
export type ShortlistStatus = "interested" | "contacted" | "interviewing" | "offered" | "hired" | "rejected";

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    university?: string;
    skills: string[];
    competitions?: string[]; // Array of competition names user is interested in/registered for
    avatar: string; // URL
    stats?: {
        rank: number;
        points: number;
        eventsWon: number;
    };
    profileVisibility?: ProfileVisibility;
    achievements?: Achievement[];
    competitionHistory?: CompetitionEntry[];
    verified?: boolean;
    institution?: Institution;
    bio?: string;
    github?: string;
    linkedin?: string;
    portfolio?: string;

    // Role-specific fields (flat structure for PHP API compatibility)
    mentor_name?: string;
    mentor_position?: string;
    mentor_company?: string;
    recruiter_position?: string;
    recruiter_company?: string;
}

export interface Event {
    id: string;
    title: string;
    organizer: string;
    organizerId?: string;
    date: string; // Display Date (e.g. "Jan 24, 2026")
    startDate: string; // ISO String for Countdown
    venue?: string;
    category: "Hackathon" | "Coding" | "Debate" | "Robotics" | "Gaming" | "Design" | "Seminar" | "AI/ML";
    mode: EventMode;
    status: EventStatus;
    description: string;
    participantsCount: number;
    maxParticipants?: number;
    image: string;
    coords?: { x: number; y: number }; // For Venue Map
    prizes?: string[];
    rules?: string;
    schedule?: string;
    hasOnlineJudge?: boolean;
    registrationDeadline?: string;
    teamSize?: { min: number; max: number };
    difficulty?: "Beginner" | "Intermediate" | "Advanced";
    tags?: string[];
    registrationType?: "individual" | "team";
    maxTeams?: number;
    organizerEmail?: string; // Contact info
    organizerPhone?: string;
    registrationFee?: number; // >0 => paid event
}

export interface TeamMember {
    id: string;
    name: string;
    avatar: string;
    role: "leader" | "member";
    skills: string[];
}

export interface Team {
    id: string;
    name: string;
    description: string;
    project?: string;
    projectIdea?: string; // Aligning with DB
    categories: string[];
    requiredSkills: string[];
    members: TeamMember[];
    maxMembers: number;
    leaderId: string;
    status: "open" | "full" | "invite-only";
    competition?: string;
    competition_id?: string; // Aligning with DB
}

export interface Institution {
    id: string;
    name: string;
    logo: string;
    rank: number;
    totalPoints: number;
    location: string;
    verified?: boolean;
}

export interface ChatMessage {
    id: string;
    senderId: string;
    recipientId?: string; // For Direct messages
    content: string;
    timestamp: string;
    channel: "Global" | "Team" | "Direct";
}

export interface Resource {
    id: string;
    title: string;
    type: "Video" | "PDF" | "Course";
    isPremium: boolean;
    category: string;
    thumbnail: string;
}

export interface Achievement {
    id: string;
    eventId: string;
    eventTitle: string;
    title: string;
    description: string;
    earnedDate: string;
    certificateUrl?: string;
    badge?: string;
    type: "winner" | "runner-up" | "participant" | "special";
}

export interface CompetitionEntry {
    id: string;
    eventId: string;
    eventTitle: string;
    rank: number;
    score: number;
    date: string;
    category: string;
    teamName?: string;
    participantsCount: number;
}

export interface SponsorshipOpportunity {
    id: string;
    sponsorId: string;
    sponsorName: string;
    title: string;
    budget: string;
    budgetAmount?: number;
    category: string[];
    description: string;
    requirements: string[];
    minReach: number;
    focus: string;
    industry: string;
    status: SponsorshipStatus;
    createdAt: string;
    logo?: any;
    deliverables?: string[];
    duration?: string;
}

export interface SponsorshipApplication {
    id: string;
    eventId: string;
    eventTitle: string;
    sponsorshipId: string;
    organizerId: string;
    organizerName: string;
    status: ApplicationStatus;
    proposedValue: string;
    message: string;
    createdAt: string;
    updatedAt?: string;
    expectedReach?: number;
    eventMetrics?: {
        previousAttendance?: number;
        socialMediaReach?: number;
        mediaPartners?: string[];
    };
}

export interface JobPosting {
    id: string;
    recruiterId: string;
    recruiterName: string;
    companyName: string;
    title: string;
    description: string;
    requirements: string[];
    skills: string[];
    location: string;
    type: JobType;
    salary?: string;
    postedAt: string;
    deadline?: string;
    applicationsCount?: number;
}

export interface Shortlist {
    id: string;
    recruiterId: string;
    candidateId: string;
    candidateName: string;
    jobId?: string;
    jobTitle?: string;
    notes: string;
    status: ShortlistStatus;
    addedAt: string;
    lastContact?: string;
    rating?: number;
}

export interface EventRegistration {
    id: string;
    eventId: string;
    userId: string;
    user?: User; // Populated
    teamId?: string;
    teamName?: string; // Populated
    status: "pending" | "confirmed" | "rejected" | "waitlisted" | "checked-in" | "approved";
    registeredAt: string;
    paymentStatus?: "pending" | "completed" | "failed";
}

export interface Announcement {
    id: string;
    eventId: string;
    organizerId: string;
    title: string;
    content: string;
    priority: "low" | "medium" | "high" | "urgent";
    createdAt: string;
    targetAudience: "all" | "participants" | "sponsors" | "team-leaders";
}

export type MentorshipType = "One-to-One" | "Team Mentoring" | "Competition Prep" | "Project Review" | "Mock Interview" | "Career Counseling" | "Research Guidance";

export interface MentorProfile {
    id: string;
    userId: string;
    name: string;
    title: string;
    organization: string;
    location?: string;
    avatar: string;
    bio: string;
    expertise: string[];
    competitionBadges?: string[];
    rating: number;
    reviewCount: number;
    hourlyRate: number; // 0 for free
    currency: string;
    availability: {
        slots: string[]; // e.g. ["Mon 10:00 AM", "Wed 2:00 PM"]
        nextAvailable: string;
    };
    socials: {
        linkedin?: string;
        github?: string;
        website?: string;
    };
    offerings: MentorshipType[];
    languages: string[];
    verified: boolean;
}

export interface MentorshipRequest {
    id: string;
    mentorId: string;
    menteeId: string; // User ID
    menteeName: string;
    menteeAvatar?: string;
    type: MentorshipType;
    status: "pending" | "accepted" | "rejected" | "completed" | "cancelled";
    message: string;
    proposedSlots: string[];
    createdAt: string;
}

export interface MentorshipSession {
    id: string;
    requestId?: string;
    mentorId: string;
    menteeId: string;
    menteeName?: string; // Populated
    startTime: string; // ISO
    duration: number; // minutes
    meetLink?: string;
    status: "scheduled" | "live" | "completed" | "cancelled";
    topic?: string;
    notes?: string;
}

export type SponsorshipTier = "Title" | "Platinum" | "Gold" | "Silver" | "Bronze" | "Partner";

export interface SponsorshipRole {
    id: string;
    sponsorId: string;
    title: string; // e.g. "Gold Sponsor"
    category: string[]; // e.g. ["Hackathon", "Robotics"]
    minEventLevel: "College" | "National" | "International";
    offerings: string[]; // e.g. ["$1000", "Cloud Credits"]
    benefits: string[]; // e.g. ["Logo on Shirt", "Booth"]
    budgetRange?: { min: number; max: number };
    status: "Open" | "Closed";
    createdAt: string;
}

export interface SponsorProfile {
    id: string;
    userId: string;
    companyName: string;
    logo: string;
    industry: string;
    description: string;
    website: string;
    email: string;
    phone?: string;
    location: string;
    sponsorshipCategories: string[]; // e.g. ["Hackathon", "Robotics"]
    pastSponsorships: {
        eventId: string;
        eventName: string;
        year: string;
        category: string;
        level: "Platinum" | "Gold" | "Silver" | "Bronze" | "Custom";
    }[];
    preferences: {
        targetAudience: string[];
        preferredEventTypes: string[];
        minAudienceSize?: number;
    };
    verified: boolean;
    sponsorshipRoles?: SponsorshipRole[];
}

export interface SponsorshipRequest {
    id: string;
    eventId: string;
    eventTitle: string;
    organizerId: string;
    organizerName: string;
    sponsorId: string;
    sponsorName: string;
    sponsorshipRoleId?: string; // Linked Role
    sponsorshipRoleTitle?: string; // Snapshot of role title
    status: "pending" | "accepted" | "rejected" | "negotiating" | "completed";
    proposal: {
        description: string;
        audienceReach: number;
        requestedAmount?: string; // e.g. "$5000" or "In-kind"
        requestedBenefits: string[];
        sponsorshipType: "Financial" | "In-Kind" | "Media" | "Venue";
    };
    createdAt: string;
    updatedAt: string;
    messages?: ChatMessage[];
}
