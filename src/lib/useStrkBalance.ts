"use client";
/**
 * useStrkBalance — reads STRK (or any Starknet ERC-20) balance
 * using a direct useReadContract call so it works correctly on both
 * Sepolia testnet and mainnet regardless of what useBalance returns.
 *
 * The STRK contract address is the same on both Sepolia and mainnet.
 */
import { useReadContract } from "@starknet-react/core";

const STRK_CONTRACT = "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";

// Minimal Cairo 1 ERC-20 ABI for balance_of → u256
const ERC20_ABI = [
    {
        name: "balance_of",
        type: "function",
        inputs: [{ name: "account", type: "core::starknet::contract_address::ContractAddress" }],
        outputs: [{ name: "balance", type: "core::integer::u256" }],
        state_mutability: "view",
    },
] as const;

/**
 * Returns { formatted, raw, isLoading } where:
 * - formatted: e.g. "79.9729" (string, to 4 dp)
 * - raw: BigInt value in base units
 * - isLoading: true while fetching
 */
export function useStrkBalance(walletAddress?: string) {
    const { data, isLoading } = useReadContract({
        abi: ERC20_ABI,
        address: STRK_CONTRACT as `0x${string}`,
        functionName: "balance_of",
        // @ts-expect-error starknet-react v5 args typed loosely
        args: walletAddress ? [walletAddress] : [],
        enabled: !!walletAddress,
        watch: true,
    });

    // starknet-react decodes u256 as { low: bigint, high: bigint }
    // For amounts < 2^128 (all realistic balances), high = 0n
    const HIGH_MULT = 340282366920938463463374607431768211456n; // 2**128

    let raw = 0n;
    try {
        if (data !== undefined && data !== null) {
            if (typeof data === "object" && "low" in (data as object)) {
                const { low, high } = data as { low: bigint; high: bigint };
                raw = BigInt(low.toString()) + BigInt(high.toString()) * HIGH_MULT;
            } else {
                raw = BigInt(data as unknown as string);
            }
        }
    } catch {
        raw = 0n;
    }

    // STRK has 18 decimals
    const formatted = raw > 0n
        ? (Number(raw) / 1e18).toFixed(4)
        : "0.0000";

    return { formatted, raw, isLoading };
}
