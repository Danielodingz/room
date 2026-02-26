import { NextRequest, NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";
import { v4 as uuidv4 } from "uuid";
import { handleRoomCreationPayment } from "@/lib/starknet";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { walletAddress, displayName } = body;

        // Validate walletAddress exists and is a string
        if (!walletAddress || typeof walletAddress !== "string") {
            return NextResponse.json(
                { error: "Invalid or missing walletAddress" },
                { status: 400 }
            );
        }

        // Generate unique roomId
        const roomId = uuidv4();

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
        const starknetTxHash = await handleRoomCreationPayment(roomId, walletAddress);

        // Create LiveKit AccessToken
        const token = new AccessToken(apiKey, apiSecret, {
            identity: walletAddress,
            name: displayName || "Host",
            metadata: JSON.stringify({ isHost: true })
        });

        // Add room grant matching permissions request
        token.addGrant({
            roomJoin: true,
            room: roomId,
            canPublish: true,
            canSubscribe: true,
            roomAdmin: true,
            canPublishData: true
        });

        // Generate JWT
        const jwt = await token.toJwt();

        // Return the required response including Starknet tx hash
        return NextResponse.json({
            roomId,
            token: jwt,
            livekitUrl,
            starknetTxHash,
        });
    } catch (error: any) {
        console.error("Error creating room:", error);
        return NextResponse.json(
            { error: error?.message || "Internal server error", stack: error?.stack },
            { status: 500 }
        );
    }
}
