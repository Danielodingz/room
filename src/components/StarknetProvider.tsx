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
        recommended: [
            argent(),
            braavos(),
        ],
        includeRecommended: "always",
        order: "alphabetical"
    });

    const argentMobile = ArgentMobileConnector.init({
        options: {
            dappName: "Room",
            projectId: "e93f77341fe2cb1fc0c9d72c1c7af06e",
            chainId: "SN_SEPOLIA",
            description: "Room - Starknet Native Video Meetings",
            url: typeof window !== "undefined" ? window.location.origin : "https://room-tau-ivory.vercel.app",
        }
    });

    // Put argentMobile first so mobile devices hit it before injected extensions
    const allConnectors = [
        argentMobile,
        ...injected,
        new WebWalletConnector({ url: "https://web.argent.xyz" })
    ];

    const provider = jsonRpcProvider({
        rpc: () => ({
            nodeUrl: process.env.NEXT_PUBLIC_STARKNET_RPC_URL ||
                "https://starknet-sepolia.g.alchemy.com/starknet/version/rpc/v0_8/demo"
        })
    });

    return (
        <StarknetConfig
            chains={[sepolia]}
            provider={provider}
            connectors={allConnectors}
            explorer={voyager}
            autoConnect
        >
            {children}
        </StarknetConfig>
    );
}
