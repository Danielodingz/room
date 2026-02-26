import { NextRequest, NextResponse } from "next/server";
import { RoomServiceClient } from "livekit-server-sdk";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const roomId = searchParams.get('roomId');

        if (!roomId) {
            return NextResponse.json({ error: "Missing roomId" }, { status: 400 });
        }

        const apiKey = process.env.LIVEKIT_API_KEY;
        const apiSecret = process.env.LIVEKIT_API_SECRET;
        const livekitUrl = process.env.LIVEKIT_URL;

        if (!apiKey || !apiSecret || !livekitUrl) {
            return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
        }

        const roomService = new RoomServiceClient(livekitUrl, apiKey, apiSecret);

        // Fetch all participants currently connected to the room
        const participants = await roomService.listParticipants(roomId);

        // Filter for guests who cannot publish (i.e. currently in the Waiting Room)
        const waitingGuests = participants.filter((p) => {
            return p.permission?.canPublish === false;
        }).map(p => ({
            identity: p.identity,
            name: p.name || "Guest"
        }));

        return NextResponse.json({ waitingGuests });
    } catch (error: any) {
        // If the room doesn't exist yet, just return an empty array instead of throwing an error
        console.error("Error fetching waitlist:", error);
        return NextResponse.json({ waitingGuests: [] });
    }
}
