/**
 * roomVault.ts — frontend integration for the RoomVault Cairo smart contract
 *
 * UPDATE ROOM_VAULT_ADDRESS after running contracts/deploy_room_vault.sh
 */

export const ROOM_VAULT_ADDRESS = "PLACEHOLDER_ROOM_VAULT_ADDRESS";

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
export function formatStrkAmount(raw: bigint | { low: bigint; high: bigint }): string {
    const HIGH_MULT = 340282366920938463463374607431768211456n;
    let value = 0n;
    if (typeof raw === "bigint") {
        value = raw;
    } else {
        value = BigInt(raw.low.toString()) + BigInt(raw.high.toString()) * HIGH_MULT;
    }
    return (Number(value) / 1e18).toFixed(4);
}
