"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronRight, ChevronLeft, Calendar, MapPin, Type, Layers, DollarSign, Upload, Trophy, Code, Users } from "lucide-react";
import { useStore } from "@/store/useStore";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Event } from "@/types";
import { VenuePicker } from "@/components/organizer/VenuePicker";
import { API_BASE_URL } from "@/lib/api_config";

interface EventCreationWizardProps {
    onComplete: () => void;
    onCancel: () => void;
}

const STEPS = [
    { id: 1, title: "Basic Info", icon: Type },
    { id: 2, title: "Details", icon: Calendar },
    { id: 3, title: "Registration", icon: UsersIcon },
    { id: 4, title: "Prizes & Sponsors", icon: Trophy },
    { id: 5, title: "Review", icon: Check }
];

function UsersIcon(props: any) { return <div {...props}><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg></div> }

export function EventCreationWizard({ onComplete, onCancel }: EventCreationWizardProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const { currentUser } = useStore();

    // Form State
    const [formData, setFormData] = useState<Partial<Event>>({
        title: "",
        description: "",
        category: "Hackathon",
        mode: "Offline",
        venue: "",
        coords: { x: 0, y: 0 },
        startDate: "",
        date: "",
        registrationDeadline: "",
        maxParticipants: 100,
        teamSize: { min: 1, max: 4 },
        prizes: ["", "", ""],
        hasOnlineJudge: false,
        status: "Upcoming",
        organizer: currentUser?.name || "Organizer",
        organizerId: currentUser?.id,
        image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80", // Default image
        tags: [],
        registrationType: "individual",
        registrationFee: 0
    });

    const [tempTag, setTempTag] = useState("");

    const updateForm = (key: string, value: any) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleNext = async () => {
        if (currentStep < STEPS.length) {
            setCurrentStep(prev => prev + 1);
        } else {
            // Submit
            try {
                // Ensure organizerId is set (fallback to current user or a default for testing)
                const payload = {
                    ...formData,
                    organizerId: formData.organizerId || currentUser?.id || "u-default-test"
                };

                console.log("Submitting payload:", payload);

                const response = await fetch(`${API_BASE_URL}/create_event.php`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                });

                let result;
                const textResponse = await response.text();
                try {
                    result = JSON.parse(textResponse);
                } catch (e) {
                    console.error("Failed to parse JSON response:", textResponse);
                    throw new Error(`Server returned non-JSON response: ${textResponse.substring(0, 100)}...`);
                }

                if (response.ok && result.status === 'success') {
                    toast.success("Event created successfully!");
                    console.log("Event Created:", result);

                    // Refresh events list if the store function is available
                    // useStore.getState().fetchEvents(); 

                    onComplete();
                } else {
                    toast.error(result.message || "Failed to create event");
                    console.error("Submission failed:", result);
                }
            } catch (error) {
                console.error("Error creating event:", error);

                // Detailed error message
                if (error instanceof SyntaxError) {
                    toast.error("Server returned invalid response (JSON Parse Error)");
                } else {
                    toast.error(`Submission failed: ${error instanceof Error ? error.message : "Unknown error"}`);
                }
            }
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const addTag = () => {
        if (tempTag && !formData.tags?.includes(tempTag)) {
            updateForm("tags", [...(formData.tags || []), tempTag]);
            setTempTag("");
        }
    };

    const removeTag = (tagToRemove: string) => {
        updateForm("tags", (formData.tags || []).filter(t => t !== tagToRemove));
    };

    const updatePrize = (index: number, value: string) => {
        const newPrizes = [...(formData.prizes || [])];
        newPrizes[index] = value;
        updateForm("prizes", newPrizes);
    };

    return (
        <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden flex flex-col h-full min-h-[600px]">
            {/* Header / Progress */}
            <div className="border-b border-white/10 p-6 bg-white/5">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Create New Event</h2>
                    <button onClick={onCancel} className="text-gray-400 hover:text-white">
                        Cancel
                    </button>
                </div>

                <div className="flex items-center justify-between relative">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/10 -z-0" />
                    <div
                        className="absolute top-1/2 left-0 h-0.5 bg-accent1 -z-0 transition-all duration-300"
                        style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
                    />

                    {STEPS.map((step) => {
                        const Icon = step.icon;
                        const isActive = currentStep >= step.id;
                        const isCurrent = currentStep === step.id;

                        return (
                            <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
                                <div className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                                    isActive
                                        ? "bg-black border-accent1 text-accent1 shadow-[0_0_10px_rgba(0,229,255,0.3)]"
                                        : "bg-black border-white/20 text-gray-500"
                                )}>
                                    <Icon className="w-4 h-4" />
                                </div>
                                <span className={cn(
                                    "text-xs font-bold uppercase transition-colors",
                                    isCurrent ? "text-white" : isActive ? "text-accent1" : "text-gray-600"
                                )}>
                                    {step.title}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-8 overflow-y-auto">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="max-w-3xl mx-auto"
                    >
                        {/* Step 1: Basic Info */}
                        {currentStep === 1 && (
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Event Title</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => updateForm("title", e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-accent1 outline-none transition-colors"
                                        placeholder="e.g. Global AI Hackathon 2026"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => updateForm("description", e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-accent1 outline-none transition-colors h-32"
                                        placeholder="Describe your event..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Category</label>
                                        <select
                                            value={formData.category}
                                            onChange={(e) => updateForm("category", e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-accent1 outline-none"
                                        >
                                            <option value="Hackathon">Hackathon</option>
                                            <option value="Coding">Coding Contest</option>
                                            <option value="Design">Design Sprint</option>
                                            <option value="Robotics">Robotics</option>
                                            <option value="AI/ML">AI / ML</option>
                                            <option value="Workshop">Workshop</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Tags</label>
                                        <div className="flex gap-2 mb-2 flex-wrap">
                                            {formData.tags?.map(tag => (
                                                <span key={tag} className="px-2 py-1 bg-accent1/10 text-accent1 text-xs rounded border border-accent1/20 flex items-center gap-1">
                                                    {tag}
                                                    <button onClick={() => removeTag(tag)} className="hover:text-white">×</button>
                                                </span>
                                            ))}
                                        </div>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={tempTag}
                                                onChange={(e) => setTempTag(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && addTag()}
                                                className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-white focus:border-accent1 outline-none"
                                                placeholder="Add tag + Enter"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Date, Location & Contact */}
                        {currentStep === 2 && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Start Date & Time</label>
                                        <input
                                            type="datetime-local"
                                            value={formData.startDate}
                                            onChange={(e) => updateForm("startDate", e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-accent1 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Display Date String</label>
                                        <input
                                            type="text"
                                            value={formData.date}
                                            onChange={(e) => updateForm("date", e.target.value)}
                                            placeholder="e.g. Jan 15-17, 2026"
                                            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-accent1 outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Contact Email</label>
                                        <input
                                            type="email"
                                            value={formData.organizerEmail || ""}
                                            onChange={(e) => updateForm("organizerEmail", e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-accent1 outline-none"
                                            placeholder="public-contact@example.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Contact Phone (Optional)</label>
                                        <input
                                            type="tel"
                                            value={formData.organizerPhone || ""}
                                            onChange={(e) => updateForm("organizerPhone", e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-accent1 outline-none"
                                            placeholder="+1 234 567 8900"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Event Mode</label>
                                    <div className="flex gap-4">
                                        {['Offline', 'Online'].map((mode) => (
                                            <button
                                                key={mode}
                                                onClick={() => updateForm("mode", mode)}
                                                className={cn(
                                                    "flex-1 p-4 rounded-xl border-2 transition-all",
                                                    formData.mode === mode
                                                        ? "bg-accent1/10 border-accent1 text-white"
                                                        : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                                                )}
                                            >
                                                <span className="font-bold">{mode}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {formData.mode === 'Offline' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Venue Address</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                            <input
                                                type="text"
                                                value={formData.venue}
                                                onChange={(e) => updateForm("venue", e.target.value)}
                                                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 pl-10 text-white focus:border-accent1 outline-none"
                                                placeholder="e.g. Moscone Center, San Francisco"
                                            />
                                        </div>
                                    </div>
                                )}

                                {formData.mode === 'Offline' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Pin Location on Map</label>
                                        <VenuePicker
                                            value={formData.coords && formData.coords.x ? formData.coords : null}
                                            onChange={(coords) => updateForm("coords", coords)}
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 3: Registration Rules */}
                        {currentStep === 3 && (
                            <div className="space-y-6">
                                {/* Registration Type Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Registration Type</label>
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => updateForm("registrationType", "individual")}
                                            className={cn(
                                                "flex-1 p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2",
                                                formData.registrationType === "individual"
                                                    ? "bg-accent1/10 border-accent1 text-white"
                                                    : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                                            )}
                                        >
                                            <UsersIcon className="w-6 h-6" />
                                            <span className="font-bold">Individual</span>
                                            <span className="text-xs opacity-70">Single participant entry</span>
                                        </button>
                                        <button
                                            onClick={() => updateForm("registrationType", "team")}
                                            className={cn(
                                                "flex-1 p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2",
                                                formData.registrationType === "team"
                                                    ? "bg-accent1/10 border-accent1 text-white"
                                                    : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                                            )}
                                        >
                                            <Users className="w-6 h-6" />
                                            <span className="font-bold">Team</span>
                                            <span className="text-xs opacity-70">Team based participation</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">
                                            {formData.registrationType === 'individual' ? "Max Participants" : "Max Teams"}
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.registrationType === 'individual' ? (formData.maxParticipants || "") : (formData.maxTeams || "")}
                                            onChange={(e) => {
                                                const val = e.target.value === "" ? 0 : parseInt(e.target.value);
                                                if (formData.registrationType === 'individual') {
                                                    updateForm("maxParticipants", val);
                                                } else {
                                                    updateForm("maxTeams", val);
                                                }
                                            }}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-accent1 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Deadline</label>
                                        <input
                                            type="datetime-local"
                                            value={formData.registrationDeadline}
                                            onChange={(e) => updateForm("registrationDeadline", e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-accent1 outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Registration Fee (0 = Free)</label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                            <input
                                                type="number"
                                                min={0}
                                                step="0.01"
                                                value={formData.registrationFee ?? 0}
                                                onChange={(e) => updateForm("registrationFee", e.target.value === "" ? 0 : parseFloat(e.target.value))}
                                                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 pl-9 text-white focus:border-accent1 outline-none"
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <p className="text-[11px] text-gray-500 mt-2">Paid events will require a Transaction ID during registration.</p>
                                    </div>
                                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center">
                                        <div className="text-xs text-gray-400">
                                            <div className="font-bold text-white mb-1">Organizer Verification</div>
                                            Registrations for paid events stay <span className="text-accent1 font-bold">pending</span> until you approve them after checking the transaction.
                                        </div>
                                    </div>
                                </div>

                                {formData.registrationType === 'team' && (
                                    <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Team Size Limits</label>
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1">
                                                <span className="text-xs text-gray-500 mb-1 block">Min Members</span>
                                                <input
                                                    type="number"
                                                    value={formData.teamSize?.min || ""}
                                                    onChange={(e) => updateForm("teamSize", { ...formData.teamSize, min: e.target.value === "" ? 0 : parseInt(e.target.value) })}
                                                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-accent1 outline-none"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <span className="text-xs text-gray-500 mb-1 block">Max Members</span>
                                                <input
                                                    type="number"
                                                    value={formData.teamSize?.max || ""}
                                                    onChange={(e) => updateForm("teamSize", { ...formData.teamSize, max: e.target.value === "" ? 0 : parseInt(e.target.value) })}
                                                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-accent1 outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-bold text-white flex items-center gap-2">
                                                <Code className="w-4 h-4 text-accent1" /> Online Judge Integration
                                            </h4>
                                            <p className="text-sm text-gray-400 mt-1">
                                                Enable automated problem evaluation
                                            </p>
                                        </div>
                                        <div
                                            className={cn(
                                                "w-12 h-6 rounded-full p-1 cursor-pointer transition-colors",
                                                formData.hasOnlineJudge ? "bg-accent1" : "bg-gray-700"
                                            )}
                                            onClick={() => updateForm("hasOnlineJudge", !formData.hasOnlineJudge)}
                                        >
                                            <div className={cn(
                                                "w-4 h-4 rounded-full bg-white transition-transform",
                                                formData.hasOnlineJudge ? "translate-x-6" : "translate-x-0"
                                            )} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Prizes */}
                        {currentStep === 4 && (
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Prize Pool</label>
                                    <div className="space-y-3">
                                        {formData.prizes?.map((prize, idx) => (
                                            <div key={idx} className="flex gap-2">
                                                <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center text-yellow-500 font-bold border border-yellow-500/30">
                                                    {idx + 1}
                                                </div>
                                                <input
                                                    type="text"
                                                    value={prize}
                                                    onChange={(e) => updatePrize(idx, e.target.value)}
                                                    className="flex-1 bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-accent1 outline-none"
                                                    placeholder={`${idx === 0 ? '1st' : idx === 1 ? '2nd' : '3rd'} Place Prize`}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-start gap-4">
                                    <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400 mt-1">
                                        <DollarSign className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white mb-1">Looking for Sponsors?</h4>
                                        <p className="text-sm text-gray-300 mb-4">
                                            Your event details match with 3 active sponsorship opportunities.
                                            Publish your event to start accepting proposals.
                                        </p>
                                        <button className="text-xs font-bold uppercase tracking-wider text-blue-400 hover:text-white transition-colors">
                                            View Opportunities →
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 5: Review */}
                        {currentStep === 5 && (
                            <div className="space-y-6">
                                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                    <h3 className="text-xl font-bold text-white mb-1">{formData.title}</h3>
                                    <p className="text-accent1 text-sm mb-4">{formData.category} • {formData.mode}</p>

                                    <p className="text-gray-300 mb-6">{formData.description}</p>

                                    <div className="grid grid-cols-2 gap-y-4 text-sm">
                                        <div>
                                            <span className="text-gray-500 block">Date</span>
                                            <span className="text-white">{formData.date}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 block">Participants</span>
                                            <span className="text-white">Max {formData.maxParticipants}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 block">Venue</span>
                                            <span className="text-white">{formData.venue || "TBD"}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 block">Prizes</span>
                                            <span className="text-white">{formData.prizes?.filter(p => p).join(", ")}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-sm text-yellow-200">
                                    <Upload className="w-5 h-5" />
                                    Once published, this event will be visible to all participants and sponsors.
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Footer / Actions */}
            <div className="border-t border-white/10 p-6 bg-white/5 flex justify-between items-center">
                <button
                    onClick={handleBack}
                    disabled={currentStep === 1}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:text-gray-400 transition-colors"
                >
                    <ChevronLeft className="w-4 h-4" /> Back
                </button>

                <div className="flex gap-2">
                    <button
                        onClick={handleNext}
                        className="flex items-center gap-2 px-8 py-3 bg-accent1 text-black rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-white transition-all shadow-[0_0_20px_rgba(0,229,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]"
                    >
                        {currentStep === STEPS.length ? "Publish Event" : "Next Step"}
                        {currentStep !== STEPS.length && <ChevronRight className="w-4 h-4" />}
                    </button>
                </div>
            </div>
        </div>
    );
}
