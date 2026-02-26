"use client";

import React, { useEffect } from "react";
import { useAccount, useConnect, useDisconnect } from "@starknet-react/core";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2 } from "lucide-react";

export default function ConnectWalletPage() {
    const { address, isConnected, isConnecting, isReconnecting, status } = useAccount();
    const { connect, connectors } = useConnect();
    const router = useRouter();

    // Automatically redirect to dashboard if connected
    useEffect(() => {
        if (isConnected) {
            router.push("/app/dashboard");
        }
    }, [isConnected, router]);

    const isLoading = isConnecting || isReconnecting || status === "connecting";

    return (
        <main className="min-h-screen flex items-center justify-center p-6 relative z-10">
            <div className="w-full max-w-[480px] bg-white rounded-2xl shadow-soft-2xl border border-gray-100 p-8 md:p-12 text-center animate-in fade-in zoom-in duration-500 relative overflow-hidden">
                {/* Connecting Overlay */}
                {isLoading && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center animate-in fade-in duration-300">
                        <Loader2 size={48} className="text-[#121212] animate-spin mb-4" />
                        <h2 className="text-[20px] font-bold text-[#121212] tracking-tight">Connecting Wallet...</h2>
                        <p className="text-[14px] text-[#545454] mt-2 font-medium">Please approve the connection in your wallet.</p>
                    </div>
                )}

                <div className="w-[60px] h-[60px] bg-[#F5F5F5] rounded-full flex items-center justify-center mx-auto mb-8">
                    <div className="w-8 h-8 relative">
                        <Image
                            src="/assets/logos/logo.png"
                            alt="Room Logo"
                            fill
                            className="object-contain"
                        />
                    </div>
                </div>

                <h1 className="text-[28px] font-bold text-[#121212] tracking-tight mb-4">
                    Connect Your Starknet Wallet
                </h1>
                <p className="text-[#545454] text-[16px] leading-[24px] mb-10">
                    Connect your wallet to experience the future of secure, Starknet-native video meetings.
                </p>

                <div className="space-y-4">
                    {connectors.map((connector) => (
                        <button
                            key={connector.id}
                            onClick={() => connect({ connector })}
                            disabled={isLoading}
                            className={`w-full pill-button-secondary bg-white hover:bg-gray-50 flex items-center justify-center gap-3 transition-all h-[56px] border-[#D1D1D1] ${isLoading ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}`}
                        >
                            {connector.icon && (
                                <img
                                    src={typeof connector.icon === 'string' ? connector.icon : connector.icon.light}
                                    alt={connector.name}
                                    className="w-6 h-6"
                                />
                            )}
                            <span className="font-bold">Connect {connector.name}</span>
                        </button>
                    ))}
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
