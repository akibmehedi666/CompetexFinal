"use client";

import dynamic from 'next/dynamic';

export const ResponsiveContainer = dynamic(
    () => import('recharts').then((mod) => mod.ResponsiveContainer),
    { ssr: false }
);

export const RadarChart = dynamic(
    () => import('recharts').then((mod) => mod.RadarChart),
    { ssr: false }
);

export const BarChart = dynamic(
    () => import('recharts').then((mod) => mod.BarChart),
    { ssr: false }
);
