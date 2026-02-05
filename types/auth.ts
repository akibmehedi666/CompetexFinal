import { z } from "zod";

// Base schema for shared fields
const baseUserSchema = z.object({
    fullName: z.string().min(2, "Name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

// Discriminated Union for Role-Specific Data
export const RegistrationSchema = z.discriminatedUnion("role", [
    z.object({
        role: z.literal("participant"),
        ...baseUserSchema.shape,
        skills: z.array(z.string()).min(1, "Select at least one skill"),
        githubUrl: z.string().url().optional(),
    }),
    z.object({
        role: z.literal("organizer"),
        ...baseUserSchema.shape,
        organizationName: z.string().min(2),
        website: z.string().url(),
        isInstitution: z.boolean().optional(),
    }),
    z.object({
        role: z.literal("sponsor"),
        ...baseUserSchema.shape,
        organizationName: z.string().min(2),
        website: z.string().url().optional(),
        bio: z.string().optional()
    }),
    z.object({
        role: z.literal("recruiter"),
        ...baseUserSchema.shape,
        organizationName: z.string().min(2, "Company Name is required"),
        position: z.string().min(2, "Position is required"),
        website: z.string().url().optional(),
        linkedin: z.string().url().optional(),
    }),
    z.object({
        role: z.literal("mentor"),
        ...baseUserSchema.shape,
        organizationName: z.string().min(2, "Organization Name is required"),
        position: z.string().min(2, "Position is required"),
        expertise: z.array(z.string()).min(1, "at least one expertise is required").optional(),
        yearsExperience: z.coerce.number().min(0).optional(),
        bio: z.string().optional(),
        linkedin: z.string().url().optional(),
        website: z.string().url().optional(),
    }),
]);

export type RegistrationData = z.infer<typeof RegistrationSchema>;