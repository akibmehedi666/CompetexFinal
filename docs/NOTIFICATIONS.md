# Competex Notifications (Database-Driven)

Notifications are stored in the `notifications` table and surfaced via `api/get_notifications.php`.

## Types (stored in `notifications.type`)

### Teams
- `invite` — receiver gets a team invitation (action required).
- `invite_result` — sender gets invite accepted/rejected.
- `team_join_request` — team leader gets a join request (action required).
- `team_join_request_result` — requester gets accepted/rejected.

### Events
- `event_registration` — organizer gets a new registration request (action required).
- `event_registration_result` — participant/team leader gets approved/rejected.
- `event_join_request` — organizer gets a join request (action required).

### Sponsorship
- `sponsorship_request` — sponsor gets organizer’s request (action required).
- `sponsorship_request_result` — organizer gets accepted/rejected.

### Jobs
- `job_application` — recruiter gets a new application.

### Mentorship
- `mentorship_request` — mentor gets a request (action required).
- `mentorship_request_result` — participant gets accepted/rejected.
- `mentorship_session_update` — participant gets session updates (schedule/status/link).

## Where notifications are triggered (API)

- Team invites: `api/invite_participant.php`, `api/respond_invitation.php`
- Team join requests: `api/request_join.php`, `api/respond_request.php`
- Event registration flow: `api/submit_event_registration.php`, `api/respond_event_request.php`
- Event join requests: `api/request_event_join.php`
- Sponsorship requests: `api/send_sponsorship_request.php`, `api/respond_sponsorship_request_sponsor.php`
- Job applications: `api/apply_job.php`
- Mentorship: `api/create_mentorship_request.php`, `api/respond_mentorship_request.php`, `api/update_mentorship_session.php`

## Central helpers

Use `api/lib/notifications.php` for consistent ID generation, inserts, and “mark read” behavior.

