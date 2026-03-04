"use client";

import React, { useEffect, useState, useRef } from "react";
import { useAccount, useConnect } from "@starknet-react/core";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";

// Detect if user is on a mobile device
function useIsMobile() {
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const check = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(
            navigator.userAgent
        );
        setIsMobile(check);
    }, []);
    return isMobile;
}

const CONNECTION_TIMEOUT_MS = 20000; // 20 seconds

export default function ConnectWalletPage() {
    const { isConnected, isConnecting, isReconnecting, status } = useAccount();
    const { connect, connectors } = useConnect();
    const router = useRouter();
    const isMobile = useIsMobile();

    const [timedOut, setTimedOut] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Redirect to dashboard if already connected
    useEffect(() => {
        if (isConnected) {
            router.push("/app/dashboard");
        }
    }, [isConnected, router]);

    const isLoading = isConnecting || isReconnecting || status === "connecting";

    // Start a timeout when connecting begins — reset if it resolves
    useEffect(() => {
        if (isLoading) {
            setTimedOut(false);
            timeoutRef.current = setTimeout(() => {
                setTimedOut(true);
            }, CONNECTION_TIMEOUT_MS);
        } else {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            if (!isLoading) setTimedOut(false);
        }
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [isLoading]);

    // ── Find connectors ───────────────────────────────────────────────
    const argentMobileConnector = connectors.find(c => c.id === "argentMobile");
    const argentXConnector = connectors.find(c => c.id === "argentX");
    const braavosConnector = connectors.find(c => c.id === "braavos");

    // On mobile: prefer argentMobile. On desktop: prefer argentX, fallback to argentMobile.
    const argentConnector = isMobile
        ? (argentMobileConnector || argentXConnector)
        : (argentXConnector || argentMobileConnector);

    const getIconSrc = (connector: any) => {
        if (!connector?.icon) return null;
        return typeof connector.icon === "string"
            ? connector.icon
            : connector.icon.light || connector.icon.dark;
    };

    const handleConnect = (connector: any) => {
        if (!connector || isLoading) return;
        setTimedOut(false);
        connect({ connector });
    };

    return (
        <main className="min-h-screen flex items-center justify-center p-6 relative z-10">
            <div className="w-full max-w-[480px] bg-white rounded-2xl shadow-soft-2xl border border-gray-100 p-8 md:p-12 text-center animate-in fade-in zoom-in duration-500 relative overflow-hidden">

                {/* Connecting Overlay */}
                {isLoading && !timedOut && (
                    <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center animate-in fade-in duration-300 px-8">
                        <Loader2 size={48} className="text-[#121212] animate-spin mb-4" />
                        <h2 className="text-[20px] font-bold text-[#121212] tracking-tight">
                            Connecting Wallet...
                        </h2>
                        <p className="text-[14px] text-[#545454] mt-2 font-medium">
                            {isMobile
                                ? "Redirecting to your wallet app. Please approve the connection there."
                                : "Please approve the connection in your wallet extension."}
                        </p>
                        <p className="text-[11px] text-[#999] mt-4">
                            Taking too long? Make sure your wallet app is open.
                        </p>
                    </div>
                )}

                {/* Timed Out State */}
                {timedOut && (
                    <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center animate-in fade-in duration-300 px-8 gap-4">
                        <AlertCircle size={48} className="text-orange-400" />
                        <h2 className="text-[18px] font-bold text-[#121212]">Connection Timed Out</h2>
                        <p className="text-[13px] text-[#545454] font-medium text-center">
                            {isMobile
                                ? "Make sure the Argent or Braavos app is installed and open, then try again."
                                : "Make sure your wallet extension is unlocked and the popup wasn't blocked."}
                        </p>
                        <button
                            onClick={() => { setTimedOut(false); }}
                            className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-xl font-bold text-[14px] hover:bg-gray-800 transition-all active:scale-95"
                        >
                            <RefreshCw size={16} />
                            Try Again
                        </button>
                    </div>
                )}

                {/* Logo */}
                <div className="w-[60px] h-[60px] bg-[#F5F5F5] rounded-full flex items-center justify-center mx-auto mb-8">
                    <div className="w-8 h-8 relative">
                        <Image src="/assets/logos/logo.png" alt="Room Logo" fill className="object-contain" />
                    </div>
                </div>

                <h1 className="text-[28px] font-bold text-[#121212] tracking-tight mb-4">
                    Connect Your Starknet Wallet
                </h1>
                <p className="text-[#545454] text-[16px] leading-[24px] mb-10">
                    {isMobile
                        ? "Connect your Argent mobile wallet to get started."
                        : "Connect your wallet to experience the future of secure, Starknet-native video meetings."}
                </p>

                <div className="space-y-4">
                    {/* Argent / Argent Mobile */}
                    {argentConnector && (
                        <button
                            onClick={() => handleConnect(argentConnector)}
                            disabled={isLoading}
                            className={`w-full pill-button-secondary bg-white hover:bg-gray-50 flex items-center justify-center gap-3 transition-all h-[56px] border-[#D1D1D1] ${isLoading ? "opacity-50 cursor-not-allowed" : "active:scale-95"}`}
                        >
                            {getIconSrc(argentConnector) && (
                                <img src={getIconSrc(argentConnector)!} alt="Argent" className="w-6 h-6 rounded-full" />
                            )}
                            <span className="font-bold">
                                {isMobile ? "Connect with Argent Mobile" : "Connect Ready Wallet (formerly Argent)"}
                            </span>
                        </button>
                    )}

                    {/* Braavos — only shown on desktop (extension-only) */}
                    {!isMobile && braavosConnector && (
                        <button
                            onClick={() => handleConnect(braavosConnector)}
                            disabled={isLoading}
                            className={`w-full pill-button-secondary bg-white hover:bg-gray-50 flex items-center justify-center gap-3 transition-all h-[56px] border-[#D1D1D1] ${isLoading ? "opacity-50 cursor-not-allowed" : "active:scale-95"}`}
                        >
                            {getIconSrc(braavosConnector) && (
                                <img src={getIconSrc(braavosConnector)!} alt="Braavos" className="w-6 h-6 rounded-full" />
                            )}
                            <span className="font-bold">Connect Braavos</span>
                        </button>
                    )}

                    {/* Fallback: if no connectors detected on mobile yet */}
                    {isMobile && !argentConnector && !isLoading && (
                        <p className="text-[13px] text-orange-500 font-medium py-2">
                            No wallet detected. Please install the{" "}
                            <a href="https://www.argent.xyz/argent-x/" target="_blank" rel="noopener noreferrer" className="underline">
                                Argent
                            </a>{" "}
                            app and try again.
                        </p>
                    )}
                </div>

                <div className="mt-8 pt-8 border-t border-gray-100">
                    <p className="text-[13px] text-[#545454]/60 uppercase tracking-widest font-bold">
                        Sepolia Network Only
                    </p>
                </div>
            </div>
        </main>
    );
}
