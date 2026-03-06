/**
 * roomVault.ts — frontend integration for the RoomVault Cairo smart contract
 *
 * UPDATE ROOM_VAULT_ADDRESS after running contracts/deploy_room_vault.sh
 */

export const ROOM_VAULT_ADDRESS: string = "0x06b63f121bb2e9558a5ef114e304903c41d2136f2931b6f6174896b02ec4c1d5";

export const STRK_ADDRESS = "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";

// --- ABIs ---

export const ROOM_VAULT_ABI = [
    {
        type: "function",
        name: "deposit",
        inputs: [{ name: "amount", type: "core::integer::u256" }],
        outputs: [],
        state_mutability: "external",
    },
    {
        type: "function",
        name: "withdraw",
        inputs: [
            { name: "amount", type: "core::integer::u256" },
            { name: "to", type: "core::starknet::contract_address::ContractAddress" },
        ],
        outputs: [],
        state_mutability: "external",
    },
    {
        type: "function",
        name: "transfer_in_room",
        inputs: [
            { name: "to", type: "core::starknet::contract_address::ContractAddress" },
            { name: "amount", type: "core::integer::u256" },
        ],
        outputs: [],
        state_mutability: "external",
    },
    {
        type: "function",
        name: "get_balance",
        inputs: [{ name: "account", type: "core::starknet::contract_address::ContractAddress" }],
        outputs: [{ type: "core::integer::u256" }],
        state_mutability: "view",
    },
] as const;

export const STRK_APPROVE_ABI = [
    {
        type: "function",
        name: "approve",
        inputs: [
            { name: "spender", type: "core::starknet::contract_address::ContractAddress" },
            { name: "amount", type: "core::integer::u256" },
        ],
        outputs: [{ type: "core::bool" }],
        state_mutability: "external",
    },
] as const;

// --- Helpers ---

/** Convert a human-readable STRK amount (e.g. "1.5") to u256 {low, high} for calldata */
export function toU256Calldata(amount: number): [string, string] {
    const DECIMALS_FACTOR = 1_000_000_000_000_000_000n; // 10^18
    const raw = BigInt(Math.round(amount * 1e9)) * (DECIMALS_FACTOR / 1_000_000_000n);
    const U128_MAX = 340282366920938463463374607431768211456n; // 2^128
    return [(raw % U128_MAX).toString(), (raw / U128_MAX).toString()];
}


/** Format a raw u256 ({low, high} or bigint) to human-readable STRK string */
export function formatStrkAmount(raw: any): string {
    if (raw === null || raw === undefined) return "0.0000";

    const HIGH_MULT = 340282366920938463463374607431768211456n;
    let value = 0n;

    try {
        if (typeof raw === "bigint") {
            value = raw;
        } else if (typeof raw === "object" && "low" in raw) {
            value = BigInt(raw.low.toString()) + BigInt(raw.high.toString()) * HIGH_MULT;
        } else if (typeof raw === "string" || typeof raw === "number") {
            value = BigInt(raw);
        } else {
            console.warn("Unexpected STRK balance format:", raw);
            value = 0n;
        }
    } catch (e) {
        console.error("Error formatting STRK amount:", e);
        return "0.0000";
    }

    return (Number(value) / 1e18).toFixed(4);
}

// --- Error message parser ---
export function parseStarknetError(err: any): string {
    const msg: string = err?.message || err?.toString() || "Transaction failed";
    console.error("Original Starknet Error:", msg);

    if (msg.includes("is not deployed"))
        return "The recipient's wallet is not yet activated on Starknet. They need to make at least one transaction on Sepolia to activate their account.";
    if (msg.includes("insufficient") || msg.includes("balance"))
        return "Insufficient vault balance to complete this transfer.";
    if (msg.includes("rejected") || msg.includes("cancelled") || msg.includes("user abort") || msg.includes("User abort"))
        return "Transaction was rejected or cancelled.";
    if (msg.includes("Timeout") || msg.includes("timeout"))
        return "TIMEOUT: The wallet connection is slow. Please check if Argent X is waiting for your confirmation!";

    // Return a shortened version for other errors
    return msg.length > 180 ? msg.slice(0, 180) + "…" : msg;
}
