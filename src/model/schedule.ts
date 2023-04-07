import {WhatsappSessionTypes} from "./interfaces/WhatsappModels";

export class ScheduleResponse {
    loading?: boolean = false;

    status: 'running' | 'stopped' | 'error';

    sessionId: WhatsappSessionTypes;

    error?: string;

    constructor(object: ScheduleResponse) {
        this.loading = object.loading;
        this.status = object.status;
        this.error = object.error;
        this.sessionId = object.sessionId;
    }
}
