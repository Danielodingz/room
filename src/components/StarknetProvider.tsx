"use client";

import React from "react";
import { sepolia } from "@starknet-react/chains";
import {
    StarknetConfig,
    publicProvider,
    argent,
    braavos,
    useInjectedConnectors,
    voyager
} from "@starknet-react/core";

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

    return (
        <StarknetConfig
            chains={[sepolia]}
            provider={publicProvider()}
            connectors={connectors}
            explorer={voyager}
        >
            {children}
        </StarknetConfig>
    );
}
