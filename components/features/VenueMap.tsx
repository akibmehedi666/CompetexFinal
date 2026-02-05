"use client";

import { useEffect, useState } from "react";
import { MapPin, Calendar, Users, ExternalLink } from "lucide-react";
import dynamic from "next/dynamic";

// Dynamically import map components to avoid SSR issues
const MapContainer = dynamic(
    () => import("react-leaflet").then((mod) => mod.MapContainer),
    { ssr: false }
) as any;
const TileLayer = dynamic(
    () => import("react-leaflet").then((mod) => mod.TileLayer),
    { ssr: false }
) as any;
const Marker = dynamic(
    () => import("react-leaflet").then((mod) => mod.Marker),
    { ssr: false }
) as any;
const Popup = dynamic(
    () => import("react-leaflet").then((mod) => mod.Popup),
    { ssr: false }
) as any;

// Event locations with coordinates
const EVENT_LOCATIONS = [
    {
        id: "uiu-hackathon",
        name: "United International University",
        shortName: "UIU",
        position: [23.8759, 90.3795] as [number, number], // UIU Dhaka coordinates
        event: {
            title: "UIU Tech Fest 2026",
            date: "Feb 15-17, 2026",
            category: "Hackathon",
            participants: 250,
            status: "upcoming" as const
        }
    },
    {
        id: "buet-robotics",
        name: "Bangladesh University of Engineering and Technology",
        shortName: "BUET",
        position: [23.7272, 90.3920] as [number, number],
        event: {
            title: "BUET Robotics Challenge",
            date: "Mar 5-7, 2026",
            category: "Robotics",
            participants: 180,
            status: "upcoming" as const
        }
    },
    {
        id: "du-debate",
        name: "University of Dhaka",
        shortName: "DU",
        position: [23.7359, 90.3936] as [number, number],
        event: {
            title: "DU Inter-University Debate",
            date: "Feb 28, 2026",
            category: "Debate",
            participants: 120,
            status: "upcoming" as const
        }
    }
];

export function VenueMap() {
    const [mounted, setMounted] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

    useEffect(() => {
        setMounted(true);

        // Import Leaflet CSS
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
        link.crossOrigin = "";
        document.head.appendChild(link);

        // Fix for default marker icon
        if (typeof window !== "undefined") {
            const L = require("leaflet");
            delete (L.Icon.Default.prototype as any)._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
                iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
                shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
            });
        }

        return () => {
            document.head.removeChild(link);
        };
    }, []);

    if (!mounted) {
        return (
            <div className="relative w-full h-[600px] bg-[#050505] rounded-xl border border-white/10 overflow-hidden flex items-center justify-center">
                <div className="text-gray-500">Loading map...</div>
            </div>
        );
    }

    return (
        <div className="relative w-full">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h3 className="text-2xl font-bold text-white flex items-center gap-2 mb-2">
                        <MapPin className="text-accent1" /> Live Venue Map
                    </h3>
                    <p className="text-gray-400 text-sm">Explore upcoming events across Dhaka universities</p>
                </div>
            </div>

            {/* Map Container */}
            <div className="relative w-full h-[600px] rounded-xl overflow-hidden border border-white/10 shadow-2xl">
                <MapContainer
                    center={[23.8103, 90.4125] as [number, number]} // Dhaka center
                    zoom={12}
                    style={{ height: "100%", width: "100%" }}
                    className="z-0"
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {EVENT_LOCATIONS.map((location) => (
                        <Marker
                            key={location.id}
                            position={location.position}
                            eventHandlers={{
                                click: () => setSelectedLocation(location.id)
                            }}
                        >
                            <Popup className="custom-popup">
                                <div className="p-2 min-w-[200px]">
                                    <h4 className="font-bold text-sm mb-1">{location.shortName}</h4>
                                    <p className="text-xs text-gray-600 mb-3">{location.name}</p>

                                    <div className="bg-blue-50 rounded-lg p-3 mb-2">
                                        <div className="font-bold text-sm text-blue-900 mb-1">
                                            {location.event.title}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                                            <Calendar className="w-3 h-3" />
                                            {location.event.date}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-600">
                                            <Users className="w-3 h-3" />
                                            {location.event.participants} participants
                                        </div>
                                    </div>

                                    <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">
                                        {location.event.category}
                                    </span>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>

            {/* Event Cards Below Map */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                {EVENT_LOCATIONS.map((location) => (
                    <div
                        key={location.id}
                        onClick={() => setSelectedLocation(location.id)}
                        className={`group relative bg-white/5 border rounded-xl p-6 transition-all cursor-pointer hover:shadow-[0_0_30px_rgba(0,229,255,0.2)] ${selectedLocation === location.id
                            ? "border-accent1 shadow-[0_0_20px_rgba(0,229,255,0.3)]"
                            : "border-white/10 hover:border-accent1/50"
                            }`}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 bg-accent1/10 rounded-full flex items-center justify-center">
                                <MapPin className="w-6 h-6 text-accent1" />
                            </div>
                            <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-full border border-green-500/30">
                                UPCOMING
                            </span>
                        </div>

                        <h4 className="text-lg font-bold text-white mb-1">{location.shortName}</h4>
                        <p className="text-xs text-gray-500 mb-4">{location.name}</p>

                        <div className="space-y-2 mb-4">
                            <div className="text-sm font-bold text-accent1">{location.event.title}</div>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                <Calendar className="w-3 h-3" />
                                {location.event.date}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                <Users className="w-3 h-3" />
                                {location.event.participants} participants registered
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="px-3 py-1 bg-white/5 border border-white/10 text-gray-400 text-xs rounded-md">
                                {location.event.category}
                            </span>
                            <button className="ml-auto p-2 bg-accent1/10 hover:bg-accent1/20 rounded-lg transition-colors">
                                <ExternalLink className="w-4 h-4 text-accent1" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
