import { NextRequest, NextResponse } from "next/server";
import { getMeeting } from "@/lib/meetings";
import { generateMeetingToken } from "@/lib/livekit";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { roomId, walletAddress, displayName } = body; // Map meetingId param to roomId logic since frontend relies on id param

        if (!roomId || typeof roomId !== "string" || !walletAddress || typeof walletAddress !== "string") {
            return NextResponse.json(
                { error: "Invalid or missing roomId or walletAddress" },
                { status: 400 }
            );
        }

        // Validate meeting exists in memory
        const meeting = getMeeting(roomId);

        if (!meeting) {
            return NextResponse.json(
                { error: "Meeting not found" },
                { status: 404 }
            );
        }

        if (meeting.status === "ended") {
            return NextResponse.json(
                { error: "Meeting has ended" },
                { status: 403 }
            );
        }

        // Generate the LiveKit Token explicitly for the Participant Role
        const { token, livekitUrl } = await generateMeetingToken(
            roomId,
            walletAddress,
            displayName || "Guest",
            "participant" // <-- Crucial Role Injection
        );

        return NextResponse.json({
            token,
            livekitUrl,
        });

    } catch (error: any) {
        console.error("Error joining room:", error);
        return NextResponse.json(
            { error: error?.message || "Internal server error" },
            { status: 500 }
        );
    }
}
