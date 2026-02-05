"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { X, Bell, Clock, AlertCircle, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { ENDPOINTS } from "@/lib/api_config";
import { useStore } from "@/store/useStore";
import { toast } from "sonner";

interface NotificationsDropdownProps {
    onClose: () => void;
}

export function NotificationsDropdown({ onClose }: NotificationsDropdownProps) {
    const { currentUser } = useStore();
    const [notifications, setNotifications] = useState<Array<{
        id: string;
        title: string;
        message: string;
        createdAt: string;
        read: boolean;
        type: "info" | "success" | "warning" | "alert";
        notifType?: string;
        referenceId?: string | null;
    }>>([]);
    const [loading, setLoading] = useState(true);
    const [processingInviteId, setProcessingInviteId] = useState<string | null>(null);

    type ApiNotificationItem = {
        id?: string | number;
        title?: string;
        content?: string;
        message?: string;
        priority?: string;
        created_at?: string;
        is_read?: string | number | boolean;
        notif_type?: string;
        reference_id?: string | null;
    };

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const url = currentUser?.id
                    ? `${ENDPOINTS.GET_NOTIFICATIONS}?user_id=${encodeURIComponent(currentUser.id)}`
                    : ENDPOINTS.GET_NOTIFICATIONS;
                const res = await fetch(url);
                const data = await res.json();

                if (data.status === "success" && Array.isArray(data.data)) {
                    const mapped = (data.data as ApiNotificationItem[]).map((item) => {
                        const priority = String(item.priority || "medium").toLowerCase();
                        const type =
                            priority === "urgent"
                                ? "alert"
                                : priority === "high"
                                    ? "warning"
                                    : priority === "low"
                                        ? "success"
                                        : "info";

                        return {
                            id: String(item.id),
                            title: String(item.title || "Notification"),
                            message: String(item.content || item.message || ""),
                            createdAt: String(item.created_at || ""),
                            read: Boolean(Number(item.is_read || 0)),
                            type,
                            notifType: item.notif_type ? String(item.notif_type) : undefined,
                            referenceId: item.reference_id ?? null
                        };
                    });
                    setNotifications(mapped);
                } else {
                    setNotifications([]);
                }
            } catch (error) {
                console.error("Failed to fetch notifications", error);
                setNotifications([]);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, [currentUser?.id]);

    const unreadCount = useMemo(
        () => notifications.filter(n => !n.read).length,
        [notifications]
    );

    const respondInvite = async (invitationId: string, action: "accept" | "reject") => {
        setProcessingInviteId(invitationId);
        try {
            const res = await fetch("http://localhost/Competex/api/respond_invitation.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    invitation_id: invitationId,
                    response: action
                })
            });
            const data = await res.json();
            if (data.status === "success") {
                toast.success(action === "accept" ? "Invitation accepted!" : "Invitation rejected.");
                setNotifications(prev =>
                    prev.filter(n => String(n.referenceId || "") !== invitationId)
                );
            } else {
                toast.error(data.message || "Failed to process invitation");
            }
        } catch {
            toast.error("Network error processing invitation");
        } finally {
            setProcessingInviteId(null);
        }
    };

    const formatTimeAgo = (timestamp: string) => {
        if (!timestamp) return "Just now";
        const now = Date.now();
        const then = new Date(timestamp).getTime();
        if (Number.isNaN(then)) return "Just now";
        const diffSeconds = Math.max(0, Math.floor((now - then) / 1000));
        if (diffSeconds < 60) return "Just now";
        const diffMinutes = Math.floor(diffSeconds / 60);
        if (diffMinutes < 60) return `${diffMinutes} min ago`;
        const diffHours = Math.floor(diffMinutes / 60);
        if (diffHours < 24) return `${diffHours} hr ago`;
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="absolute top-full right-0 mt-4 w-[380px] bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden z-50"
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/5">
                <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-accent1" />
                    <span className="font-bold text-white text-sm">Notifications</span>
                    <span className="bg-accent1/20 text-accent1 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {unreadCount} New
                    </span>
                </div>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-white/10 rounded-full transition-colors"
                >
                    <X className="w-4 h-4 text-gray-400 hover:text-white" />
                </button>
            </div>

            {/* List */}
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                {loading && (
                    <div className="p-4 text-xs text-gray-500">Loading notifications...</div>
                )}
                {!loading && notifications.length === 0 && (
                    <div className="p-4 text-xs text-gray-500">No notifications yet.</div>
                )}
                {!loading && notifications.map((notification) => (
                    <div
                        key={notification.id}
                        className={cn(
                            "p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group relative",
                            !notification.read ? "bg-accent1/5" : ""
                        )}
                    >
                        <div className="flex gap-3">
                            <div className={cn(
                                "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1",
                                notification.type === 'success' && "bg-green-500/20 text-green-400",
                                notification.type === 'info' && "bg-blue-500/20 text-blue-400",
                                notification.type === 'warning' && "bg-amber-500/20 text-amber-400",
                                notification.type === 'alert' && "bg-red-500/20 text-red-400",
                            )}>
                                {notification.type === 'success' && <CheckCircle2 className="w-4 h-4" />}
                                {notification.type === 'info' && <Info className="w-4 h-4" />}
                                {notification.type === 'warning' && <AlertCircle className="w-4 h-4" />}
                                {notification.type === 'alert' && <Bell className="w-4 h-4" />}
                            </div>

                            <div className="flex-1">
                                <h4 className={cn("text-sm font-semibold mb-1", !notification.read ? "text-white" : "text-gray-300")}>
                                    {notification.title}
                                </h4>
                                <p className="text-xs text-gray-400 leading-relaxed mb-2">
                                    {notification.message}
                                </p>
                                {notification.notifType === "invite" && notification.referenceId && (
                                    <div className="flex gap-2 mb-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                respondInvite(String(notification.referenceId), "accept");
                                            }}
                                            disabled={processingInviteId === String(notification.referenceId)}
                                            className="px-3 py-1 rounded bg-accent1 text-black text-[10px] font-bold uppercase tracking-widest disabled:opacity-50"
                                        >
                                            Accept
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                respondInvite(String(notification.referenceId), "reject");
                                            }}
                                            disabled={processingInviteId === String(notification.referenceId)}
                                            className="px-3 py-1 rounded bg-white/5 border border-white/10 text-gray-300 text-[10px] font-bold uppercase tracking-widest hover:bg-red-500/20 hover:border-red-500/20 hover:text-white disabled:opacity-50"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                )}
                                <div className="flex items-center gap-1 text-[10px] text-gray-500 font-medium">
                                    <Clock className="w-3 h-3" /> {formatTimeAgo(notification.createdAt)}
                                </div>
                            </div>

                            {!notification.read && (
                                <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-accent1 shadow-[0_0_8px_#00E5FF]" />
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-white/5 bg-white/5 text-center">
                <button
                    onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
                    className="text-xs font-bold text-gray-400 hover:text-white transition-colors uppercase tracking-wider"
                >
                    Mark all as read
                </button>
            </div>
        </motion.div>
    );
}
