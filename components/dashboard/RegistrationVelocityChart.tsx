"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const DATA = [
    { name: 'Mon', value: 40 },
    { name: 'Tue', value: 75 },
    { name: 'Wed', value: 120 },
    { name: 'Thu', value: 90 },
    { name: 'Fri', value: 150 },
    { name: 'Sat', value: 180 },
    { name: 'Sun', value: 240 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-black/80 border border-white/10 p-3 rounded-lg backdrop-blur-md shadow-xl">
                <p className="text-gray-400 text-xs mb-1">{label}</p>
                <p className="text-accent1 font-bold text-lg">
                    +{payload[0].value} <span className="text-xs text-gray-500 font-normal">Signups</span>
                </p>
            </div>
        );
    }
    return null;
};

export function RegistrationVelocityChart() {
    return (
        <div className="w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={DATA}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#00f0ff" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis
                        dataKey="name"
                        stroke="#666"
                        tick={{ fill: '#666', fontSize: 10 }}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="#666"
                        tick={{ fill: '#666', fontSize: 10 }}
                        tickLine={false}
                        axisLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />
                    <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#00f0ff"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorValue)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
