"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ENDPOINTS } from "@/lib/api_config";
import { Navbar } from "@/components/ui/Navbar";
import { Calendar, MapPin, Users, Flag, Clock, ArrowLeft, CheckCircle, Star } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { CountdownTimer } from "@/components/ui/CountdownTimer";
import { useStore } from "@/store/useStore";
import { TeamSelectionModal } from "@/components/teams/TeamSelectionModal";
import { Event } from "@/types";
import { EventRegistrationModal } from "@/components/events/EventRegistrationModal";

export default function EventDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [event, setEvent] = useState<Event | null>(null);
    const [isRegistered, setIsRegistered] = useState(false);
    const [loading, setLoading] = useState(true);
    const { currentUser, initAuth } = useStore();

    // Unified Enrollment State
    const [userStatus, setUserStatus] = useState<{
        is_enrolled: boolean,
        request_status: 'pending' | 'approved' | 'rejected' | null,
        enrollment_type: 'individual' | 'team' | null,
        team_details: any | null
    }>({ is_enrolled: false, request_status: null, enrollment_type: null, team_details: null });

    const [checkingStatus, setCheckingStatus] = useState(false);
    const [joinLoading, setJoinLoading] = useState(false);
    const [teams, setTeams] = useState<any[]>([]); // Keep this for "Join as Team" dropdown
    const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
    const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
    const [registrationTeamId, setRegistrationTeamId] = useState<string | null>(null);

    const [reviewMeta, setReviewMeta] = useState<{
        avg_rating: number;
        rating_count: number;
        event_completed: boolean;
        viewer_registered: boolean | null;
        viewer_has_review: boolean | null;
        viewer_can_review: boolean | null;
        reviews: any[];
    } | null>(null);
    const [reviewLoading, setReviewLoading] = useState(false);
    const [reviewSubmitting, setReviewSubmitting] = useState(false);
    const [myRating, setMyRating] = useState<number>(0);
    const [myReview, setMyReview] = useState<string>("");

    useEffect(() => {
        initAuth();
    }, [initAuth]);

    useEffect(() => {
        const fetchEvent = async () => {
            const eventId = Array.isArray(params.id) ? params.id[0] : params.id;
            if (!eventId) return;
            setLoading(true);

            try {
                const res = await fetch(ENDPOINTS.GET_EVENT(eventId));
                const data = await res.json();
                if (data.status === "success" && data.event) {
                    setEvent(data.event);
                } else {
                    setEvent(null);
                }
            } catch (error) {
                console.error("Failed to fetch event details", error);
                setEvent(null);
            } finally {
                setLoading(false);
            }
        };

        fetchEvent();
    }, [params.id]);

    useEffect(() => {
        const loadReviews = async () => {
            if (!event?.id) return;
            setReviewLoading(true);
            try {
                const res = await fetch(ENDPOINTS.GET_EVENT_REVIEWS(event.id, currentUser?.id, 5));
                const data = await res.json();
                if (data?.status === "success" && data.data) {
                    setReviewMeta({
                        avg_rating: Number(data.data.avg_rating || 0),
                        rating_count: Number(data.data.rating_count || 0),
                        event_completed: Boolean(data.data.event_completed),
                        viewer_registered: data.data.viewer_registered === null ? null : Boolean(data.data.viewer_registered),
                        viewer_has_review: data.data.viewer_has_review === null ? null : Boolean(data.data.viewer_has_review),
                        viewer_can_review: data.data.viewer_can_review === null ? null : Boolean(data.data.viewer_can_review),
                        reviews: Array.isArray(data.data.reviews) ? data.data.reviews : []
                    });
                } else {
                    setReviewMeta(null);
                }
            } catch (e) {
                console.error(e);
                setReviewMeta(null);
            } finally {
                setReviewLoading(false);
            }
        };
        loadReviews();
    }, [event?.id, currentUser?.id]);

    useEffect(() => {
        if (!event || !currentUser) return;
        fetchUserTeams();
        checkUserStatus(event.id);
    }, [event, currentUser]);

    const fetchUserTeams = async () => {
        if (!currentUser || currentUser.role !== 'Participant') return;
        try {
            const res = await fetch(`${ENDPOINTS.GET_TEAMS}?user_id=${currentUser.id}`);
            const data = await res.json();
            const allTeams = Array.isArray(data) ? data : (data.data || []);
            // Filter teams where current user is leader
            const leaderTeams = allTeams.filter((t: any) => t.leaderId === currentUser.id);
            setTeams(leaderTeams);
        } catch (error) {
            console.error("Failed to fetch teams", error);
        }
    };

    const checkUserStatus = async (eventId: string) => {
        if (!currentUser) return;
        setCheckingStatus(true);
        try {
            const res = await fetch(`${ENDPOINTS.GET_USER_EVENT_STATUS}?event_id=${eventId}&user_id=${currentUser.id}`);
            const data = await res.json();

            if (data.status === 'success') {
                setUserStatus({
                    is_enrolled: data.is_enrolled,
                    request_status: data.request_status,
                    enrollment_type: data.enrollment_type,
                    team_details: data.team_details
                });
            }
        } catch (error) {
            console.error("Failed to check status", error);
        } finally {
            setCheckingStatus(false);
        }
    };



    const handleRegister = async () => {
        if (!currentUser) {
            toast.error("Please login to register!");
            router.push("/login");
            return;
        }

        setRegistrationTeamId(null);
        setIsRegistrationModalOpen(true);
    };

    const handleTeamJoinClick = () => {
        if (!currentUser) return;

        // Use the teams fetched during status check
        if (teams.length === 0) {
            toast.error("You must lead a team to join as a team.");
            return;
        }

        if (teams.length === 1) {
            // Only 1 team, join directly
            setRegistrationTeamId(teams[0].id);
            setIsRegistrationModalOpen(true);
        } else {
            // Multiple teams, open modal
            setIsTeamModalOpen(true);
        }
    };

    const handleModalSelect = async (teamId: string) => {
        setIsTeamModalOpen(false);
        setRegistrationTeamId(teamId);
        setIsRegistrationModalOpen(true);
    };

    if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading Event...</div>;
    if (!event) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Event not found.</div>;

    const displayDate = event.date || new Date(event.startDate).toLocaleDateString();
    const eventStatusLabel = event.status === "Upcoming" ? "Open" : event.status === "Ended" ? "Closed" : event.status;
    const rules = event.rules ? [event.rules] : [];
    const timeline = [
        ...(event.registrationDeadline ? [{ title: "Registration Deadline", date: new Date(event.registrationDeadline).toLocaleString() }] : []),
        ...(event.startDate ? [{ title: "Event Start", date: new Date(event.startDate).toLocaleString() }] : [])
    ];
    const locationAddress = event.venue || (event.mode === "Online" ? "Online" : "Venue TBA");

    return (
        <div className="min-h-screen bg-black pt-24 pb-12 selection:bg-accent1/30">
            <Navbar />

            {/* Team Selection Modal */}
            <TeamSelectionModal
                isOpen={isTeamModalOpen}
                onClose={() => setIsTeamModalOpen(false)}
                teams={teams}
                onSelect={handleModalSelect}
                isLoading={false}
            />

            {event && currentUser && (
                <EventRegistrationModal
                    isOpen={isRegistrationModalOpen}
                    onClose={() => setIsRegistrationModalOpen(false)}
                    event={event}
                    currentUser={currentUser}
                    teamId={registrationTeamId}
                    onSubmitted={() => {
                        setUserStatus(prev => ({
                            ...prev,
                            request_status: 'pending',
                            enrollment_type: registrationTeamId ? 'team' : 'individual'
                        }));
                        checkUserStatus(event.id);
                    }}
                />
            )}

            <div className='max-w-7xl mx-auto px-6'>
                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Events
                </button>

                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12"
                >
                    {/* Main Image & Info */}
                    <div className="lg:col-span-2 relative rounded-2xl overflow-hidden border border-white/10 group">
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
                        {event.image ? (
                            <img src={event.image} alt={event.title} className="w-full h-96 object-cover group-hover:scale-105 transition-transform duration-700" />
                        ) : (
                            <div className="w-full h-96 bg-gradient-to-br from-white/10 via-black to-black" />
                        )}

                        <div className="absolute bottom-6 left-6 z-20">
                            <div className="flex gap-2 mb-3">
                                <span className="px-3 py-1 bg-accent1 text-black font-bold uppercase text-xs rounded-sm">
                                    {event.category}
                                </span>
                                {event.organizer && (
                                    event.organizerId ? (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); router.push(`/people/${event.organizerId}`); }}
                                            className="px-3 py-1 bg-white/10 text-white font-bold uppercase text-xs rounded-sm hover:bg-white/20 transition-colors flex items-center gap-1"
                                        >
                                            by {event.organizer}
                                        </button>
                                    ) : (
                                        <span className="px-3 py-1 bg-white/10 text-white font-bold uppercase text-xs rounded-sm">
                                            by {event.organizer}
                                        </span>
                                    )
                                )}
                                <span className={cn(
                                    "px-3 py-1 font-bold uppercase text-xs rounded-sm text-white",
                                    eventStatusLabel === "Open" ? "bg-green-600" : "bg-red-600"
                                )}>
                                    {eventStatusLabel}
                                </span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{event.title}</h1>

                            <div className="mb-6">
                            <CountdownTimer targetDate={event.startDate} status={event.status} size="lg" />
                            </div>

                            <div className="flex items-center gap-6 text-gray-300">
                                <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-accent1" /> {locationAddress}</span>
                                <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-accent1" /> {displayDate}</span>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Action Column */}
                    <div className="space-y-6">
                        {/* Participation Status Card */}
                        {userStatus.is_enrolled ? (
                            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                                <h3 className="text-xl font-bold text-white mb-4">Your Participation</h3>
                                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl mb-4">
                                    <div className="flex items-center gap-3 mb-2">
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                        <span className="text-green-400 font-bold">Enrolled Successfully</span>
                                    </div>
                                    <p className="text-sm text-gray-400">
                                        You are registered for {event.title} as {userStatus.enrollment_type === 'team' ? 'a team member' : 'an individual'}.
                                    </p>
                                </div>

                                {userStatus.enrollment_type === 'team' && userStatus.team_details && (
                                    <div className="mt-4">
                                        <h4 className="text-sm font-bold text-gray-300 mb-2">Participating Team</h4>
                                        <div
                                            onClick={() => router.push(`/teams/${userStatus.team_details?.id}`)}
                                            className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg cursor-pointer transition-colors group"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-accent1/20 flex items-center justify-center text-accent1 font-bold">
                                                {userStatus.team_details.name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="text-white font-bold group-hover:text-accent1 transition-colors">{userStatus.team_details.name}</div>
                                                <div className="text-xs text-gray-500">Click to view details</div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                                <h3 className="text-xl font-bold text-white mb-4">Registration</h3>
                                <div className="flex justify-between text-sm text-gray-400 mb-4">
                                    <span>Status</span>
                                    <span className={cn(
                                        "font-bold",
                                        eventStatusLabel === "Open" ? "text-green-500" : "text-red-500"
                                    )}>{eventStatusLabel}</span>
                                </div>

                                {(!currentUser || currentUser.role === 'Participant') ? (
                                    <div className="space-y-3">
                                        {/* Individual Registration */}
                                        {(event.registrationType === 'individual' || !event.registrationType) && (
                                            <>
                                                {userStatus.request_status === 'pending' ? (
                                                    <div className="w-full py-3 bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 font-bold uppercase tracking-widest rounded-lg text-center text-sm flex items-center justify-center gap-2">
                                                        <Clock className="w-4 h-4" /> Request Pending
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={handleRegister}
                                                        disabled={joinLoading || eventStatusLabel === "Closed"}
                                                        className={cn(
                                                            "w-full py-3 text-black font-bold uppercase tracking-widest rounded-lg transition-all text-sm",
                                                            eventStatusLabel === "Closed"
                                                                ? "bg-gray-600 cursor-not-allowed"
                                                                : "bg-accent1 hover:bg-white hover:shadow-[0_0_20px_#00E5FF]"
                                                        )}
                                                    >
                                                        {joinLoading ? "Sending..." : "Register Individually"}
                                                    </button>
                                                )}
                                            </>
                                        )}

                                        {/* Team Join Option */}
                                        {currentUser && event.registrationType === 'team' && (
                                            <div className="mt-2">
                                                {userStatus.request_status === 'pending' ? (
                                                    <div className="w-full py-3 bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 font-bold uppercase tracking-widest rounded-lg text-center text-sm flex items-center justify-center gap-2">
                                                        <Clock className="w-4 h-4" /> Request Pending
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={handleTeamJoinClick}
                                                        disabled={joinLoading || eventStatusLabel === "Closed"}
                                                        className="w-full py-3 bg-white/5 border border-white/10 text-white hover:bg-white/10 font-bold uppercase tracking-widest rounded-lg transition-all text-sm"
                                                    >
                                                        {joinLoading ? "Sending Request..." : "Join as Team"}
                                                    </button>
                                                )}
                                            </div>
                                        )}

                                    </div>
                                ) : (
                                    <div className="w-full py-3 bg-white/5 border border-white/10 text-gray-400 font-bold uppercase tracking-widest rounded-lg text-center text-xs">
                                        Participants Only
                                    </div>
                                )}

                                <p className="text-xs text-gray-500 mt-4 text-center">
                                    Registration closes on {new Date(event.startDate).toLocaleDateString()}
                                </p>
                            </div>
                        )}
                    </div>

                </motion.div>

                {/* Details & Rules */}
                {/* Details & Rules */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                    {/* Rules */}
                    <div className="md:col-span-2 space-y-8">
                        <Section title="Description" content={event.description} />

                        {rules.length > 0 && (
                            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <Flag className="w-5 h-5 text-accent1" /> Rules & Guidelines
                                </h3>
                                <ul className="space-y-3">
                                    {rules.map((rule, i) => (
                                        <li key={i} className="flex gap-3 text-gray-300">
                                            <span className="w-1.5 h-1.5 rounded-full bg-accent1 mt-2 flex-shrink-0" />
                                            {rule}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {reviewMeta?.event_completed && (
                            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                                <div className="flex items-start justify-between gap-4 mb-4">
                                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                        <Star className="w-5 h-5 text-yellow-400" /> Ratings & Reviews
                                    </h3>
                                    <div className="text-right">
                                        <div className="text-sm text-gray-300 font-bold">{reviewMeta.avg_rating.toFixed(1)} / 5</div>
                                        <div className="text-xs text-gray-500">{reviewMeta.rating_count} reviews</div>
                                    </div>
                                </div>

                                {reviewLoading ? (
                                    <div className="text-gray-500 text-sm">Loading reviews...</div>
                                ) : (
                                    <div className="space-y-3">
                                        {reviewMeta.reviews.length === 0 ? (
                                            <div className="text-gray-500 text-sm">No reviews yet.</div>
                                        ) : (
                                            reviewMeta.reviews.map((r: any) => (
                                                <div key={r.id} className="bg-black/30 border border-white/10 rounded-xl p-4">
                                                    <div className="flex items-center justify-between gap-3">
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            <img
                                                                src={r.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(r.user_id || "u")}`}
                                                                alt={r.name || "User"}
                                                                className="w-8 h-8 rounded-full border border-white/10 bg-black/40"
                                                            />
                                                            <div className="min-w-0">
                                                                <div className="text-sm font-bold text-white truncate">{r.name || "User"}</div>
                                                                <div className="text-xs text-gray-500">{r.created_at}</div>
                                                            </div>
                                                        </div>
                                                        <div className="text-xs text-yellow-300 font-bold">{r.rating}★</div>
                                                    </div>
                                                    {r.review && (
                                                        <div className="text-sm text-gray-300 mt-3 whitespace-pre-wrap">{r.review}</div>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}

                                <div className="mt-6 pt-6 border-t border-white/10">
                                    {reviewMeta.viewer_has_review ? (
                                        <div className="text-sm text-green-300 font-bold">You already submitted a review for this event.</div>
                                    ) : !currentUser ? (
                                        <div className="text-sm text-gray-400">Login to submit a rating and review.</div>
                                    ) : reviewMeta.viewer_can_review ? (
                                        <div className="space-y-4">
                                            <div>
                                                <div className="text-sm font-bold text-gray-300 mb-2">Your Rating</div>
                                                <div className="flex items-center gap-2">
                                                    {[1, 2, 3, 4, 5].map((n) => (
                                                        <button
                                                            key={n}
                                                            onClick={() => setMyRating(n)}
                                                            className={cn(
                                                                "w-9 h-9 rounded-lg border flex items-center justify-center transition-colors",
                                                                myRating >= n
                                                                    ? "bg-yellow-500/20 border-yellow-500/40 text-yellow-300"
                                                                    : "bg-black/30 border-white/10 text-gray-500 hover:text-gray-300 hover:border-white/20"
                                                            )}
                                                            aria-label={`Rate ${n}`}
                                                            type="button"
                                                        >
                                                            ★
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-gray-300 mb-2">Your Review (optional)</div>
                                                <textarea
                                                    value={myReview}
                                                    onChange={(e) => setMyReview(e.target.value)}
                                                    rows={4}
                                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-accent1 outline-none"
                                                    placeholder="Share feedback about the event..."
                                                />
                                            </div>
                                            <button
                                                onClick={async () => {
                                                    if (!event?.id || !currentUser?.id) return;
                                                    if (myRating < 1 || myRating > 5) {
                                                        toast.error("Please select a rating (1-5).");
                                                        return;
                                                    }
                                                    setReviewSubmitting(true);
                                                    try {
                                                        const res = await fetch(ENDPOINTS.SUBMIT_EVENT_REVIEW, {
                                                            method: "POST",
                                                            headers: { "Content-Type": "application/json" },
                                                            body: JSON.stringify({
                                                                event_id: event.id,
                                                                user_id: currentUser.id,
                                                                rating: myRating,
                                                                review: myReview
                                                            })
                                                        });
                                                        const data = await res.json().catch(() => null);
                                                        if (res.ok && data?.status === "success") {
                                                            toast.success("Review submitted");
                                                            setReviewMeta((prev) => prev ? ({ ...prev, viewer_has_review: true, viewer_can_review: false }) : prev);
                                                            return;
                                                        }
                                                        if (res.status === 409) {
                                                            toast.success("Already reviewed");
                                                            setReviewMeta((prev) => prev ? ({ ...prev, viewer_has_review: true, viewer_can_review: false }) : prev);
                                                            return;
                                                        }
                                                        toast.error(data?.message || "Failed to submit review");
                                                    } catch (e) {
                                                        console.error(e);
                                                        toast.error("Network error submitting review");
                                                    } finally {
                                                        setReviewSubmitting(false);
                                                    }
                                                }}
                                                disabled={reviewSubmitting}
                                                className="w-full md:w-auto px-6 py-3 bg-accent1 text-black font-bold uppercase tracking-wider rounded-xl hover:bg-white transition-colors disabled:opacity-70"
                                            >
                                                {reviewSubmitting ? "Submitting..." : "Submit Review"}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="text-sm text-gray-400">
                                            Only users registered for this event can submit a rating and review.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Live Leaderboard */}
                        {/* Live Leaderboard Removed as per request */}
                        {/* <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Trophy className="w-5 h-5 text-accent2" /> Live Leaderboard
                                </h3>
                                <button
                                    onClick={() => router.push(`/leaderboard/${event.id}`)}
                                    className="text-xs font-bold uppercase tracking-widest text-accent1 hover:text-white transition-colors flex items-center gap-1"
                                >
                                    View Full Standings <ArrowLeft className="w-3 h-3 rotate-180" />
                                </button>
                            </div>
                            <EventLeaderboard leaderboard={event.leaderboard || []} />
                        </div> */}
                    </div>

                    {/* Timeline & Participants */}
                    <div>
                        {/* Participants List */}
                        <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <Users className="w-5 h-5 text-accent1" /> Participants
                            </h3>
                            <ParticipantsList eventId={event.id} />
                        </div>

                        {timeline.length > 0 && (
                            <div className="bg-white/5 border border-white/10 rounded-xl p-6 sticky top-24">
                                <h3 className="text-xl font-bold text-white mb-6">Event Timeline</h3>
                                <div className="space-y-6 relative pl-2">
                                    <div className="absolute top-2 left-[5px] w-0.5 h-[80%] bg-white/10" />
                                    {timeline.map((step, i) => (
                                        <div key={i} className="relative flex gap-4">
                                            <div className="w-3 h-3 rounded-full bg-accent1 mt-1.5 relative z-10 shadow-[0_0_10px_#00E5FF]" />
                                            <div>
                                                <div className="text-white font-bold">{step.title}</div>
                                                <div className="text-sm text-gray-400">{step.date}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}

function Section({ title, content }: { title: string, content: string }) {
    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
            <p className="text-gray-300 leading-relaxed">{content}</p>
        </div>
    );
}

function StatItem({ label, value, icon: Icon }: { label: string, value: string, icon: any }) {
    return (
        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
            <div className="flex items-center gap-3 text-gray-400">
                <Icon className="w-4 h-4" />
                <span className="text-sm">{label}</span>
            </div>
            <span className="text-white font-bold">{value}</span>
        </div>
    );
}

function ParticipantsList({ eventId }: { eventId: string }) {
    const [participants, setParticipants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchParticipants = async () => {
            try {
                const res = await fetch(ENDPOINTS.GET_EVENT_PARTICIPANTS(eventId));
                const data = await res.json();
                if (data.status === 'success') {
                    setParticipants(data.data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchParticipants();
    }, [eventId]);

    if (loading) return <div className="text-gray-500 text-sm">Loading...</div>;

    if (participants.length === 0) return <div className="text-gray-500 text-sm">No participants yet.</div>;

    return (
        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
            {participants.map((p, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-white/5 border border-white/5">
                    <div className="w-8 h-8 rounded-full bg-accent1/20 flex items-center justify-center text-accent1 font-bold text-xs border border-accent1/30">
                        {p.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                        <div className="text-white font-bold text-sm">{p.name}</div>
                        <div className="text-[10px] text-gray-400 bg-white/10 px-1.5 py-0.5 rounded inline-block">
                            {p.type === 'team' ? `Team • Leader: ${p.leader_name}` : 'Individual'}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
