import { NextRequest, NextResponse } from "next/server";
import { RoomServiceClient } from "livekit-server-sdk";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const roomId = searchParams.get('roomId');
        const identity = searchParams.get('identity');

        if (!roomId || !identity) {
            return NextResponse.json({ error: "Missing roomId or identity" }, { status: 400 });
        }

        const apiKey = process.env.LIVEKIT_API_KEY;
        const apiSecret = process.env.LIVEKIT_API_SECRET;
        const livekitUrl = process.env.LIVEKIT_URL;

        if (!apiKey || !apiSecret || !livekitUrl) {
            return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
        }

        const roomService = new RoomServiceClient(livekitUrl, apiKey, apiSecret);

        try {
            const participant = await roomService.getParticipant(roomId, identity);
            // If the participant now has `canPublish: true` on the LIVEKIT SERVER, they are admitted
            if (participant.permission?.canPublish) {
                return NextResponse.json({ admitted: true });
            }
        } catch (e) {
            // Participant not found, perhaps disconnected
        }

        return NextResponse.json({ admitted: false });
    } catch (error: any) {
        console.error("Error checking waitlist status:", error);
        return NextResponse.json({ admitted: false });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { roomId, identity, action } = body;

        if (!roomId || !identity || action !== 'admit') {
            return NextResponse.json({ error: "Invalid request" }, { status: 400 });
        }

        const apiKey = process.env.LIVEKIT_API_KEY;
        const apiSecret = process.env.LIVEKIT_API_SECRET;
        const livekitUrl = process.env.LIVEKIT_URL;

        if (!apiKey || !apiSecret || !livekitUrl) {
            return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
        }

        const roomService = new RoomServiceClient(livekitUrl, apiKey, apiSecret);

        // Grant publishing permissions on the LiveKit Server instantly
        await roomService.updateParticipant(roomId, identity, undefined, {
            canPublish: true,
            canSubscribe: true,
            canPublishData: true,
            hidden: false
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Error admitting guest:", error);
        return NextResponse.json(
            { error: error?.message || "Internal server error" },
            { status: 500 }
        );
    }
}
