"use client";

import { Navbar } from "@/components/ui/Navbar";
import { RatingSystem } from "@/components/features/RatingSystem";

export default function RatingPage() {
    return (
        <div className="min-h-screen pt-24 px-6 max-w-6xl mx-auto pb-20 flex flex-col justify-center">
            <Navbar />
            <RatingSystem />
        </div>
    );
}
