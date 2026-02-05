import { BentoGrid } from "@/components/ui/BentoGrid";
import { Navbar } from "@/components/ui/Navbar";

export default function EventsPage() {
    return (
        <div className="min-h-screen bg-black">
            <Navbar />
            <div className="pt-24 pb-12">
                <BentoGrid />
            </div>
        </div>
    );
}
