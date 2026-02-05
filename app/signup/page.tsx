"use client";

import { Navbar } from "@/components/ui/Navbar";
import { SignupForm } from "@/components/auth/SignupForm";

export default function SignupPage() {
    return (
        <div className="min-h-screen pt-24 pb-12 bg-black selection:bg-accent1/30 flex flex-col items-center justify-center">
            <Navbar />
            <div className="w-full max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[80vh]">
                <SignupForm />
            </div>
        </div>
    );
}
