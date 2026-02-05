"use client";

import { motion } from "framer-motion";
import { Users, Briefcase, GraduationCap } from "lucide-react";
import { ResponsiveContainer, BarChart } from "./ChartWrappers";
import { Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from "recharts";

const data = [
    { name: 'Developers', value: 65, color: '#8b5cf6' }, // Purple
    { name: 'Designers', value: 20, color: '#ec4899' }, // Pink
    { name: 'Managers', value: 10, color: '#eab308' }, // Yellow
    { name: 'Students', value: 5, color: '#22c55e' }, // Green
];

export function DemographicsChart() {
    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 h-full">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" /> Audience Demographics
            </h3>

            <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                        <XAxis type="number" stroke="#666" fontSize={12} />
                        <YAxis dataKey="name" type="category" stroke="#999" fontSize={12} width={80} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#000', border: '1px solid #333' }}
                            itemStyle={{ color: '#fff' }}
                            cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                        />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-white/5 rounded-lg p-3 flex items-center gap-3">
                    <div className="bg-purple-500/20 p-2 rounded-lg text-purple-400">
                        <Briefcase className="w-4 h-4" />
                    </div>
                    <div>
                        <div className="text-white font-bold">65%</div>
                        <div className="text-[10px] text-gray-400 uppercase">Developers</div>
                    </div>
                </div>
                <div className="bg-white/5 rounded-lg p-3 flex items-center gap-3">
                    <div className="bg-green-500/20 p-2 rounded-lg text-green-400">
                        <GraduationCap className="w-4 h-4" />
                    </div>
                    <div>
                        <div className="text-white font-bold">35%</div>
                        <div className="text-[10px] text-gray-400 uppercase">Students</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
