export enum WhatsappEvents {
    ON_LOADING = 'loading',
    ON_QR = 'qr',
    ON_READY = 'ready',
    ON_AUTH_SUCCESS = 'auth_success',
    ON_AUTH_FAILED = 'auth_fail',
    ON_LOGOUT = 'ws-logged-out',
    ON_END_MESSAGE = 'end_messages',
    ON_SENT_MESSAGE = 'sent_message',
    ON_START_MESSAGE = 'start_messages',
    EMIT_CURRENT_MESSAGE = 'ws-messages-current',
    ON_FAILED_MESSAGE = 'ws-messages-failed',
}

export enum WhatsappClientEventTypes {
    LOADING = 'loading',
    AUTH_SUCCESS = 'auth_success',
    AUTH_FAIL = 'auth_fail',
    READY = 'ready',
    QR = 'qr',
    DISCONNECTED = 'disconnected',
    VOTE = 'vote',
    GROUP_LEAVE = 'group_leave',
    GROUP_JOIN = 'group_join',
    MESSAGE = 'message',
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

export enum OrderEvents {
    UPDATED_ORDER = 'updated-order',
    CREATED_ORDER = 'created-order',
    UPDATED_MESSENGER = 'updated-messenger',
    UPDATED_MULTIPLE_MESSENGER = 'updated-multiple-messengers',
    REQUEST_ORDER_SHIPPING_START = 'request-order-shipping-start',
    REQUEST_ORDER_SHIPPING_END = 'request-order-shipping-end',
}