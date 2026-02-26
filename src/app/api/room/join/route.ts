import { NextRequest, NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";
import { handleRoomJoinPayment } from "@/lib/starknet";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { roomId, walletAddress, displayName } = body;

        // Validate both roomId and walletAddress
        if (
            !roomId || typeof roomId !== "string" ||
            !walletAddress || typeof walletAddress !== "string"
        ) {
            return NextResponse.json(
                { error: "Invalid or missing roomId or walletAddress" },
                { status: 400 }
            );
        }

        // Access environment variables securely on the server
        const apiKey = process.env.LIVEKIT_API_KEY;
        const apiSecret = process.env.LIVEKIT_API_SECRET;
        const livekitUrl = process.env.LIVEKIT_URL;

        if (!apiKey || !apiSecret || !livekitUrl) {
            return NextResponse.json(
                { error: "Server misconfiguration: Missing LiveKit credentials" },
                { status: 500 }
            );
        }

        // Trigger Starknet testnet logic for USDC payment
        const starknetTxHash = await handleRoomJoinPayment(roomId, walletAddress);

        // Create LiveKit AccessToken
        const token = new AccessToken(apiKey, apiSecret, {
            identity: walletAddress,
            name: displayName || "Guest",
            metadata: JSON.stringify({ isHost: false })
        });

        // Add grant matching the host's permissions
        token.addGrant({
            roomJoin: true,
            room: roomId,
            canPublish: false, // Initially disabled until admitted
            canSubscribe: true,
            canPublishData: true
        });

        // Generate JWT
        const jwt = await token.toJwt();

        // Return the response without exposing secrets
        return NextResponse.json({
            token: jwt,
            livekitUrl,
            starknetTxHash,
        });
    } catch (error) {
        console.error("Error joining room:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
