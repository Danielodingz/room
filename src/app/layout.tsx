import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@livekit/components-styles";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
    title: "Room | Starknet-native video meeting platform",
    description: "Send USDC live during video calls on the most secure video meeting platform.",
};

import { StarknetProvider } from "@/components/StarknetProvider";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${inter.className} antialiased`}>
                <StarknetProvider>
                    <div className="mesh-gradient-container">
                        <div className="mesh-gradient-mask" />
                    </div>
                    {children}
                </StarknetProvider>
            </body>
        </html>
    );
}
