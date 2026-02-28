"use client";

import React, { useEffect, useState } from "react";
import { useAccount, useDisconnect, useBalance } from "@starknet-react/core";
import { loadTxHistory, TxRecord } from "@/lib/txHistory";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
    Video,
    Plus,
    Calendar,
    Search,
    Home,
    MessageSquare,
    Settings,
    LogOut,
    Clock,
    User,
    ChevronDown,
    ChevronLeft,
    Wallet,
    Zap,
    DollarSign,
    Bell,
    Copy,
    Check,
    ArrowRight,
    ArrowLeft,
} from "lucide-react";

export default function DashboardPage() {
    const { address, isConnected } = useAccount();
    const { disconnect } = useDisconnect();
    const router = useRouter();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isWalletOpen, setIsWalletOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isNewMeetingOpen, setIsNewMeetingOpen] = useState(false);
    const [isJoinMeetingOpen, setIsJoinMeetingOpen] = useState(false);
    const [joinMeetingId, setJoinMeetingId] = useState("");
    const [isPublicMeeting, setIsPublicMeeting] = useState(true);
    const [meetingId] = useState(Math.random().toString(36).substring(2, 11).toUpperCase());
    const [meetingIdCopied, setMeetingIdCopied] = useState(false);

    const handleCopyMeetingId = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(meetingId);
        setMeetingIdCopied(true);
        setTimeout(() => setMeetingIdCopied(false), 2000);
    };

    const handleStartMeeting = () => {
        router.push(`/app/room/${meetingId}?mode=create`);
    };

    const handleJoinMeeting = () => {
        if (joinMeetingId.trim()) {
            router.push(`/app/room/${joinMeetingId.trim()}?mode=join`);
        }
    };

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Redirect to landing page if not connected
    useEffect(() => {
        if (!isConnected) {
            router.push("/");
        }
    }, [isConnected, router]);

    const shortenedAddress = address
        ? `${address.slice(0, 6)}...${address.slice(-4)}`
        : "";

    if (!isConnected) return null;

    return (
        <main className="min-h-screen bg-[#0A0A0B] text-white font-sans flex">
            {/* Sidebar Navigation */}
            <aside className="w-[84px] md:w-[240px] border-r border-white/5 flex flex-col bg-[#FFFFFF] sticky top-0 h-screen py-6">
                <div className="px-6 mb-10 flex items-center justify-center md:justify-start gap-3">
                    <div className="w-[32px] h-[32px] relative">
                        <Image src="/assets/logos/logo.png" alt="Room" fill className="object-contain" />
                    </div>
                    <span className="hidden md:block font-bold text-[18px] text-black">Room</span>
                </div>

                <nav className="flex-1 flex flex-col gap-2 px-3">
                    <SidebarItem icon={<Home size={22} />} label="Home" active={!isWalletOpen} onClick={() => setIsWalletOpen(false)} />
                    <SidebarItem icon={<Wallet size={22} />} label="Wallet" active={isWalletOpen} onClick={() => setIsWalletOpen(true)} />
                    <SidebarItem icon={<MessageSquare size={22} />} label="Team Chat" />
                    <SidebarItem icon={<Video size={22} />} label="Meetings" />
                    <SidebarItem icon={<Zap size={22} />} label="Hackathon" />
                    <SidebarItem icon={<User size={22} />} label="Class" />
                    <SidebarItem icon={<Settings size={22} />} label="Settings" />
                </nav>

                <div className="px-3 mt-auto">
                    <button
                        onClick={() => disconnect()}
                        className="w-full flex items-center justify-center md:justify-start gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-400/10 transition-all font-bold text-[14px]"
                    >
                        <LogOut size={20} />
                        <span className="hidden md:block">Disconnect</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col relative min-h-screen">
                {/* Header (Search & Wallet) */}
                <header className="h-[72px] px-8 flex items-center justify-between bg-[#0A0A0B]/80 backdrop-blur-md sticky top-0 z-10 border-b border-white/5">
                    <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-4 py-2 w-[320px] focus-within:border-blue-500/50 transition-all group">
                        <Search size={16} className="text-gray-500 group-focus-within:text-blue-400" />
                        <input
                            type="text"
                            placeholder="Search meetings, recordings..."
                            className="bg-transparent border-none outline-none text-[14px] w-full ml-3 text-gray-300 placeholder:text-gray-600"
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsNotificationsOpen(true)}
                            className="relative p-2 text-gray-500 hover:text-blue-400 hover:bg-white/5 rounded-xl transition-all group"
                        >
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full border-2 border-[#0A0A0B] group-hover:border-[#111112] transition-all" />
                        </button>
                        <div
                            onClick={() => setIsWalletOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10 shadow-sm hover:border-white/20 transition-all cursor-pointer"
                        >
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-[13px] font-bold text-gray-300">{shortenedAddress}</span>
                        </div>
                        <div
                            onClick={() => setIsWalletOpen(true)}
                            className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-white/10 shadow-sm overflow-hidden hover:border-white/20 transition-all cursor-pointer"
                        >
                            <User size={20} className="text-blue-400" />
                        </div>
                    </div>
                </header>

                <div className="p-8 md:p-12 flex-1 flex flex-col lg:flex-row items-center justify-center gap-16 max-w-[1400px] mx-auto w-full">
                    {/* Action Buttons */}
                    <div className="flex flex-wrap justify-center gap-10">
                        <div className="relative">
                            <LargeActionButton
                                icon={<Video className="text-black" size={32} />}
                                label="New Meeting"
                                color="bg-[#FFFFFF]"
                                description="Start instant meeting"
                                hasDropdown={true}
                                onClick={() => {
                                    setIsNewMeetingOpen(!isNewMeetingOpen);
                                    setIsJoinMeetingOpen(false);
                                }}
                            />

                            {/* New Meeting Dropdown */}
                            {isNewMeetingOpen && (
                                <div className="absolute top-[100%] left-1/2 -translate-x-1/2 mt-4 w-[280px] bg-[#1C1C1E] border border-white/10 rounded-[24px] shadow-2xl z-50 p-5 animate-in fade-in zoom-in-95 duration-200">
                                    <div className="flex flex-col gap-5">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[14px] font-bold text-gray-300">New Meeting</span>
                                            <div
                                                onClick={() => setIsPublicMeeting(!isPublicMeeting)}
                                                className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors duration-300 ${isPublicMeeting ? 'bg-blue-500' : 'bg-gray-700'}`}
                                            >
                                                <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${isPublicMeeting ? 'translate-x-6' : 'translate-x-0'}`} />
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-1">
                                            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest px-1">Meeting Type</span>
                                            <span className="text-[14px] font-medium text-white px-1">
                                                {isPublicMeeting ? 'Public Meeting' : 'Private Meeting'}
                                            </span>
                                        </div>

                                        <div className="bg-black/20 rounded-xl p-3 border border-white/5 flex items-center justify-between group/id">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-[10px] font-bold text-gray-500 uppercase">Your Meeting ID</span>
                                                <span className="text-[14px] font-mono font-bold text-blue-400">{meetingId}</span>
                                            </div>
                                            <button
                                                onClick={handleCopyMeetingId}
                                                className={`p-2 rounded-lg transition-all ${meetingIdCopied ? 'bg-green-500/20 text-green-400' : 'hover:bg-white/5 text-gray-400'}`}
                                            >
                                                {meetingIdCopied ? <Check size={16} /> : <Copy size={16} />}
                                            </button>
                                        </div>

                                        <button
                                            onClick={handleStartMeeting}
                                            className="w-full bg-white/90 hover:bg-white text-black font-black py-3 rounded-xl transition-all active:scale-95 shadow-lg shadow-white/10"
                                        >
                                            Start Meeting
                                        </button>
                                    </div>

                                    {/* Arrow */}
                                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#1C1C1E] border-t border-l border-white/10 rotate-45" />
                                </div>
                            )}
                        </div>
                        <div className="relative">
                            <LargeActionButton
                                icon={<Plus className="text-white" size={32} />}
                                label="Join"
                                color="bg-[#010101]"
                                description="Join with code"
                                hasDropdown={true}
                                onClick={() => {
                                    setIsJoinMeetingOpen(!isJoinMeetingOpen);
                                    setIsNewMeetingOpen(false);
                                }}
                            />

                            {/* Join Meeting Dropdown */}
                            {isJoinMeetingOpen && (
                                <div className="absolute top-[100%] left-1/2 -translate-x-1/2 mt-4 w-[280px] bg-[#1C1C1E] border border-white/10 rounded-[24px] shadow-2xl z-50 p-5 animate-in fade-in zoom-in-95 duration-200">
                                    <div className="flex flex-col gap-5">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[14px] font-bold text-gray-300">Join Meeting</span>
                                        </div>

                                        <div className="flex flex-col gap-1">
                                            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest px-1">Meeting ID</span>
                                            <div className="bg-black/20 rounded-xl p-3 border border-white/5 flex items-center justify-between group/id">
                                                <input
                                                    type="text"
                                                    placeholder="Enter Meeting ID..."
                                                    value={joinMeetingId}
                                                    onChange={(e) => setJoinMeetingId(e.target.value)}
                                                    className="bg-transparent border-none outline-none text-[14px] font-mono font-bold text-blue-400 w-full placeholder:text-gray-600"
                                                />
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleJoinMeeting}
                                            disabled={!joinMeetingId.trim()}
                                            className="w-full bg-white/90 disabled:opacity-50 hover:bg-white text-black font-black py-3 rounded-xl transition-all active:scale-95 shadow-lg shadow-white/10"
                                        >
                                            Join Now
                                        </button>
                                    </div>

                                    {/* Arrow */}
                                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#1C1C1E] border-t border-l border-white/10 rotate-45" />
                                </div>
                            )}
                        </div>
                        <LargeActionButton
                            icon={<Calendar className="text-[#FFFFFF]" size={32} />}
                            label="Schedule"
                            color="bg-white/5 border-2 border-[#FFFFFF]"
                            description="Plan upcoming meetings"
                            labelColor="text-white"
                        />
                    </div>

                    {/* Meeting Card (Time only with Background) */}
                    <div className="w-full max-w-[500px] rounded-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] overflow-hidden relative group transition-all duration-500 hover:scale-[1.02]">
                        <Image
                            src="/assets/images/dashboard_card_bg.png"
                            alt="Dashboard Card Background"
                            width={2246}
                            height={1500}
                            className="w-full h-auto object-cover transition-transform duration-1000 group-hover:scale-110 opacity-90"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-100" />

                        <div className="absolute inset-0 p-10 flex flex-col justify-end">
                            <h2 className="text-[64px] font-extrabold text-white leading-none tracking-tighter drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] animate-in fade-in slide-in-from-bottom-4 duration-700">
                                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase()}
                            </h2>
                        </div>
                    </div>
                </div>

                {/* Drawer Overlays */}
                <WalletDrawer isOpen={isWalletOpen} onClose={() => setIsWalletOpen(false)} />
                <NotificationDrawer isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
            </div>
        </main>
    );
}

function SidebarItem({ icon, label, active = false, onClick }: {
    icon: React.ReactNode,
    label: string,
    active?: boolean,
    onClick?: () => void
}) {
    return (
        <div
            onClick={onClick}
            className={`flex items-center justify-center md:justify-start gap-3 px-4 py-3 cursor-pointer rounded-xl transition-all group
            ${active ? "bg-black text-white shadow-lg" : "text-gray-500 hover:bg-gray-100"}`}
        >
            <span className={`${active ? "text-white" : "text-gray-500 group-hover:text-black"} transition-colors`}>
                {icon}
            </span>
            <span className="hidden md:block text-[15px] font-bold tracking-tight">{label}</span>
        </div>
    );
}

function LargeActionButton({ icon, label, color, description, hasDropdown = false, labelColor = "text-white", onClick }: {
    icon: React.ReactNode,
    label: string,
    color: string,
    description: string,
    hasDropdown?: boolean,
    labelColor?: string,
    onClick?: () => void
}) {
    return (
        <div className="flex flex-col items-center gap-4 group">
            <button
                onClick={onClick}
                className={`${color} w-[92px] h-[92px] md:w-[110px] md:h-[110px] rounded-[32px] flex items-center justify-center transition-all hover:scale-110 shadow-2xl active:scale-95 relative overflow-hidden group/btn`}
            >
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                {icon}
                {hasDropdown && (
                    <div className="absolute bottom-3 right-3 text-white/50">
                        <ChevronDown size={16} />
                    </div>
                )}
            </button>
            <div className="text-center">
                <span className={`block text-[16px] font-bold transition-colors ${labelColor} group-hover:text-blue-400`}>{label}</span>
                <span className="text-[12px] text-gray-500 font-medium hidden md:block">{description}</span>
            </div>
        </div>
    );
}

function WalletDrawer({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const { address } = useAccount();
    const [view, setView] = useState<'home' | 'send' | 'receive'>('home');
    const [copied, setCopied] = useState(false);
    const [txHistory, setTxHistory] = useState<TxRecord[]>([]);

    // STRK token on Sepolia — same as room page
    const STRK_CONTRACT = "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";
    const { data: strkBalance } = useBalance({ address: address as `0x${string}`, token: STRK_CONTRACT });
    const formattedBalance = strkBalance ? `${parseFloat(strkBalance.formatted).toFixed(4)} STRK` : "— STRK";

    // Load tx history from localStorage
    useEffect(() => {
        if (address) {
            setTxHistory(loadTxHistory(address));
        }
    }, [address, isOpen]); // re-load when drawer opens

    const handleCopy = () => {
        if (address) {
            navigator.clipboard.writeText(address);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    // Reset view when drawer closes
    useEffect(() => {
        if (!isOpen) {
            setTimeout(() => setView('home'), 500);
        }
    }, [isOpen]);

    return (
        <div className={`absolute inset-0 z-50 transition-all duration-500 flex justify-end ${isOpen ? "visible" : "invisible pointer-events-none"}`}>
            {/* Backdrop Blur */}
            <div
                className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-500 ${isOpen ? "opacity-100" : "opacity-0"}`}
                onClick={onClose}
            />

            {/* Drawer Panel */}
            <div className={`w-full max-w-[440px] bg-[#0E0E10] h-full shadow-2xl border-l border-white/5 relative z-10 transition-transform duration-500 transform ${isOpen ? "translate-x-0" : "translate-x-full"} flex flex-col`}>
                <div className="p-8 flex flex-col gap-8 h-full overflow-y-auto custom-scrollbar">
                    {/* Dynamic Header */}
                    <div className="flex items-center justify-between">
                        <button
                            onClick={view === 'home' ? onClose : () => setView('home')}
                            className="bg-white text-black rounded-full px-4 py-1.5 flex items-center gap-2 text-[14px] font-bold hover:bg-gray-200 transition-colors"
                        >
                            <ChevronLeft size={16} />
                            {view === 'home' ? 'Home' : 'Back'}
                        </button>
                    </div>

                    {view === 'home' && (
                        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div>
                                <h1 className="text-[40px] font-extrabold leading-[1.1] tracking-tight mb-2">Room<br />Wallet</h1>
                            </div>

                            {/* Balance Card */}
                            <div className="bg-[#1C1C1E] rounded-[32px] p-6 border border-white/5 flex flex-col gap-6 shadow-xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <DollarSign size={80} className="text-yellow-500" />
                                </div>

                                <div className="flex items-center justify-between relative z-10">
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <div className="w-4 h-4 rounded-full bg-yellow-500/20 flex items-center justify-center">
                                            <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full" />
                                        </div>
                                        <span className="text-[13px] font-medium uppercase tracking-wider text-yellow-400">Starknet STRK</span>
                                    </div>
                                </div>

                                <div className="flex flex-col relative z-10">
                                    <div className="flex items-baseline gap-3">
                                        <span className="text-[32px] font-bold">{formattedBalance}</span>
                                    </div>
                                    <p className="text-[13px] text-gray-400 mt-2 font-medium">Your connected Argent/Braavos wallet balance.</p>
                                </div>

                                <div className="flex gap-3 relative z-10">
                                    <button
                                        onClick={() => setView('receive')}
                                        className="flex-1 bg-[#2C2C2E] hover:bg-[#3A3A3C] text-white font-black py-4 rounded-2xl transition-all border border-white/5 active:scale-95"
                                    >
                                        Receive
                                    </button>
                                </div>
                            </div>

                            {/* Earnings Section */}
                            <div className="bg-[#1C1C1E] rounded-[32px] p-6 border border-white/5 flex flex-col gap-4 shadow-lg">
                                <span className="text-[15px] font-bold text-gray-400">Earnings</span>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 relative">
                                            <Image
                                                src="/assets/images/usdc.png"
                                                alt="USDC"
                                                fill
                                                className="object-contain"
                                            />
                                        </div>
                                        <span className="text-[20px] font-bold">0 usdc</span>
                                    </div>
                                    <span className="text-gray-500 font-bold">~$0.00</span>
                                </div>
                                <span className="text-[12px] text-gray-600 font-medium">All time on Room</span>
                            </div>

                            {/* History Section */}
                            <div className="flex flex-col gap-4 mt-4">
                                <h2 className="font-bold text-gray-300 uppercase tracking-widest text-[13px] px-2">Transaction History</h2>
                                {txHistory.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-16 gap-4 bg-white/[0.02] rounded-[32px] border border-dashed border-white/5">
                                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center shadow-inner">
                                            <Clock size={24} className="text-gray-700" />
                                        </div>
                                        <span className="text-gray-600 font-bold text-[15px]">No transactions yet</span>
                                        <span className="text-gray-700 text-[12px] text-center max-w-[200px]">Send STRK to someone in a meeting to see it here</span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-3">
                                        {txHistory.map((tx, i) => (
                                            <div key={`${tx.txHash}-${i}`} className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 flex items-center gap-3 hover:bg-white/[0.05] transition-colors">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${tx.direction === 'sent' ? 'bg-red-500/10' : 'bg-green-500/10'}`}>
                                                    {tx.direction === 'sent'
                                                        ? <ArrowRight size={18} className="text-red-400" />
                                                        : <ArrowLeft size={18} className="text-green-400" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[14px] font-bold text-white truncate">
                                                        {tx.direction === 'sent' ? `→ @${tx.to}` : `← @${tx.from}`}
                                                    </p>
                                                    <p className="text-[11px] text-gray-500">{new Date(tx.timestamp).toLocaleString()}</p>
                                                </div>
                                                <div className="flex flex-col items-end shrink-0">
                                                    <span className={`text-[14px] font-black ${tx.direction === 'sent' ? 'text-red-400' : 'text-green-400'}`}>
                                                        {tx.direction === 'sent' ? '-' : '+'}{tx.amount} {tx.symbol}
                                                    </span>
                                                    {tx.txHash && (
                                                        <a
                                                            href={`https://sepolia.voyager.online/tx/${tx.txHash}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-[10px] text-blue-400 hover:text-blue-300"
                                                        >
                                                            View ↗
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {view === 'send' && (
                        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div>
                                <h1 className="text-[40px] font-extrabold leading-[1.1] tracking-tight mb-2">Send<br />USDC</h1>
                                <p className="text-gray-500 font-medium">Send USDC to any Starknet wallet instantly.</p>
                            </div>

                            <div className="flex flex-col gap-6">
                                <div className="flex flex-col gap-3">
                                    <label className="text-[13px] font-bold text-gray-400 uppercase tracking-widest px-2">Recipient Address</label>
                                    <div className="bg-[#1C1C1E] rounded-2xl border border-white/5 p-4 focus-within:border-blue-500/50 transition-all">
                                        <input
                                            type="text"
                                            placeholder="Enter Starknet address (0x...)"
                                            className="bg-transparent border-none outline-none w-full text-white placeholder:text-gray-600 font-medium"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <label className="text-[13px] font-bold text-gray-400 uppercase tracking-widest px-2">Amount (USDC)</label>
                                    <div className="bg-[#1C1C1E] rounded-2xl border border-white/5 p-4 flex items-center justify-between focus-within:border-blue-500/50 transition-all">
                                        <input
                                            type="number"
                                            placeholder="0.00"
                                            className="bg-transparent border-none outline-none w-full text-white placeholder:text-gray-600 font-bold text-[24px]"
                                        />
                                        <span className="text-blue-400 font-black text-[14px] uppercase tracking-wider">Max</span>
                                    </div>
                                    <div className="flex justify-between px-2">
                                        <span className="text-[12px] text-gray-500 font-medium">Balance: 0 USDC</span>
                                        <span className="text-[12px] text-gray-500 font-medium">~$0.00</span>
                                    </div>
                                </div>
                            </div>

                            <button className="w-full bg-[#2775CA] hover:bg-[#1E5DA1] text-white font-black py-5 rounded-[24px] transition-all shadow-xl shadow-blue-500/10 flex items-center justify-center gap-3 mt-4 active:scale-95 group/sendbtn">
                                <span>Continue</span>
                                <ArrowRight size={20} className="group-hover/sendbtn:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    )}

                    {view === 'receive' && (
                        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div>
                                <h1 className="text-[40px] font-extrabold leading-[1.1] tracking-tight mb-2">Receive<br />USDC</h1>
                                <p className="text-gray-500 font-medium">Your Starknet address to receive assets.</p>
                            </div>

                            <div className="bg-[#1C1C1E] rounded-[40px] p-10 border border-white/5 flex flex-col items-center gap-8 shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

                                <div className="w-48 h-48 bg-white rounded-3xl p-4 flex items-center justify-center shadow-inner relative group/qr">
                                    {/* Placeholder for QR Code */}
                                    <div className="w-full h-full bg-gray-100 rounded-xl flex items-center justify-center">
                                        <div className="w-32 h-32 border-4 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                                            <span className="text-gray-400 font-black text-[12px] uppercase">QR Code</span>
                                        </div>
                                    </div>
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/qr:opacity-100 transition-opacity rounded-3xl flex items-center justify-center flex-col gap-2">
                                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
                                        </div>
                                        <span className="text-white text-[12px] font-bold">Scanning active</span>
                                    </div>
                                </div>

                                <div className="flex flex-col items-center gap-4 w-full">
                                    <div className="bg-black/40 rounded-2xl border border-white/5 p-4 w-full group/addr cursor-pointer hover:bg-black/60 transition-all" onClick={handleCopy}>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-gray-500 text-[11px] font-bold uppercase tracking-widest">Your Address</span>
                                            <div className="flex items-center justify-between gap-4">
                                                <span className="text-white font-mono break-all text-[14px] leading-relaxed">
                                                    {address}
                                                </span>
                                                <div className={`p-2 rounded-lg transition-all ${copied ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-gray-400 group-hover/addr:text-white group-hover/addr:bg-white/10'}`}>
                                                    {copied ? <Check size={18} /> : <Copy size={18} />}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleCopy}
                                        className={`w-full font-black py-4 rounded-[20px] transition-all flex items-center justify-center gap-2 border active:scale-95
                                            ${copied ? 'bg-green-500 border-green-500 text-white' : 'bg-white/5 border-white/5 text-gray-300 hover:bg-white/10 hover:border-white/10'}
                                        `}
                                    >
                                        {copied ? (
                                            <>
                                                <Check size={20} />
                                                <span>Copied!</span>
                                            </>
                                        ) : (
                                            <>
                                                <Copy size={20} />
                                                <span>Copy Address</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-4 flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                                    <span className="text-blue-400 font-bold text-[14px]">!</span>
                                </div>
                                <p className="text-[12px] text-blue-300/60 font-medium leading-relaxed">
                                    Only send USDC assets to this address. Sending other tokens may result in permanent loss.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function NotificationDrawer({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    return (
        <div className={`absolute inset-0 z-50 transition-all duration-500 flex justify-end ${isOpen ? "visible" : "invisible pointer-events-none"}`}>
            {/* Backdrop Blur */}
            <div
                className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-500 ${isOpen ? "opacity-100" : "opacity-0"}`}
                onClick={onClose}
            />

            {/* Drawer Panel */}
            <div className={`w-full max-w-[440px] bg-[#0E0E10] h-full shadow-2xl border-l border-white/5 relative z-10 transition-transform duration-500 transform ${isOpen ? "translate-x-0" : "translate-x-full"} flex flex-col`}>
                <div className="p-8 flex flex-col gap-8 h-full overflow-y-auto custom-scrollbar">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <h2 className="text-[24px] font-bold">Notifications</h2>
                        <button
                            onClick={onClose}
                            className="bg-white/5 hover:bg-white/10 text-white rounded-full p-2 transition-colors border border-white/10"
                        >
                            <ChevronLeft className="rotate-180" size={20} />
                        </button>
                    </div>

                    {/* Empty State */}
                    <div className="flex-1 flex flex-col items-center justify-center py-20 gap-6 text-center">
                        <div className="relative">
                            <div className="w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-500/20 shadow-2xl">
                                <Bell size={40} className="text-blue-400 animate-pulse" />
                            </div>
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full border-4 border-[#0E0E10]" />
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-[20px] font-bold text-white">All caught up!</h3>
                            <p className="text-gray-500 max-w-[260px] mx-auto text-[15px] leading-relaxed">
                                You don't have any new notifications at the moment. We'll let you know when something important happens.
                            </p>
                        </div>

                        <button
                            onClick={onClose}
                            className="mt-4 px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[14px] font-bold text-gray-300 transition-all active:scale-95"
                        >
                            Close Drawer
                        </button>
                    </div>

                    {/* Footer / Tip */}
                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-center">
                        <p className="text-[12px] text-gray-600 font-medium italic">
                            Tip: You can manage your notification preferences in Settings.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
