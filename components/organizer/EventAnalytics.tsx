"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { Users, TrendingUp, Calendar, ArrowUpRight, ArrowDownRight, Award, Star, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

const DAILY_STATS = [
    { name: 'Mon', signups: 12, views: 140 },
    { name: 'Tue', signups: 18, views: 220 },
    { name: 'Wed', signups: 15, views: 180 },
    { name: 'Thu', signups: 25, views: 300 },
    { name: 'Fri', signups: 32, views: 350 },
    { name: 'Sat', signups: 45, views: 450 },
    { name: 'Sun', signups: 38, views: 400 },
];

const CATEGORY_STATS = [
    { name: "Students", value: 65, color: "#ADFF00" },
    { name: "Professionals", value: 25, color: "#00E5FF" },
    { name: "Others", value: 10, color: "#B026FF" },
];

const RATING_DISTRIBUTION = [
    { name: "5 Star", value: 45, color: "#10B981" },
    { name: "4 Star", value: 30, color: "#3B82F6" },
    { name: "3 Star", value: 15, color: "#F59E0B" },
    { name: "2 Star", value: 5, color: "#EF4444" },
    { name: "1 Star", value: 5, color: "#6B7280" },
];

export function EventAnalytics() {
    return (
        <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <KPICard
                    label="Total Registrations"
                    value="1,248"
                    change="+12.5%"
                    trend="up"
                    icon={Users}
                />
                <KPICard
                    label="Organizer Reputation"
                    value="98/100"
                    change="+2.4%"
                    trend="up"
                    icon={Award}
                    color="text-yellow-400"
                />
                <KPICard
                    label="Avg Event Rating"
                    value="4.8"
                    change="+0.2"
                    trend="up"
                    icon={Star}
                    subtext="Based on 45 reviews"
                />
                <KPICard
                    label="Net Promoter Score"
                    value="+72"
                    subtext="Excellent"
                    icon={TrendingUp}
                    color="text-accent1"
                />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Main Velocity Chart */}
                <div className="md:col-span-2 bg-white/5 border border-white/10 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-white">Registration Velocity & Views</h3>
                        <select className="bg-black/30 border border-white/10 rounded-lg px-3 py-1 text-xs text-gray-400 focus:outline-none">
                            <option>Last 7 Days</option>
                            <option>Last 30 Days</option>
                        </select>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={DAILY_STATS}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    stroke="#525252"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#525252"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `${value}`}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: "#171717", borderColor: "#333", borderRadius: "8px", color: "#fff" }}
                                    itemStyle={{ color: "#ccc" }}
                                    cursor={{ stroke: "#ffffff20" }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="signups"
                                    stroke="#ADFF00"
                                    strokeWidth={3}
                                    dot={{ fill: "#ADFF00", r: 4, strokeWidth: 0 }}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="views"
                                    stroke="#00E5FF"
                                    strokeWidth={3}
                                    strokeOpacity={0.5}
                                    dot={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Ratings & Feedback */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col">
                    <h3 className="font-bold text-white mb-6">Feedback Summary</h3>

                    <div className="flex-1 flex flex-col justify-center">
                        <div className="flex items-center justify-center mb-6">
                            <div className="text-center">
                                <div className="text-5xl font-bold text-white font-mono">4.8</div>
                                <div className="flex gap-1 justify-center my-2">
                                    {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-4 h-4 text-yellow-500 fill-yellow-500" />)}
                                </div>
                                <div className="text-sm text-gray-500">128 Reviews</div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {RATING_DISTRIBUTION.map((item) => (
                                <div key={item.name} className="flex items-center gap-3 text-sm">
                                    <span className="text-gray-400 w-12">{item.name}</span>
                                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full"
                                            style={{ width: `${item.value}%`, backgroundColor: item.color }}
                                        />
                                    </div>
                                    <span className="text-gray-500 text-xs w-8 text-right">{item.value}%</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button className="w-full mt-6 py-3 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-bold text-white transition-colors flex items-center justify-center gap-2">
                        <MessageSquare className="w-4 h-4" /> View All Reviews
                    </button>
                </div>
            </div>

            {/* Demographics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <h3 className="font-bold text-white mb-6">Participant Demographics</h3>
                    <div className="space-y-6">
                        {CATEGORY_STATS.map((item) => (
                            <div key={item.name}>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-400">{item.name}</span>
                                    <span className="text-white font-bold">{item.value}%</span>
                                </div>
                                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-1000"
                                        style={{ width: `${item.value}%`, backgroundColor: item.color }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <h3 className="font-bold text-white mb-6">Geographic Reach</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <StatBox label="Universities" value="45" />
                        <StatBox label="Cities" value="12" />
                        <StatBox label="Countries" value="3" />
                        <StatBox label="Local Reach" value="85%" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function KPICard({ label, value, change, trend, subtext, icon: Icon, color }: any) {
    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-colors">
            <div className="flex justify-between items-start mb-4">
                <div className={cn("p-2 bg-white/5 rounded-lg text-gray-400", color && color.replace('text-', 'text-opacity-80 text-'))}>
                    <Icon className={cn("w-5 h-5", color || "text-gray-400")} />
                </div>
                {change && (
                    <div className={cn(
                        "flex items-center text-xs font-bold px-2 py-1 rounded-full",
                        trend === "up" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                    )}>
                        {trend === "up" ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                        {change}
                    </div>
                )}
            </div>
            <div>
                <div className="text-2xl font-bold text-white mb-1 font-mono">{value}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">{label}</div>
                {subtext && <div className="text-xs text-gray-600 mt-1">{subtext}</div>}
            </div>
        </div>
    );
}

function StatBox({ label, value }: { label: string, value: string }) {
    return (
        <div className="bg-black/40 rounded-lg p-4 border border-white/5 flex flex-col justify-center">
            <div className="text-2xl font-bold text-white font-mono">{value}</div>
            <div className="text-[10px] text-gray-500 uppercase mt-1">{label}</div>
        </div>
    );
}
