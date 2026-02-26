import { NextRequest, NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { roomId, walletAddress, displayName } = body;

        if (!roomId || !walletAddress) {
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

        // Elevate the Guest to a Full Participant
        const token = new AccessToken(apiKey, apiSecret, {
            identity: walletAddress,
            name: displayName || "Guest",
            metadata: JSON.stringify({ isHost: false })
        });

        // Grant them full publishing permissions now that they are admitted
        token.addGrant({
            roomJoin: true,
            room: roomId,
            canPublish: true, // Elevating permissions!
            canSubscribe: true,
            canPublishData: true
        });

        const jwt = await token.toJwt();

        return NextResponse.json({
            token: jwt,
            livekitUrl,
        });
    } catch (error: any) {
        console.error("Error elevating room token:", error);
        return NextResponse.json(
            { error: error?.message || "Internal server error", stack: error?.stack },
            { status: 500 }
        );
    }
}
