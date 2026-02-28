"use client";

import React from "react";
import { sepolia } from "@starknet-react/chains";
import {
    StarknetConfig,
    jsonRpcProvider,
    argent,
    braavos,
    useInjectedConnectors,
    voyager
} from "@starknet-react/core";
import { WebWalletConnector } from "starknetkit/webwallet";

export function StarknetProvider({ children }: { children: React.ReactNode }) {
    const { connectors } = useInjectedConnectors({
        // Add connectors in the order you want them to appear
        recommended: [
            argent(),
            braavos(),
        ],
        // Include any other connectors as as fallback
        includeRecommended: "always",
        // Randomize the order of the connectors
        order: "random"
    });

    // Combine Injected (Extensions) with the Web Wallet (Universal Fallback)
    const allConnectors = [
        ...connectors,
        new WebWalletConnector({ url: "https://web.argent.xyz" })
    ];

    // Use official Starknet Foundation Sepolia RPC (publicProvider's Blast API is defunct)
    const provider = jsonRpcProvider({
        rpc: () => ({ nodeUrl: "https://starknet-sepolia.g.alchemy.com/starknet/version/rpc/v0_8/demo" })
    });

    return (
        <StarknetConfig
            chains={[sepolia]}
            provider={provider}
            connectors={allConnectors}
            explorer={voyager}
        >
            {children}
        </StarknetConfig>
    );
}
