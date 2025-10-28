export const EmailTriggers = {
    NOTIFICATION_PREF_UPDATED: 'notification_preferences_updated',
    SPECIALIST_READY: 'specialist_ready',
    PROJECT_OFFER: 'project_offer',
    SELECTED_PERFORMER: 'selected_performer',
    PROJECT_REJECTED: 'project_rejected',
    PROJECT_COMPLETION: 'project_completion_confirmation',
    EVALUATE_INTERACTION: 'evaluate_interaction',
    REVIEW_REQUEST_PAST: 'review_request_past_clients',
    SPECIALIST_REVIEW: 'specialist_review_notification',
    BUG_FEEDBACK: 'bug_feedback',
    PARTNER_APPLICATION: 'partner_application',
    PARTNER_APPROVED: 'partner_approved',
    INVITE_CONNECTION: 'invite_connection',
}

export const triggerOptions = Object.entries(EmailTriggers).map(([k, v]) => ({
    label: k.replace(/_/g, ' ').toLowerCase(), value: v
}));