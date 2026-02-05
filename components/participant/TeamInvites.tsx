"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Check, X, Shield, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface TeamInvitesProps {
    userId?: string;
}

export function TeamInvites({ userId }: TeamInvitesProps) {
    const [invites, setInvites] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);

    useEffect(() => {
        if (userId) {
            fetchInvites();
        } else {
            setLoading(false);
        }
    }, [userId]);

    const fetchInvites = async () => {
        try {
            const res = await fetch(`http://localhost/Competex/api/get_team_invites.php?user_id=${userId}`);
            const data = await res.json();
            if (data.status === 'success') {
                setInvites(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch invites:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleResponse = async (invitationId: string, response: 'accept' | 'reject') => {
        setProcessing(invitationId);
        try {
            const res = await fetch('http://localhost/Competex/api/respond_invitation.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    invitation_id: invitationId,
                    response: response
                })
            });
            const data = await res.json();

            if (data.status === 'success') {
                toast.success(response === 'accept' ? "Invitation accepted!" : "Invitation declined");
                // Remove from list
                setInvites(prev => prev.filter(inv => inv.invitation_id !== invitationId));
            } else {
                toast.error(data.message || "Failed to process request");
            }
        } catch (error) {
            toast.error("Network error");
        } finally {
            setProcessing(null);
        }
    };

    if (loading) {
        return (
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 flex justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
            </div>
        );
    }

    if (invites.length === 0) {
        return (
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-3">
                    <Users className="w-6 h-6 text-gray-500" />
                </div>
                <h3 className="text-white font-bold mb-1">No Pending Invites</h3>
                <p className="text-gray-400 text-sm">Join a team or wait for invitations!</p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 border border-white/10 rounded-xl p-6"
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-accent1" /> Team Invites
                </h3>
                <span className="bg-accent1/20 text-accent1 text-xs font-bold px-2 py-1 rounded-full border border-accent1/30">
                    {invites.length} New
                </span>
            </div>

            <div className="space-y-3">
                {invites.map((invite, i) => (
                    <motion.div
                        key={invite.invitation_id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-black/40 border border-white/5 rounded-lg p-3 hover:bg-white/5 transition-colors"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h4 className="font-bold text-white text-sm">{invite.team_name}</h4>
                                <p className="text-xs text-gray-400">{invite.event_title || "General Team"}</p>
                                <p className="text-[10px] text-gray-500 mt-1">From: {invite.sender_name}</p>
                            </div>
                            <span className="text-[10px] bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2 py-0.5 rounded uppercase font-bold">
                                Pending
                            </span>
                        </div>

                        <div className="flex gap-2 mt-3">
                            <button
                                onClick={() => handleResponse(invite.invitation_id, 'accept')}
                                disabled={processing === invite.invitation_id}
                                className="flex-1 bg-accent1 text-black text-xs font-bold py-1.5 rounded hover:bg-white transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                            >
                                {processing === invite.invitation_id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />} Accept
                            </button>
                            <button
                                onClick={() => handleResponse(invite.invitation_id, 'reject')}
                                disabled={processing === invite.invitation_id}
                                className="px-3 bg-white/5 text-gray-400 hover:text-white hover:bg-red-500/20 text-xs font-bold py-1.5 rounded transition-colors flex items-center justify-center disabled:opacity-50"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}
