import { UserRole, ProfileVisibility } from "@/types";

/**
 * Normalizes role string to match UserRole type (capitalized)
 */
export function normalizeRole(role: string): UserRole {
    const normalized = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
    if (normalized === "Participant" || normalized === "Organizer" || normalized === "Sponsor" || normalized === "Recruiter" || normalized === "Mentor" || normalized === "Admin") {
        return normalized as UserRole;
    }
    return "Participant"; // Default fallback
}

/**
 * Sanitizes user data to ensure all fields are in the expected format.
 * Particularly important when data comes from the PHP/MySQL backend which might
 * return strings for JSON fields or un-normalized roles.
 */
export function sanitizeUserData(user: any): any {
    if (!user) return user;

    const sanitized = { ...user };

    // 1. Normalize role
    if (sanitized.role) {
        sanitized.role = normalizeRole(sanitized.role);
    }

    // 2. Ensure skills is an array
    if (typeof sanitized.skills === 'string') {
        try {
            sanitized.skills = JSON.parse(sanitized.skills);
        } catch (e) {
            sanitized.skills = sanitized.skills.split(',').map((s: string) => s.trim()).filter(Boolean);
        }
    }

    if (!Array.isArray(sanitized.skills)) {
        sanitized.skills = [];
    }

    // 3. Ensure defaults for other fields if missing
    if (!sanitized.id) sanitized.id = Math.random().toString(36).substr(2, 9);
    if (!sanitized.avatar) {
        const seed = sanitized.name || sanitized.email || Math.random().toString();
        sanitized.avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
    }

    return sanitized;
}

/**
 * Gets the dashboard route for a user role
 */
export function getDashboardRoute(role: UserRole): string {
    switch (role) {
        case "Participant":
            return "/dashboard";
        case "Organizer":
            return "/organizer/dashboard";
        case "Sponsor":
            return "/dashboard";
        case "Recruiter":
            return "/dashboard";
        case "Mentor":
            return "/mentor/dashboard";
        case "Admin":
            return "/admin/dashboard";
        default:
            return "/dashboard";
    }
}

/**
 * Checks if a user has permission to access a feature
 */
export function hasPermission(userRole: UserRole | null, requiredRoles: UserRole[]): boolean {
    if (!userRole) return false;
    return requiredRoles.includes(userRole);
}

/**
 * Checks if a viewer can see a participant's profile based on visibility settings
 */
export function canViewProfile(viewerRole: UserRole | null, profileVisibility: ProfileVisibility = "public"): boolean {
    if (!viewerRole) return profileVisibility === "public";

    if (profileVisibility === "public") return true;
    if (profileVisibility === "recruiters-only") return viewerRole === "Recruiter" || viewerRole === "Organizer" || viewerRole === "Admin";
    return false; // private - only owner can view
}

/**
 * Role-based feature access checks
 */
export const RolePermissions = {
    // General permissions
    canViewEvents: (role: UserRole | null) => hasPermission(role, ["Participant", "Organizer", "Sponsor", "Recruiter", "Mentor", "Admin"]),
    canViewLeaderboard: (role: UserRole | null) => hasPermission(role, ["Participant", "Organizer", "Sponsor", "Recruiter", "Mentor", "Admin"]),

    // Participant permissions
    canRegisterForEvents: (role: UserRole | null) => hasPermission(role, ["Participant"]),
    canSubmitSolutions: (role: UserRole | null) => hasPermission(role, ["Participant"]),
    canManageProfileVisibility: (role: UserRole | null) => hasPermission(role, ["Participant"]),
    canViewCertificates: (role: UserRole | null) => hasPermission(role, ["Participant", "Organizer", "Admin"]),
    canParticipate: (role: UserRole | null) => hasPermission(role, ["Participant"]),
    canManageTeam: (role: UserRole | null) => hasPermission(role, ["Participant"]),

    // Organizer permissions
    canManageEvents: (role: UserRole | null) => hasPermission(role, ["Organizer", "Admin"]),
    canCreateEvents: (role: UserRole | null) => hasPermission(role, ["Organizer", "Admin"]),
    canManageParticipants: (role: UserRole | null) => hasPermission(role, ["Organizer", "Admin"]),
    canPublishResults: (role: UserRole | null) => hasPermission(role, ["Organizer", "Admin"]),
    canGenerateCertificates: (role: UserRole | null) => hasPermission(role, ["Organizer", "Admin"]),
    canExportData: (role: UserRole | null) => hasPermission(role, ["Organizer", "Admin"]),
    canManageOnlineJudge: (role: UserRole | null) => hasPermission(role, ["Organizer", "Admin"]),
    canViewAnalytics: (role: UserRole | null) => hasPermission(role, ["Organizer", "Sponsor", "Admin"]),
    canPostAnnouncements: (role: UserRole | null) => hasPermission(role, ["Organizer", "Admin"]),

    // Sponsor permissions
    canSponsorEvents: (role: UserRole | null) => hasPermission(role, ["Sponsor", "Admin"]),
    canPostSponsorships: (role: UserRole | null) => hasPermission(role, ["Sponsor", "Admin"]),
    canReviewApplications: (role: UserRole | null) => hasPermission(role, ["Sponsor", "Organizer", "Admin"]),
    canViewMetrics: (role: UserRole | null) => hasPermission(role, ["Sponsor", "Admin"]),
    canNegotiateDeals: (role: UserRole | null) => hasPermission(role, ["Sponsor", "Organizer", "Admin"]),

    // Recruiter permissions
    canRecruit: (role: UserRole | null) => hasPermission(role, ["Recruiter", "Admin"]),
    canSearchCandidates: (role: UserRole | null) => hasPermission(role, ["Recruiter", "Admin"]),
    canViewProfiles: (role: UserRole | null) => hasPermission(role, ["Recruiter", "Organizer", "Admin"]),
    canShortlistCandidates: (role: UserRole | null) => hasPermission(role, ["Recruiter", "Admin"]),
    canPostJobs: (role: UserRole | null) => hasPermission(role, ["Recruiter", "Admin"]),
    canContactCandidates: (role: UserRole | null) => hasPermission(role, ["Recruiter", "Admin"]),

    // Mentor permissions
    canOfferMentorship: (role: UserRole | null) => hasPermission(role, ["Mentor", "Admin"]),
    canManageRequests: (role: UserRole | null) => hasPermission(role, ["Mentor", "Admin"]),
    canViewPublicRequests: (role: UserRole | null) => hasPermission(role, ["Mentor", "Admin"]),

    // Admin permissions
    canVerifyUsers: (role: UserRole | null) => hasPermission(role, ["Admin"]),
    canVerifyInstitutions: (role: UserRole | null) => hasPermission(role, ["Admin"]),
    canModerateContent: (role: UserRole | null) => hasPermission(role, ["Admin"]),
    canAccessAllData: (role: UserRole | null) => hasPermission(role, ["Admin"]),
};
