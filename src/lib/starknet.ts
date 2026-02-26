import { Provider, Account, constants, CallData } from "starknet";

// Initialize provider for Sepolia testnet
export const provider = new Provider({
    nodeUrl: constants.NetworkName.SN_SEPOLIA,
});

// Admin credentials from environment variables (read dynamically)
let adminAccount: Account | null = null;

export const getAdminAccount = () => {
    if (adminAccount) return adminAccount;

    const adminAddress = process.env.STARKNET_ADMIN_ADDRESS || "";
    const adminPrivateKey = process.env.STARKNET_ADMIN_PRIVATE_KEY || "";

    if (adminAddress && adminPrivateKey) {
        // @ts-ignore - Supress TS error about expected arguments for Account
        adminAccount = new Account(provider, adminAddress, adminPrivateKey, "1");
        return adminAccount;
    }

    console.warn("Starknet admin account not configured. Transactions will be simulated.");
    return null;
};

// USDC Testnet Address (Mock USDC for Sepolia)
export const USDC_TESTNET_ADDRESS = process.env.USDC_TESTNET_ADDRESS || "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";

/**
 * Simulates or executes a deployment/payment interaction on Starknet testnet
 * for creating a room.
 */
export const handleRoomCreationPayment = async (roomId: string, userAddress: string) => {
    const account = getAdminAccount();
    if (!account) {
        // Return a mock transaction hash if credentials are not fully set
        return `0xsimulated_creation_tx_${roomId}_${Date.now()}`;
    }

    try {
        // Example: Transfer a small amount of mock USDC to simulate payment or escrow
        const transferCall = {
            contractAddress: USDC_TESTNET_ADDRESS,
            entrypoint: "transfer",
            calldata: CallData.compile({
                recipient: userAddress,
                amount: { low: 1, high: 0 } // Using numbers instead of BigInt literal
            })
        };

        const { transaction_hash } = await account.execute([transferCall]);
        // Awaiting transaction for state validity
        await provider.waitForTransaction(transaction_hash);

        return transaction_hash;
    } catch (error) {
        console.error("Starknet creation payment failed:", error);
        throw new Error("Failed to process Starknet payment for room creation");
    }
};

/**
 * Simulates or executes a join payment interaction on Starknet testnet.
 */
export const handleRoomJoinPayment = async (roomId: string, userAddress: string) => {
    const account = getAdminAccount();
    if (!account) {
        return `0xsimulated_join_tx_${roomId}_${Date.now()}`;
    }

    try {
        // Log the join on-chain or transfer mock fee
        const transferCall = {
            contractAddress: USDC_TESTNET_ADDRESS,
            entrypoint: "transfer",
            calldata: CallData.compile({
                recipient: userAddress,
                amount: { low: 1, high: 0 }
            })
        };

        const { transaction_hash } = await account.execute([transferCall]);
        // For joining, we may respond immediately and not await finality to prioritize speed

        return transaction_hash;
    } catch (error) {
        console.error("Starknet join payment failed:", error);
        throw new Error("Failed to process Starknet payment for room join");
    }
};
