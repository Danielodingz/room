"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAccount, useDisconnect } from "@starknet-react/core";
import Image from "next/image";
import {
    ArrowLeft, User, Mail, Link as LinkIcon, Edit2, Shield,
    LogOut, CheckCircle2, ChevronRight, Settings, Image as ImageIcon,
    Loader2, Camera
} from "lucide-react";
import { getProfilePic, loadProfile, saveProfile, UserProfile } from "@/lib/profile";

export default function ProfilePage() {
    const router = useRouter();
    const { address, isConnected, isConnecting, isReconnecting } = useAccount();
    const { disconnect } = useDisconnect();
    const [hasMounted, setHasMounted] = useState(false);

    // Profile States
    const [profile, setProfile] = useState<UserProfile>({});
    const [displayName, setDisplayName] = useState("");
    const [email, setEmail] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    useEffect(() => {
        if (address) {
            const saved = loadProfile(address);
            if (saved) {
                setProfile(saved);
                setDisplayName(saved.displayName || "");
                setEmail(saved.email || "");
                setAvatarUrl(saved.avatarUrl || "");
            }
        }
    }, [address]);

    useEffect(() => {
        if (!hasMounted) return;
        if (!isConnected && !isConnecting && !isReconnecting) {
            router.push("/");
        }
    }, [hasMounted, isConnected, isConnecting, isReconnecting, router]);

    const handleSave = async () => {
        if (!address) return;
        setIsSaving(true);
        setSaveStatus("idle");

        try {
            const updated: UserProfile = {
                displayName: displayName.trim(),
                email: email.trim(),
                avatarUrl: avatarUrl
            };
            saveProfile(address, updated);
            setProfile(updated);
            setSaveStatus("success");
            setTimeout(() => setSaveStatus("idle"), 3000);
        } catch (e) {
            setSaveStatus("error");
        } finally {
            setIsSaving(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            alert("Image size must be less than 2MB");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setAvatarUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    if (!hasMounted || isConnecting || isReconnecting) {
        return (
            <main className="min-h-screen bg-[#0A0A0B] flex flex-col items-center justify-center text-white">
                <div className="animate-spin rounded-full h-9 w-9 border-2 border-white/10 border-t-white/40 mb-4" />
                <p className="text-white/60 text-sm font-medium tracking-wide">Loading...</p>
            </main>
        );
    }

    if (!isConnected) return null;

    const currentAvatar = avatarUrl || getProfilePic(address);
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
                    {saveStatus === "success" && (
                        <div className="flex items-center gap-2 text-green-500 text-sm font-bold animate-in fade-in slide-in-from-top-2">
                            <CheckCircle2 size={16} />
                            Changes saved
                        </div>
                    )}
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
                                <img src={currentAvatar} alt="Avatar" className="w-full h-full object-cover" />
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer"
                                >
                                    <Camera size={24} className="text-white mb-2" />
                                    <span className="text-[10px] font-bold text-white uppercase tracking-wider">Change photo</span>
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                    accept="image/*"
                                />
                            </div>
                            <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-[#1C1C1E] z-20" />
                        </div>

                        {/* Info */}
                        <div className="flex-1 pb-2 text-center md:text-left">
                            <h2 className="text-[28px] md:text-[36px] font-black tracking-tight flex items-center justify-center md:justify-start gap-3">
                                {displayName || "User Profile"}
                                <Shield size={24} className="text-blue-400" />
                            </h2>
                            <div className="flex items-center justify-center md:justify-start gap-3 mt-2">
                                <span className="bg-white/10 border border-white/5 px-3 py-1 rounded-full text-[14px] font-mono text-gray-300 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    {shortenedAddress}
                                </span>
                                <span className="text-[14px] text-gray-500 font-medium">Starknet Connected</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pb-2 w-full md:w-auto mt-4 md:mt-0">
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 md:py-2.5 px-8 rounded-xl transition-all disabled:opacity-50 active:scale-95 shadow-lg shadow-blue-600/20"
                            >
                                {isSaving ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : (
                                    <CheckCircle2 size={16} />
                                )}
                                Save Profile
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left Column */}
                    <div className="md:col-span-2 flex flex-col gap-6">

                        {/* Personal Details Panel */}
                        <div className="bg-[#1C1C1E] border border-white/5 rounded-3xl p-6 md:p-8 shadow-xl">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-[20px] font-extrabold tracking-tight">Personal Details</h3>
                                <div className="p-2 bg-white/5 rounded-lg">
                                    <User size={18} className="text-blue-400" />
                                </div>
                            </div>

                            <div className="flex flex-col gap-8">
                                <div className="flex flex-col gap-3">
                                    <label className="text-[12px] font-black text-gray-500 uppercase tracking-[0.15em] px-1">Display Name</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors">
                                            <User size={18} />
                                        </div>
                                        <input
                                            type="text"
                                            value={displayName}
                                            onChange={(e) => setDisplayName(e.target.value)}
                                            placeholder="Your display name..."
                                            className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-white text-[15px] font-medium placeholder:text-gray-700 focus:outline-none focus:border-blue-500/50 transition-all shadow-inner"
                                        />
                                    </div>
                                    <p className="text-[11px] text-gray-600 px-1 font-medium">This name will be visible to others in meeting rooms.</p>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <label className="text-[12px] font-black text-gray-500 uppercase tracking-[0.15em] px-1">Email Address</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors">
                                            <Mail size={18} />
                                        </div>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="you@example.com"
                                            className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-white text-[15px] font-medium placeholder:text-gray-700 focus:outline-none focus:border-blue-500/50 transition-all shadow-inner"
                                        />
                                    </div>
                                    <p className="text-[11px] text-gray-600 px-1 font-medium">Link your email for notifications and meeting invites.</p>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Right Column */}
                    <div className="flex flex-col gap-6">

                        <div className="bg-[#1C1C1E] border border-white/5 rounded-3xl p-6 md:p-8 shadow-xl">
                            <h3 className="text-[18px] font-bold mb-6">Connections</h3>

                            <div className="flex flex-col gap-4">
                                <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                                            <Shield size={18} className="text-blue-400" />
                                        </div>
                                        <div>
                                            <p className="text-[14px] font-bold">Starknet</p>
                                            <p className="text-[12px] text-blue-400 mt-0.5 font-medium">Connected</p>
                                        </div>
                                    </div>
                                    <CheckCircle2 size={20} className="text-blue-400" />
                                </div>

                                <button className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-4 flex items-center gap-3 transition-all text-left group">
                                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-colors">
                                        <LinkIcon size={18} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[14px] font-bold text-gray-200">Connect Twitter</span>
                                        <span className="text-[12px] text-gray-500">For easy invites</span>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Danger Zone */}
                        <div className="bg-[#1C1C1E] border border-white/5 rounded-3xl p-6 md:p-8 shadow-xl">
                            <h3 className="text-[18px] font-bold mb-6 text-red-400">Settings</h3>
                            <button
                                onClick={() => { disconnect(); router.push("/"); }}
                                className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95"
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
