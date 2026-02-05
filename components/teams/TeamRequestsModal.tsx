"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, XCircle, Loader2, User } from "lucide-react";
import { ENDPOINTS } from "@/lib/api_config";
import { useStore } from "@/store/useStore";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Request {
    request_id: string;
    user_id: string;
    user_name: string;
    user_avatar: string;
    user_skills: string[];
    created_at: string;
}

interface TeamRequestsModalProps {
    teamId: string;
    isOpen: boolean;
    onClose: () => void;
    currentMembers: any[]; // Using any[] for simplicity or import User type if available
}

export function TeamRequestsModal({ teamId, isOpen, onClose, currentMembers }: TeamRequestsModalProps) {
    const { currentUser } = useStore();
    const [requests, setRequests] = useState<Request[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const [activeTab, setActiveTab] = useState<'requests' | 'members'>('requests');

    useEffect(() => {
        if (!isOpen) return;

        const fetchRequests = async () => {
            try {
                const res = await fetch(ENDPOINTS.GET_TEAM_REQUESTS(teamId));
                const data = await res.json();
                if (Array.isArray(data)) {
                    setRequests(data);
                }
            } catch (err) {
                console.error("Failed to fetch requests", err);
            } finally {
                setLoading(false);
            }
        };

        fetchRequests();
    }, [isOpen, teamId]);

    const handleAction = async (requestId: string, action: 'accept' | 'reject') => {
        if (!currentUser) return;
        setActionLoading(requestId);

        try {
            const res = await fetch(ENDPOINTS.RESPOND_REQUEST, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    request_id: requestId,
                    action,
                    leader_id: currentUser.id
                })
            });
            const data = await res.json();

            if (data.status === 'success') {
                toast.success(`Request ${action}ed`);
                setRequests(prev => prev.filter(r => r.request_id !== requestId));
                if (action === 'accept') {
                    window.location.reload();
                }
            } else {
                toast.error(data.message);
            }
        } catch (err) {
            toast.error("Action failed");
        } finally {
            setActionLoading(null);
        }
    };

    const handleRemoveMember = async (memberId: string) => {
        if (!currentUser) return;
        if (!confirm("Are you sure you want to remove this member?")) return;

        setActionLoading(memberId);
        try {
            const res = await fetch(ENDPOINTS.REMOVE_TEAM_MEMBER, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    team_id: teamId,
                    user_id: memberId,
                    leader_id: currentUser.id
                })
            });
            const data = await res.json();

            if (data.status === 'success') {
                toast.success("Member removed");
                window.location.reload();
            } else {
                toast.error(data.message);
            }
        } catch (err) {
            toast.error("Failed to remove member");
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-y-auto"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden pointer-events-auto">
                            <div className="p-6 border-b border-white/10 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-white">Manage Team</h2>
                                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>

                            {/* Tabs */}
                            <div className="flex border-b border-white/10">
                                <button
                                    onClick={() => setActiveTab('requests')}
                                    className={cn(
                                        "flex-1 py-3 text-sm font-medium transition-colors relative",
                                        activeTab === 'requests' ? "text-white" : "text-gray-500 hover:text-gray-300"
                                    )}
                                >
                                    Requests
                                    {requests.length > 0 && (
                                        <span className="ml-2 px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-xs">
                                            {requests.length}
                                        </span>
                                    )}
                                    {activeTab === 'requests' && (
                                        <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
                                    )}
                                </button>
                                <button
                                    onClick={() => setActiveTab('members')}
                                    className={cn(
                                        "flex-1 py-3 text-sm font-medium transition-colors relative",
                                        activeTab === 'members' ? "text-white" : "text-gray-500 hover:text-gray-300"
                                    )}
                                >
                                    Members
                                    <span className="ml-2 px-1.5 py-0.5 rounded-full bg-gray-500/20 text-gray-400 text-xs">
                                        {currentMembers.length}
                                    </span>
                                    {activeTab === 'members' && (
                                        <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500" />
                                    )}
                                </button>
                            </div>

                            <div className="p-6 max-h-[60vh] overflow-y-auto">
                                {activeTab === 'requests' ? (
                                    loading ? (
                                        <div className="flex justify-center py-8">
                                            <Loader2 className="w-8 h-8 animate-spin text-accent1" />
                                        </div>
                                    ) : requests.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500">
                                            <User className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                            No pending requests
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {requests.map(req => (
                                                <div key={req.request_id} className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                                                            {req.user_avatar ? (
                                                                <img src={req.user_avatar} alt={req.user_name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <span className="text-white font-bold">{req.user_name.charAt(0)}</span>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="text-white font-medium">{req.user_name}</p>
                                                            <div className="flex gap-2 text-xs text-gray-400">
                                                                {req.user_skills.slice(0, 3).map(s => (
                                                                    <span key={s}>{s}</span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleAction(req.request_id, 'accept')}
                                                            disabled={!!actionLoading}
                                                            className="p-2 rounded-lg bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 transition-all"
                                                            title="Accept"
                                                        >
                                                            {actionLoading === req.request_id ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                                                        </button>
                                                        <button
                                                            onClick={() => handleAction(req.request_id, 'reject')}
                                                            disabled={!!actionLoading}
                                                            className="p-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all"
                                                            title="Reject"
                                                        >
                                                            <XCircle className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )
                                ) : (
                                    <div className="space-y-4">
                                        {currentMembers.map(member => (
                                            <div key={member.id} className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                                                        {member.avatar ? (
                                                            <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="text-white font-bold">{member.name.charAt(0)}</span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-medium">
                                                            {member.name}
                                                            {member.id === currentUser?.id && <span className="ml-2 text-xs text-blue-400">(You)</span>}
                                                        </p>
                                                        <p className="text-xs text-gray-400">{member.role || 'Member'}</p>
                                                    </div>
                                                </div>

                                                {member.id !== currentUser?.id && (
                                                    <button
                                                        onClick={() => handleRemoveMember(member.id)}
                                                        disabled={!!actionLoading}
                                                        className="p-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all text-sm px-3"
                                                    >
                                                        {actionLoading === member.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Remove"}
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
