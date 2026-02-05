import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/ui/Navbar";
import { Toaster } from "sonner";
import NextTopLoader from 'nextjs-toploader';
import { cn } from "@/lib/utils";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "CompeteX | National Event Platform",
  description: "The All-in-One Platform for Events & Competitions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={cn(outfit.className, "bg-background text-foreground min-h-screen selection:bg-accent1/30")}>
        <NextTopLoader color="#00E5FF" height={3} showSpinner={false} />
        <Navbar />
        <main className="relative z-10">
          {children}
        </main>
        <div className="fixed inset-0 -z-10 bg-[url('/grid.svg')] opacity-10 pointer-events-none" />
        <div className="fixed top-0 left-0 -z-10 w-[500px] h-[500px] bg-accent1/20 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2" />
        <div className="fixed bottom-0 right-0 -z-10 w-[500px] h-[500px] bg-accent2/10 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2" />
        <Toaster richColors position="bottom-right" theme="dark" />
      </body>
    </html>
  );
}
