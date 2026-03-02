"use client";

import React from "react";
import { sepolia } from "@starknet-react/chains";
import {
    StarknetConfig,
    jsonRpcProvider,
    argent,
    braavos,
    useInjectedConnectors,
    voyager,
} from "@starknet-react/core";
import { ArgentMobileConnector } from "starknetkit/argentMobile";
import { WebWalletConnector } from "starknetkit/webwallet";

export function StarknetProvider({ children }: { children: React.ReactNode }) {
    const { connectors: injected } = useInjectedConnectors({
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

    // Combine Injected (Extensions) with the Mobile and Web Wallet (Universal Fallback)
    const allConnectors = [
        ...injected,
        ArgentMobileConnector.init({
            options: {
                dappName: "Room",
                projectId: "e93f77341fe2cb1fc0c9d72c1c7af06e", // Standard default project ID or yours
                chainId: "SN_SEPOLIA",
                description: "Room - Starknet Native Video Meetings",
                url: typeof window !== 'undefined' ? window.location.origin : "https://room.starknet",
            }
        }),
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
