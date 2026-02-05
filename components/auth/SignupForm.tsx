"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { RegistrationSchema, RegistrationData } from "@/types/auth";
import { Check, ChevronRight, ChevronLeft, Loader2, User, LayoutDashboard, Building2, Handshake, Briefcase, Lock, Mail, Heading, GraduationCap } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { normalizeRole, getDashboardRoute } from "@/lib/auth";
import { UserRole } from "@/types";
import { ENDPOINTS } from "@/lib/api_config";

const ROLES = [
    { id: "participant", label: "Participant", icon: User, desc: "Join hackathons & compete" },
    { id: "organizer", label: "Organizer", icon: LayoutDashboard, desc: "Host events & manage teams" },
    { id: "sponsor", label: "Sponsor", icon: Handshake, desc: "Connect with talent & brands" },
    { id: "recruiter", label: "Recruiter", icon: Briefcase, desc: "Find top tech talent" },
    { id: "mentor", label: "Mentor", icon: GraduationCap, desc: "Guide & inspire the next generation" },
] as const;

export function SignupForm() {
    const [step, setStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const form = useForm<RegistrationData>({
        resolver: zodResolver(RegistrationSchema) as any,
        defaultValues: {
            role: "participant", // Default to avoid type issues before selection
            skills: [],
        } as any,
        mode: "onChange"
    });

    const { register, watch, setValue, trigger, formState: { errors, isValid } } = form;
    const role = watch("role");
    const password = watch("password");

    // Pre-select role from URL if present
    const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;

    useEffect(() => {
        if (searchParams) {
            const roleParam = searchParams.get('role');
            if (roleParam) {
                // Validate it matches a known role
                const matched = ROLES.find(r => r.id === roleParam.toLowerCase());
                if (matched) {
                    setValue("role", matched.id as any);
                }
            }
        }
    }, [setValue]);

    // Step Navigation Logic
    const nextStep = async () => {
        let valid = false;
        if (step === 0) {
            if (role) valid = true; // Role must be selected
        } else if (step === 1) {
            valid = await trigger(["fullName", "email", "password", "confirmPassword"]);
        } else {
            valid = await trigger(); // Final validation
        }

        if (valid) setStep(s => s + 1);
    };

    const prevStep = () => setStep(s => s - 1);

    const onSubmit = async (data: RegistrationData) => {
        setIsSubmitting(true);

        // Normalize role to match UserRole type (capitalized)
        const normalizedRole = normalizeRole(data.role);

        // Prepare data for API
        // Prepare data for API
        let apiData: any = {
            name: data.fullName,
            email: data.email,
            password: data.password,
            role: normalizedRole,
        };

        // Enrich apiData based on role using type narrowing
        if (data.role === "participant") {
            apiData.skills = data.skills || [];
            apiData.github = data.githubUrl;
        } else if (data.role === "organizer") {
            apiData.organization_name = data.organizationName;
            apiData.website = data.website;
            apiData.is_institution = data.isInstitution;
        } else if (data.role === "sponsor") {
            apiData.company_name = data.organizationName;
            apiData.website = data.website;
            apiData.bio = data.bio;
        } else if (data.role === "recruiter") {
            apiData.company_name = data.organizationName;
            apiData.position = data.position;
            apiData.website = data.website;
            apiData.linkedin = data.linkedin;
        } else if (data.role === "mentor") {
            apiData.company_name = data.organizationName;
            apiData.position = data.position;
            apiData.expertise = data.expertise || [];
            apiData.years_experience = data.yearsExperience;
            apiData.bio = data.bio;
            apiData.linkedin = data.linkedin;
            apiData.website = data.website;
        }

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/Competex/api';
            const response = await fetch(`${apiUrl}/signup.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(apiData),
            });

            const result = await response.json();

            if (result.status === 'success') {
                // Persist to LocalStorage (as requested by existing logic)
                const userData = {
                    ...result.user,
                    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=" + data.fullName, // Temporary avatar logic
                    stats: normalizedRole === "Participant" ? { rank: 42, points: 1250, eventsWon: 3 } : undefined, // Mock stats
                };
                localStorage.setItem("competex_user_session", JSON.stringify(userData));

                // Set cookies for middleware
                document.cookie = `competex_token=${result.user.id}; path=/; max-age=604800`;
                document.cookie = `competex_role=${normalizedRole}; path=/; max-age=604800`;

                router.push(getDashboardRoute(normalizedRole));
            } else {
                alert(result.message || "Registration failed");
            }
        } catch (error) {
            console.error("Signup error:", error);
            alert("An error occurred during signup.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const onErrors = (errors: any) => {
        console.error("Validation Errors:", errors);
        alert("Please fix the errors before submitting.");
    };

    // Password Strength Logic
    const getPasswordStrength = (pass: string) => {
        if (!pass) return 0;
        let score = 0;
        if (pass.length > 7) score += 1;
        if (/[A-Z]/.test(pass)) score += 1;
        if (/[0-9]/.test(pass)) score += 1;
        if (/[^A-Za-z0-9]/.test(pass)) score += 1;
        return score; // 0-4
    };
    const strength = getPasswordStrength(password || "");

    return (
        <div className="w-full max-w-4xl mx-auto p-4 md:p-8">
            {/* Overlay for Submission */}
            <AnimatePresence>
                {isSubmitting && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center font-outfit"
                    >
                        <Loader2 className="w-16 h-16 text-accent1 animate-spin mb-6" />
                        <h2 className="text-3xl font-bold text-white mb-2">Configuring your Experience...</h2>
                        <p className="text-gray-400">Setting up your {role} dashboard</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Progress Bar */}
            <div className="flex items-center justify-center mb-12 gap-2">
                {[0, 1, 2].map(s => (
                    <div key={s} className={cn("h-1 w-16 rounded-full transition-colors duration-500", step >= s ? "bg-accent1" : "bg-white/10")} />
                ))}
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                {/* STEP 0: Role Selection */}
                {step === 0 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                        <div className="text-center mb-10">
                            <h1 className="text-4xl font-bold text-white mb-4">Choose your <span className="text-accent1">Path</span></h1>
                            <p className="text-gray-400">Select how you want to interact with the platform.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {ROLES.map((r) => (
                                <div
                                    key={r.id}
                                    onClick={() => setValue("role", r.id as RegistrationData["role"])}
                                    className={cn(
                                        "cursor-pointer relative p-6 rounded-xl border transition-all duration-300 flex flex-col items-center text-center gap-4 group",
                                        role === r.id
                                            ? "bg-accent1/10 border-accent1 shadow-[0_0_20px_rgba(0,229,255,0.3)]"
                                            : "bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10"
                                    )}
                                >
                                    <AnimatePresence>
                                        {role === r.id && (
                                            <motion.div
                                                layoutId="role-check"
                                                className="absolute top-2 right-2 p-1 bg-accent1 rounded-full text-black"
                                            >
                                                <Check className="w-3 h-3" />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <div className={cn("p-4 rounded-full bg-black/50 group-hover:scale-110 transition-transform", role === r.id ? "text-accent1" : "text-gray-400")}>
                                        <r.icon className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-white mb-1">{r.label}</div>
                                        <div className="text-[10px] text-gray-500 leading-tight">{r.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* STEP 1: Basic Info */}
                {step === 1 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 max-w-md mx-auto">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-white">Basic Information</h2>
                            <p className="text-sm text-gray-400">Lets get your account set up.</p>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase">Full Name</label>
                                <div className="relative">
                                    <input
                                        {...register("fullName")}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg py-3 px-4 pl-10 text-white focus:border-accent1 focus:outline-none transition-colors"
                                        placeholder="John Doe"
                                    />
                                    <User className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                                </div>
                                {errors.fullName && <p className="text-red-500 text-xs">{String(errors.fullName.message)}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase">Email Address</label>
                                <div className="relative">
                                    <input
                                        {...register("email")}
                                        type="email"
                                        className="w-full bg-black/40 border border-white/10 rounded-lg py-3 px-4 pl-10 text-white focus:border-accent1 focus:outline-none transition-colors"
                                        placeholder="john@example.com"
                                    />
                                    <Mail className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                                </div>
                                {errors.email && <p className="text-red-500 text-xs">{String(errors.email.message)}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase">Password</label>
                                <div className="relative">
                                    <input
                                        {...register("password")}
                                        type="password"
                                        className="w-full bg-black/40 border border-white/10 rounded-lg py-3 px-4 pl-10 text-white focus:border-accent1 focus:outline-none transition-colors"
                                        placeholder="••••••••"
                                    />
                                    <Lock className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                                </div>
                                {/* Password Strength Meter */}
                                <div className="flex gap-1 h-1 mt-2">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className={cn("flex-1 rounded-full transition-colors", strength >= i ? (strength === 4 ? "bg-accent2" : "bg-yellow-400") : "bg-white/5")} />
                                    ))}
                                </div>
                                {errors.password && <p className="text-red-500 text-xs">{String(errors.password.message)}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase">Confirm Password</label>
                                <input
                                    {...register("confirmPassword")}
                                    type="password"
                                    className="w-full bg-black/40 border border-white/10 rounded-lg py-3 px-4 text-white focus:border-accent1 focus:outline-none transition-colors"
                                    placeholder="••••••••"
                                />
                                {(errors as any).confirmPassword && <p className="text-red-500 text-xs">{String((errors as any).confirmPassword.message)}</p>}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* STEP 2: Role Details */}
                {step === 2 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 max-w-md mx-auto">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-white capitalize">{role} Details</h2>
                            <p className="text-sm text-gray-400">Tell us more about your background.</p>
                        </div>

                        {/* Participant Fields */}
                        {role === "participant" && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase">Skills (Comma sep)</label>
                                    <input
                                        placeholder="React, Python, Design..."
                                        className="w-full bg-black/40 border border-white/10 rounded-lg py-3 px-4 text-white focus:border-accent1 focus:outline-none"
                                        onChange={(e) => setValue("skills", e.target.value.split(',').map(s => s.trim()))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase">GitHub URL</label>
                                    <input
                                        {...register("githubUrl")}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg py-3 px-4 text-white focus:border-accent1 focus:outline-none"
                                        placeholder="https://github.com/..."
                                    />
                                </div>
                            </div>
                        )}

                        {/* Organizer Fields */}
                        {role === "organizer" && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase">Organization Name</label>
                                    <input
                                        {...register("organizationName")}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg py-3 px-4 text-white focus:border-accent1 focus:outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase">Website</label>
                                    <input
                                        {...register("website")}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg py-3 px-4 text-white focus:border-accent1 focus:outline-none"
                                    />
                                </div>
                                <div className="flex items-center gap-3 p-4 border border-white/10 rounded-lg bg-white/5">
                                    <input
                                        type="checkbox"
                                        id="isInstitution"
                                        {...register("isInstitution")}
                                        className="w-5 h-5 rounded border-gray-600 text-accent1 focus:ring-accent1 bg-black"
                                    />
                                    <label htmlFor="isInstitution" className="text-sm text-gray-300">
                                        Is this an Official Institution / University?
                                    </label>
                                </div>
                            </div>
                        )}

                        {/* Sponsor Fields */}
                        {role === "sponsor" && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase">Company / Organization Name</label>
                                    <input
                                        {...register("organizationName")}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg py-3 px-4 text-white focus:border-accent1 focus:outline-none"
                                        placeholder="Company Name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase">Website</label>
                                    <input
                                        {...register("website")}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg py-3 px-4 text-white focus:border-accent1 focus:outline-none"
                                        placeholder="https://company.com"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase">Bio / About Company</label>
                                    <textarea
                                        {...register("bio")}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg py-3 px-4 text-white focus:border-accent1 focus:outline-none min-h-[100px]"
                                        placeholder="Tell us about your company and what kind of events you want to sponsor..."
                                    />
                                </div>
                            </div>
                        )}

                        {/* Add other role fields similarly... just placeholder for brevity as per prompt specific examples */}
                        {/* Recruiter Fields */}
                        {role === "recruiter" && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase">Company Name</label>
                                    <input
                                        {...register("organizationName")}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg py-3 px-4 text-white focus:border-accent1 focus:outline-none"
                                        placeholder="Tech Solutions Inc."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase">Your Position / Role</label>
                                    <input
                                        {...register("position")}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg py-3 px-4 text-white focus:border-accent1 focus:outline-none"
                                        placeholder="Senior Technical Recruiter"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase">Website</label>
                                    <input
                                        {...register("website")}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg py-3 px-4 text-white focus:border-accent1 focus:outline-none"
                                        placeholder="https://company.com"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase">LinkedIn Profile</label>
                                    <input
                                        {...register("linkedin")}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg py-3 px-4 text-white focus:border-accent1 focus:outline-none"
                                        placeholder="https://linkedin.com/in/..."
                                    />
                                </div>
                            </div>
                        )}

                        {/* Mentor Fields */}
                        {role === "mentor" && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase">Current Organization / Company</label>
                                    <input
                                        {...register("organizationName")}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg py-3 px-4 text-white focus:border-accent1 focus:outline-none"
                                        placeholder="University or Company Name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase">Position / Role</label>
                                    <input
                                        {...register("position")}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg py-3 px-4 text-white focus:border-accent1 focus:outline-none"
                                        placeholder="Senior Developer / Professor"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase">Areas of Expertise (Comma sep)</label>
                                    <input
                                        placeholder="AI/ML, Web Dev, Cloud..."
                                        className="w-full bg-black/40 border border-white/10 rounded-lg py-3 px-4 text-white focus:border-accent1 focus:outline-none"
                                        onChange={(e) => setValue("expertise", e.target.value.split(',').map(s => s.trim()))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase">Years of Experience</label>
                                    <input
                                        type="number"
                                        {...register("yearsExperience")}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg py-3 px-4 text-white focus:border-accent1 focus:outline-none"
                                        placeholder="5"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase">Bio / Introduction</label>
                                    <textarea
                                        {...register("bio")}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg py-3 px-4 text-white focus:border-accent1 focus:outline-none min-h-[100px]"
                                        placeholder="Briefly describe your mentorship focus..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase">LinkedIn Profile</label>
                                    <input
                                        {...register("linkedin")}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg py-3 px-4 text-white focus:border-accent1 focus:outline-none"
                                        placeholder="https://linkedin.com/in/..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase">Website / Portfolio</label>
                                    <input
                                        {...register("website")}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg py-3 px-4 text-white focus:border-accent1 focus:outline-none"
                                        placeholder="https://yourwebsite.com"
                                    />
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-8 border-t border-white/5 max-w-md mx-auto">
                    <button
                        type="button"
                        onClick={prevStep}
                        disabled={step === 0}
                        className={cn("flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all", step === 0 ? "opacity-0 pointer-events-none" : "text-gray-400 hover:text-white hover:bg-white/5")}
                    >
                        <ChevronLeft className="w-4 h-4" /> Back
                    </button>

                    {step < 2 ? (
                        <button
                            type="button"
                            onClick={nextStep}
                            className="flex items-center gap-2 px-8 py-3 bg-white text-black font-bold uppercase tracking-widest rounded-lg hover:scale-105 transition-transform"
                        >
                            Next <ChevronRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            type="submit"
                            className="flex items-center gap-2 px-8 py-3 bg-accent1 text-black font-bold uppercase tracking-widest rounded-lg shadow-[0_0_20px_rgba(0,229,255,0.4)] hover:shadow-[0_0_30px_rgba(0,229,255,0.6)] hover:scale-105 transition-all"
                        >
                            Complete Setup
                        </button>
                    )}
                </div>

            </form>
        </div>
    );
}
