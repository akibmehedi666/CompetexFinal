import { Hero } from "@/components/ui/Hero";
import { FeaturesShowcase } from "@/components/ui/FeaturesShowcase";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Hero />
      <FeaturesShowcase />

      {/* Footer */}
      <footer className="relative w-full py-6 border-t border-white/10 text-center text-gray-500 text-xs bg-black">
        <p>© 2026 CompeteX. The Future of Competition.</p>
      </footer>
    </div>
  );
}
