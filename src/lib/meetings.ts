import { v4 as uuidv4 } from 'uuid';

export type MeetingStatus = 'active' | 'ended';

export interface Meeting {
    id: string;
    host: string;
    createdAt: number;
    status: MeetingStatus;
}

// Use global module pattern to ensure the Map survives hot-reloads in Next.js Dev Mode
declare global {
    var __meetingsMap: Map<string, Meeting> | undefined;
}

const meetings = globalThis.__meetingsMap || new Map<string, Meeting>();

if (process.env.NODE_ENV !== 'production') {
    globalThis.__meetingsMap = meetings;
}

export function createMeeting(meetingId: string, hostAddress: string): string {
    const normalizedId = meetingId.toLowerCase();
    meetings.set(normalizedId, {
        id: normalizedId,
        host: hostAddress,
        createdAt: Date.now(),
        status: 'active'
    });
    return normalizedId;
}

export function getMeeting(meetingId: string): Meeting | undefined {
    return meetings.get(meetingId.toLowerCase());
}

export function endMeeting(meetingId: string, hostAddress: string): boolean {
    const normalizedId = meetingId.toLowerCase();
    const meeting = meetings.get(normalizedId);

    if (!meeting) {
        return false;
    }

    if (meeting.host !== hostAddress) {
        return false;
    }

    meeting.status = 'ended';
    meetings.set(normalizedId, meeting);

    // After setting it to ended, we clean it up from memory to prevent leaks
    // For a hackathon timeline we could just leave it, but this is safer
    setTimeout(() => {
        meetings.delete(normalizedId);
    }, 60000); // Wait 1 minute before completely wiping so late-joiners still see "ended" 403 instead of 404

    return true;
}
