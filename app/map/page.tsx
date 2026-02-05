import { VenueMap } from "@/components/features/VenueMap";
import { Navbar } from "@/components/ui/Navbar";

export default function MapPage() {
    return (
        <div className="min-h-screen bg-black">
            <Navbar />
            <div className="pt-24 pb-12">
                <div className="max-w-7xl mx-auto px-6 mb-8 text-center">
                    <h1 className="text-4xl font-bold text-white">Venue <span className="text-accent1">Map</span></h1>
                    <p className="text-gray-400">Navigate the arena.</p>
                </div>
                <div className="max-w-7xl mx-auto px-6">
                    <VenueMap />
                </div>
            </div>
        </div>
    );
}
