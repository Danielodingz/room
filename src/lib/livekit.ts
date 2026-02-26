import { AccessToken } from "livekit-server-sdk";

export type ParticipantRole = "host" | "participant";

export interface ParticipantMetadata {
    role: ParticipantRole;
    displayName?: string;
}

export async function generateMeetingToken(
    meetingId: string,
    walletAddress: string,
    displayName: string,
    role: ParticipantRole
): Promise<{ token: string, livekitUrl: string }> {

    // Access environment variables securely on the server
    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const livekitUrl = process.env.LIVEKIT_URL;

    if (!apiKey || !apiSecret || !livekitUrl) {
        throw new Error("Server misconfiguration: Missing LiveKit credentials");
    }

    const metadata: ParticipantMetadata = { role, displayName };

    // Create LiveKit AccessToken
    const token = new AccessToken(apiKey, apiSecret, {
        identity: walletAddress,
        name: displayName || "Guest",
        metadata: JSON.stringify(metadata)
    });

    // Grant standard access, role permissions will be handled on the frontend via metadata
    token.addGrant({
        roomJoin: true,
        room: meetingId,
        canPublish: true,
        canSubscribe: true,
        canPublishData: true
    });

    // Generate JWT
    const jwt = await token.toJwt();

    return { token: jwt, livekitUrl };
}
