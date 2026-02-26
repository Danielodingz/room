import { NextRequest, NextResponse } from "next/server";
import { createMeeting } from "@/lib/meetings";
import { generateMeetingToken } from "@/lib/livekit";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { roomId, walletAddress, displayName } = body;

        // Validate walletAddress as it represents the Host's identity
        if (!walletAddress || typeof walletAddress !== "string" || !roomId || typeof roomId !== "string") {
            return NextResponse.json(
                { error: "Invalid or missing walletAddress/roomId" },
                { status: 400 }
            );
        }

        // 1. Create the session in memory using the frontend's specific ID.
        const meetingId = createMeeting(roomId, walletAddress);

        // 2. Generate the LiveKit Token explicitly for the Host Role
        const { token, livekitUrl } = await generateMeetingToken(
            meetingId,
            walletAddress,
            displayName || "Host",
            "host" // <-- Crucial Role Injection
        );

        // 3. Construct the Join URL
        const protocol = req.headers.get("x-forwarded-proto") || "http";
        const host = req.headers.get("host") || "localhost:3000";
        const joinUrl = `${protocol}://${host}/app/room/${meetingId}`;

        return NextResponse.json({
            meetingId,
            joinUrl,
            token,
            livekitUrl,
        });
    } catch (error: any) {
        console.error("Error creating room:", error);
        return NextResponse.json(
            { error: error?.message || "Internal server error" },
            { status: 500 }
        );
    }
}

