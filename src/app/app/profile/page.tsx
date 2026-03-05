"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount, useDisconnect } from "@starknet-react/core";
import Image from "next/image";
import {
    ArrowLeft, User, Mail, Link as LinkIcon, Edit2, Shield,
    LogOut, CheckCircle2, ChevronRight, Settings, Image as ImageIcon
} from "lucide-react";
import { getProfilePic } from "@/lib/profile";

export default function ProfilePage() {
    const router = useRouter();
    const { address, isConnected, isConnecting, isReconnecting } = useAccount();
    const { disconnect } = useDisconnect();
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    useEffect(() => {
        if (!hasMounted) return;
        if (!isConnected && !isConnecting && !isReconnecting) {
            router.push("/");
        }
    }, [hasMounted, isConnected, isConnecting, isReconnecting, router]);

    if (!hasMounted || isConnecting || isReconnecting) {
        return (
            <main className="min-h-screen bg-[#0A0A0B] flex flex-col items-center justify-center text-white">
                <div className="animate-spin rounded-full h-9 w-9 border-2 border-white/10 border-t-white/40 mb-4" />
                <p className="text-white/60 text-sm font-medium tracking-wide">Loading...</p>
            </main>
        );
    }

    if (!isConnected) return null;

    const avatarUrl = getProfilePic(address);
    const shortenedAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "";

    return (
        <main className="min-h-screen bg-[#0A0A0B] text-white font-sans flex flex-col pb-20 md:pb-0">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-[#0A0A0B]/80 backdrop-blur-xl border-b border-white/5 mx-4 md:mx-8">
                <div className="flex items-center justify-between h-[80px]">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push("/app/dashboard")}
                            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                        >
                            <ArrowLeft size={18} />
                        </button>
                        <h1 className="text-[20px] font-bold tracking-tight">Profile</h1>
                    </div>
                </div>
            </header>

            <div className="flex-1 max-w-4xl w-full mx-auto px-4 md:px-8 py-8 flex flex-col gap-8">

                {/* Profile Cover & Header */}
                <div className="relative rounded-3xl overflow-hidden bg-[#1C1C1E] border border-white/5 shadow-2xl">
                    <div className="h-32 md:h-48 bg-gradient-to-r from-blue-600 to-indigo-600 relative overflow-hidden">
                        <div className="absolute inset-0 bg-black/20" />
                        <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 border border-white/10">
                            <ImageIcon size={14} className="text-white/80" />
                            <span className="text-[12px] font-bold text-white/90">Change Cover</span>
                        </div>
                    </div>

                    <div className="px-6 md:px-10 pb-8 relative flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-end -mt-16 md:-mt-20">
                        {/* Avatar */}
                        <div className="relative group shrink-0">
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-[#1C1C1E] overflow-hidden bg-[#1C1C1E] shadow-xl relative z-10">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer">
                                    <Edit2 size={24} className="text-white mb-2" />
                                </div>
                            </div>
                            <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-[#1C1C1E] z-20" />
                        </div>

                        {/* Info */}
                        <div className="flex-1 pb-2">
                            <h2 className="text-[28px] md:text-[36px] font-black tracking-tight flex items-center gap-3">
                                User Profile
                                <Shield size={24} className="text-blue-400" />
                            </h2>
                            <div className="flex items-center gap-3 mt-2">
                                <span className="bg-white/10 border border-white/5 px-3 py-1 rounded-full text-[14px] font-mono text-gray-300 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    {shortenedAddress}
                                </span>
                                <span className="text-[14px] text-gray-500 font-medium">Starknet Connected</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pb-2 w-full md:w-auto mt-4 md:mt-0">
                            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 md:py-2.5 px-6 rounded-xl transition-colors">
                                <Edit2 size={16} />
                                Edit Profile
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left Column */}
                    <div className="md:col-span-2 flex flex-col gap-6">

                        {/* Personal Details Panel */}
                        <div className="bg-[#1C1C1E] border border-white/5 rounded-3xl p-6 md:p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-[18px] font-bold">Personal Details</h3>
                            </div>

                            <div className="flex flex-col gap-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">Display Name</label>
                                    <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center justify-between group hover:border-white/20 transition-colors cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <User size={18} className="text-gray-400" />
                                            <span className="text-[15px] font-medium text-gray-200">Set a display name...</span>
                                        </div>
                                        <ChevronRight size={16} className="text-gray-500 group-hover:text-white transition-colors" />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">Email Address</label>
                                    <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center justify-between group hover:border-white/20 transition-colors cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <Mail size={18} className="text-gray-400" />
                                            <span className="text-[15px] font-medium text-gray-500">Not connected</span>
                                        </div>
                                        <ChevronRight size={16} className="text-gray-500 group-hover:text-white transition-colors" />
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Right Column */}
                    <div className="flex flex-col gap-6">

                        <div className="bg-[#1C1C1E] border border-white/5 rounded-3xl p-6 md:p-8">
                            <h3 className="text-[18px] font-bold mb-6">Connections</h3>

                            <div className="flex flex-col gap-4">
                                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                                            <Shield size={18} className="text-blue-400" />
                                        </div>
                                        <div>
                                            <p className="text-[14px] font-bold">Starknet Wallet</p>
                                            <p className="text-[12px] text-blue-400 mt-0.5">Connected</p>
                                        </div>
                                    </div>
                                    <CheckCircle2 size={20} className="text-blue-400" />
                                </div>

                                <button className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 flex items-center gap-3 transition-colors text-left">
                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                                        <LinkIcon size={18} className="text-gray-400" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[14px] font-bold text-gray-200">Connect Twitter</span>
                                        <span className="text-[12px] text-gray-500">For easy invites</span>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Danger Zone */}
                        <div className="bg-[#1C1C1E] border border-white/5 rounded-3xl p-6 md:p-8">
                            <h3 className="text-[18px] font-bold mb-6 text-red-400">Settings</h3>
                            <button
                                onClick={() => { disconnect(); router.push("/"); }}
                                className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
                            >
                                <LogOut size={18} />
                                Disconnect Wallet
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </main>
    );
}
