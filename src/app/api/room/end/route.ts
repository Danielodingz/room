import { NextRequest, NextResponse } from "next/server";
import { endMeeting } from "@/lib/meetings";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { roomId, walletAddress } = body;

        if (!roomId || typeof roomId !== "string" || !walletAddress || typeof walletAddress !== "string") {
            return NextResponse.json(
                { error: "Invalid or missing roomId or walletAddress" },
                { status: 400 }
            );
        }

        // Attempt to end the meeting
        // This validates internally that the walletAddress matches the host who created it
        const success = endMeeting(roomId, walletAddress);

        if (!success) {
            // Return 403 Forbidden because it either doesn't exist or they are not the host
            return NextResponse.json(
                { error: "Unauthorized or meeting not found" },
                { status: 403 }
            );
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Error ending room:", error);
        return NextResponse.json(
            { error: error?.message || "Internal server error" },
            { status: 500 }
        );
    }
}
