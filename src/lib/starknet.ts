import { Provider, Account, constants, CallData } from "starknet";

// USDC Testnet Address (Mock USDC for Sepolia)
export const USDC_TESTNET_ADDRESS = process.env.USDC_TESTNET_ADDRESS || "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";

/**
 * Simulates a deployment/payment interaction on Starknet testnet
 * for creating a room.
 */
export const handleRoomCreationPayment = async (roomId: string, userAddress: string) => {
    // VERCEL FIX: We intentionally mock this transaction heavily.
    // The previous implementation attempted to instantiate a starknet Account object.
    // However, if the user leaves the PRIVATE_KEY empty or uses a fake string ("mock_private_key"),
    // the starknet.js library crashes internally with a TypeError inside Vercel's serverless runtime.
    console.log(`[Starknet Mock] Room Created: ${roomId} by ${userAddress}`);
    return `0xsimulated_creation_tx_${roomId}_${Date.now()}`;
};

/**
 * Simulates a join payment interaction on Starknet testnet.
 */
export const handleRoomJoinPayment = async (roomId: string, userAddress: string) => {
    console.log(`[Starknet Mock] Room Joined: ${roomId} by ${userAddress}`);
    return `0xsimulated_join_tx_${roomId}_${Date.now()}`;
};
