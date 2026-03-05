export interface ScheduledMeeting {
    id: string;
    topic: string;
    description: string;
    date: string;          // "YYYY-MM-DD"
    startTime: string;     // "HH:MM"
    duration: number;      // minutes
    timezone: string;      // IANA e.g. "Africa/Lagos"
    isPublic: boolean;
    passcode: string;
    maxParticipants: number;
    enableRecording: boolean;
    coverImage?: string;   // base64 data URL
    createdAt: number;     // unix ms
    hostAddress: string;
}

const KEY = (address: string) => `room_scheduled_meetings_${address.toLowerCase()}`;

export function loadScheduledMeetings(address: string): ScheduledMeeting[] {
    if (typeof window === "undefined") return [];
    try {
        const raw = localStorage.getItem(KEY(address));
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

export function saveScheduledMeeting(address: string, meeting: ScheduledMeeting): void {
    if (typeof window === "undefined") return;
    const existing = loadScheduledMeetings(address);
    // Replace if same id, otherwise prepend
    const idx = existing.findIndex(m => m.id === meeting.id);
    if (idx >= 0) {
        existing[idx] = meeting;
    } else {
        existing.unshift(meeting);
    }
    localStorage.setItem(KEY(address), JSON.stringify(existing));
}

export function deleteScheduledMeeting(address: string, meetingId: string): void {
    if (typeof window === "undefined") return;
    const existing = loadScheduledMeetings(address).filter(m => m.id !== meetingId);
    localStorage.setItem(KEY(address), JSON.stringify(existing));
}

/** Returns upcoming meetings (date/time in the future), sorted soonest-first */
export function upcomingMeetings(address: string): ScheduledMeeting[] {
    const now = Date.now();
    return loadScheduledMeetings(address)
        .filter(m => {
            const dt = new Date(`${m.date}T${m.startTime}:00`).getTime();
            return dt > now;
        })
        .sort((a, b) => {
            const ta = new Date(`${a.date}T${a.startTime}:00`).getTime();
            const tb = new Date(`${b.date}T${b.startTime}:00`).getTime();
            return ta - tb;
        });
}
