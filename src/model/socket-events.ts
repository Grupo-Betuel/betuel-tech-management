export enum WhatsappEvents {
    ON_LOADING = 'ws-loading',
    ON_QR = 'ws-qr',
    ON_READY = 'ws-ready',
    ON_AUTH_SUCCESS = 'ws-auth-success',
    ON_AUTH_FAILED = 'ws-auth-failure',
    ON_LOGOUT = 'ws-logged-out',
    ON_END_MESSAGE = 'ws-messages-end',
    ON_SENT_MESSAGE = 'ws-message-sent',
    ON_FAILED_MESSAGE = 'ws-messages-failed',
}

export enum EcommerceEvents {
    ON_PUBLISHING = 'ecommerce-publishing',
    ON_PUBLISHED = 'ecommerce-item-published',
    ON_COMPLETED = 'ecommerce-completed',
    ON_FAILED = 'ecommerce-failed',
}

export enum ScheduleEvents {
    EMIT_RUNNING = 'schedule-running',
    EMIT_STOPPED = 'schedule-stopped',
    EMIT_FAILED = 'schedule-failed',
}
