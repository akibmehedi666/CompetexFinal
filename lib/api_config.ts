export const API_BASE_URL = "http://localhost/Competex/api";

export const ENDPOINTS = {
    SIGNUP: `${API_BASE_URL}/signup.php`,
    LOGIN: `${API_BASE_URL}/login.php`,
    GET_NOTIFICATIONS: `${API_BASE_URL}/get_notifications.php`,
    GET_EVENTS: `${API_BASE_URL}/get_events.php`,
    GET_ALL_EVENTS: `${API_BASE_URL}/get_events.php?scope=all`,
    GET_EVENT: (eventId: string) => `${API_BASE_URL}/get_event.php?event_id=${eventId}`,
    GET_EVENT_LEADERBOARD: (eventId: string) => `${API_BASE_URL}/get_event_leaderboard.php?event_id=${eventId}`,
    CREATE_TEAM: `${API_BASE_URL}/create_team.php`,
    GET_TEAMS: `${API_BASE_URL}/get_teams.php`,
    REQUEST_JOIN: `${API_BASE_URL}/request_join.php`,
    RESPOND_REQUEST: `${API_BASE_URL}/respond_request.php`, // { request_id, action: 'accept'|'reject', leader_id }
    GET_TEAM_REQUESTS: (teamId: string) => `${API_BASE_URL}/get_team_requests.php?team_id=${teamId}`,
    REMOVE_TEAM_MEMBER: `${API_BASE_URL}/remove_team_member.php`,
    REQUEST_EVENT_JOIN: `${API_BASE_URL}/request_event_join.php`,
    SUBMIT_EVENT_REGISTRATION: `${API_BASE_URL}/submit_event_registration.php`,
    GET_TEAM_EVENT_STATUS: `${API_BASE_URL}/get_team_event_status.php`,
    GET_EVENT_REQUESTS: (eventId: string) => `${API_BASE_URL}/get_event_requests.php?event_id=${eventId}`,
    RESPOND_EVENT_REQUEST: `${API_BASE_URL}/respond_event_request.php`,
    GET_ORGANIZER_EVENTS: (organizerId: string) => `${API_BASE_URL}/get_organizer_events_with_requests.php?organizer_id=${organizerId}`,
    GET_EVENT_PARTICIPANTS: (eventId: string) => `${API_BASE_URL}/get_event_participants.php?event_id=${eventId}`,
    GET_USER_EVENT_STATUS: `${API_BASE_URL}/get_user_event_status.php`,
    GET_USER_TEAMS_FOR_EVENTS: (userId: string) => `${API_BASE_URL}/get_user_teams_for_events.php?user_id=${userId}`,
    GET_SPONSORS: `${API_BASE_URL}/get_sponsors.php`,
    SEND_SPONSORSHIP_REQUEST: `${API_BASE_URL}/send_sponsorship_request.php`,
    GET_SPONSOR_SPONSORSHIP_REQUESTS: (sponsorUserId: string, status?: string) =>
        `${API_BASE_URL}/get_sponsor_sponsorship_requests.php?sponsor_user_id=${sponsorUserId}${status ? `&status=${encodeURIComponent(status)}` : ""}`,
    RESPOND_SPONSORSHIP_REQUEST_SPONSOR: `${API_BASE_URL}/respond_sponsorship_request_sponsor.php`,
    GET_ORGANIZER_SENT_SPONSORSHIP_REQUESTS: (organizerId: string) =>
        `${API_BASE_URL}/get_organizer_sent_sponsorship_requests.php?organizer_id=${organizerId}`,

    CHECK_EVENT_OWNERSHIP: (eventId: string, organizerId: string) =>
        `${API_BASE_URL}/check_event_ownership.php?event_id=${encodeURIComponent(eventId)}&organizer_id=${encodeURIComponent(organizerId)}`,
    GET_LEADERBOARD_FOR_EDIT: (eventId: string, organizerId: string) =>
        `${API_BASE_URL}/get_leaderboard_for_edit.php?event_id=${encodeURIComponent(eventId)}&organizer_id=${encodeURIComponent(organizerId)}`,
    UPDATE_LEADERBOARD: `${API_BASE_URL}/update_leaderboard.php`,

    GET_RECRUITMENT_SCOUT_DATA: (recruiterId: string) =>
        `${API_BASE_URL}/get_recruitment_scout_data.php?recruiter_id=${encodeURIComponent(recruiterId)}`,
    CREATE_JOB_POSTING: `${API_BASE_URL}/create_job_posting.php`,
    GET_JOB_POSTINGS: `${API_BASE_URL}/get_job_postings.php`,
    GET_JOB_POSTING: (jobId: string) => `${API_BASE_URL}/get_job_posting.php?job_id=${encodeURIComponent(jobId)}`,
    GET_RECRUITER_JOB_POSTINGS: (recruiterId: string) =>
        `${API_BASE_URL}/get_recruiter_job_postings.php?recruiter_id=${encodeURIComponent(recruiterId)}`,
    APPLY_JOB: `${API_BASE_URL}/apply_job.php`,
    GET_JOB_APPLICANTS: (jobId: string, recruiterId: string) =>
        `${API_BASE_URL}/get_job_applicants.php?job_id=${encodeURIComponent(jobId)}&recruiter_id=${encodeURIComponent(recruiterId)}`,
    GET_USER_APPLIED_JOBS: (userId: string) =>
        `${API_BASE_URL}/get_user_applied_jobs.php?user_id=${encodeURIComponent(userId)}`,

    GET_MENTORS: `${API_BASE_URL}/get_mentors.php`,
    GET_MENTOR: (mentorProfileId: string) =>
        `${API_BASE_URL}/get_mentor.php?mentor_profile_id=${encodeURIComponent(mentorProfileId)}`,
    CREATE_MENTORSHIP_REQUEST: `${API_BASE_URL}/create_mentorship_request.php`,
    GET_MENTOR_REQUESTS: (mentorUserId: string, status?: string) =>
        `${API_BASE_URL}/get_mentor_requests.php?mentor_user_id=${encodeURIComponent(mentorUserId)}${status ? `&status=${encodeURIComponent(status)}` : ""}`,
    RESPOND_MENTORSHIP_REQUEST: `${API_BASE_URL}/respond_mentorship_request.php`,
    GET_MENTOR_SESSIONS: (mentorUserId: string) =>
        `${API_BASE_URL}/get_mentor_sessions.php?mentor_user_id=${encodeURIComponent(mentorUserId)}`,
    UPDATE_MENTORSHIP_SESSION: `${API_BASE_URL}/update_mentorship_session.php`,

    GET_RESOURCES: (scope: "free" | "premium" | "all" = "free") =>
        `${API_BASE_URL}/get_resources.php?scope=${encodeURIComponent(scope)}`,
    UPLOAD_RESOURCE: `${API_BASE_URL}/upload_resource.php`,
    DOWNLOAD_RESOURCE: (resourceId: string) =>
        `${API_BASE_URL}/download_resource.php?resource_id=${encodeURIComponent(resourceId)}`,

    GET_INSTITUTIONS: `${API_BASE_URL}/get_institutions.php`,
    GET_INSTITUTION: (institutionId: string) =>
        `${API_BASE_URL}/get_institution.php?institution_id=${encodeURIComponent(institutionId)}`,
    GET_INSTITUTION_EVENT_REVIEWS: (institutionId: string) =>
        `${API_BASE_URL}/get_institution_event_reviews.php?institution_id=${encodeURIComponent(institutionId)}`,

    GET_EVENT_REVIEWS: (eventId: string, viewerId?: string, limit?: number) =>
        `${API_BASE_URL}/get_event_reviews.php?event_id=${encodeURIComponent(eventId)}${viewerId ? `&viewer_id=${encodeURIComponent(viewerId)}` : ""}${typeof limit === "number" ? `&limit=${encodeURIComponent(String(limit))}` : ""}`,
    SUBMIT_EVENT_REVIEW: `${API_BASE_URL}/submit_event_review.php`,
    GET_USER_REVIEWABLE_EVENTS: (userId: string) =>
        `${API_BASE_URL}/get_user_reviewable_events.php?user_id=${encodeURIComponent(userId)}`,
};
