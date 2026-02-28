import { NextRequest, NextResponse } from "next/server";
import { RoomServiceClient } from "livekit-server-sdk";
import { generateMeetingToken } from "@/lib/livekit";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { roomId, walletAddress, displayName } = body;

        if (!roomId || typeof roomId !== "string" || !walletAddress || typeof walletAddress !== "string") {
            return NextResponse.json(
                { error: "Invalid or missing roomId or walletAddress" },
                { status: 400 }
            );
        }

        const apiKey = process.env.LIVEKIT_API_KEY;
        const apiSecret = process.env.LIVEKIT_API_SECRET;
        const livekitUrl = process.env.LIVEKIT_URL;

        if (!apiKey || !apiSecret || !livekitUrl) {
            return NextResponse.json(
                { error: "Server misconfiguration: Missing LiveKit credentials" },
                { status: 500 }
            );
        }

        // Normalize the roomId exactly as the host does in createMeeting()
        const normalizedRoomId = roomId.toLowerCase();

        // Use LiveKit's own Room Service (the real source of truth) to check
        // if the room exists. This survives Vercel's serverless cold-starts
        // because it queries LiveKit's servers, not a local in-memory Map.
        const roomService = new RoomServiceClient(
            livekitUrl,
            apiKey,
            apiSecret
        );

        let rooms: { name?: string }[] = [];
        try {
            rooms = await roomService.listRooms([normalizedRoomId]);
        } catch (err) {
            console.error("LiveKit listRooms failed:", err);
            return NextResponse.json(
                { error: "Failed to verify room with LiveKit" },
                { status: 502 }
            );
        }

        // LiveKit returns an empty array if no room with that name is active
        if (!rooms || rooms.length === 0) {
            return NextResponse.json(
                { error: "Meeting not found" },
                { status: 404 }
            );
        }

        // Room exists on LiveKit — generate a participant token
        const { token, livekitUrl: url } = await generateMeetingToken(
            normalizedRoomId,
            walletAddress,
            displayName || "Guest",
            "participant"
        );

        return NextResponse.json({ token, livekitUrl: url });

    } catch (error: any) {
        console.error("Error joining room:", error);
        return NextResponse.json(
            { error: error?.message || "Internal server error" },
            { status: 500 }
        );
    }
}
