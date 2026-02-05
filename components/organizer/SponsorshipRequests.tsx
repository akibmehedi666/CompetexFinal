"use client";

import { motion } from "framer-motion";
import { DollarSign, Eye, CheckCircle, XCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function SponsorshipRequests() {
    const requests = [
        { id: 1, company: "TechCorp", amount: "$5,000", event: "CyberHack 2025", status: "Pending", time: "2h ago" },
        { id: 2, company: "InnovateLabs", amount: "$2,500", event: "CyberHack 2025", status: "Reviewing", time: "5h ago" },
        { id: 3, company: "CloudSystems", amount: "$10,000", event: "AI Summit", status: "Action Required", time: "1d ago" }
    ];

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-green-400" /> Sponsorship Requests
                    </h3>
                    <p className="text-gray-400 text-xs mt-1">Manage incoming funding proposals</p>
                </div>
                <button className="text-xs font-bold text-green-400 hover:text-green-300 flex items-center gap-1">
                    View All <ArrowRight className="w-3 h-3" />
                </button>
            </div>

            <div className="space-y-4">
                {requests.map((req, i) => (
                    <motion.div
                        key={req.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-black/40 border border-white/5 rounded-xl p-4 flex items-center justify-between hover:bg-white/5 transition-colors group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-lg font-bold text-white">
                                {req.company[0]}
                            </div>
                            <div>
                                <h4 className="font-bold text-white text-sm">{req.company}</h4>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <span>{req.event}</span>
                                    <span className="w-1 h-1 rounded-full bg-gray-600" />
                                    <span>{req.time}</span>
                                </div>
                            </div>
                        </div>

                        <div className="text-right flex items-center gap-4">
                            <div>
                                <div className="text-green-400 font-mono font-bold">{req.amount}</div>
                                <div className={cn(
                                    "text-[10px] font-bold uppercase",
                                    req.status === "Action Required" ? "text-red-400" : "text-yellow-400"
                                )}>
                                    {req.status}
                                </div>
                            </div>

                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500 hover:text-white transition-colors">
                                    <CheckCircle className="w-4 h-4" />
                                </button>
                                <button className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-colors">
                                    <XCircle className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
                <span>Total Potential Funding</span>
                <span className="text-white font-bold">$17,500</span>
            </div>
        </div>
    );
}
