"use client";

import React, { useState, useEffect, useRef } from "react";
import { saveTx } from "@/lib/txHistory";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
    Mic, MicOff, Video, VideoOff, Users, MessageSquare, Smile,
    ScreenShare, MoreHorizontal, PhoneOff, Maximize2,
    ChevronUp, X, MessageCircle, Paperclip, SmilePlus, Send,
    ShieldCheck, Gift, Coins, Loader2, Hand, CheckCircle2, AlertCircle,
    ExternalLink, AtSign, DollarSign
} from "lucide-react";
import { useAccount } from "@starknet-react/core";
import { useStrkBalance } from "@/lib/useStrkBalance";
import {
    LiveKitRoom,
    RoomAudioRenderer,
    GridLayout,
    FocusLayoutContainer,
    FocusLayout,
    CarouselLayout,
    ParticipantTile,
    useTracks,
    TrackReferenceOrPlaceholder,
    useConnectionState,
    useLocalParticipant,
    useParticipants,
    useChat,
    useDataChannel,
    useRoomContext
} from "@livekit/components-react";
import { Track, ConnectionState, Participant, LocalParticipant } from "livekit-client";
import PreJoinScreen from "@/components/PreJoinScreen";

// STRK token on Starknet Sepolia Testnet (get from faucet.starknet.io)
const TOKEN_CONTRACT = "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";
const TOKEN_SYMBOL = "STRK";
const TOKEN_DECIMALS = 18;
const TOKEN_MIN = 0.5; // minimum send amount
const VOYAGER_BASE = "https://sepolia.voyager.online/tx";

export default function MeetingRoomPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const meetingId = params.id as string;
    const mode = searchParams.get("mode");
    const { address, isConnected } = useAccount();

    const [token, setToken] = useState("");
    const [liveKitUrl, setLiveKitUrl] = useState("");
    const [isConnecting, setIsConnecting] = useState(false);
    const [connectionError, setConnectionError] = useState("");

    // Pre-Join States
    const [preJoinComplete, setPreJoinComplete] = useState(false);
    const [displayName, setDisplayName] = useState("");
    const [initialMicEnabled, setInitialMicEnabled] = useState(true);
    const [initialVideoEnabled, setInitialVideoEnabled] = useState(true);

    useEffect(() => {
        if (!isConnected) {
            router.push("/");
        }
    }, [isConnected, router]);

    useEffect(() => {
        const fetchToken = async () => {
            if (!address || !preJoinComplete) return;
            try {
                setIsConnecting(true);
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 15000);

                if (mode === "create") {
                    const createRes = await fetch("/api/room/create", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ roomId: meetingId, walletAddress: address, displayName }),
                        signal: controller.signal
                    });

                    if (createRes.ok) {
                        const data = await createRes.json();
                        setToken(data.token);
                        setLiveKitUrl(data.livekitUrl);
                    } else {
                        const createErrorData = await createRes.text();
                        setConnectionError(`Host creation failed: ${createRes.status} - ${createErrorData}`);
                    }
                    clearTimeout(timeoutId);
                } else {
                    const res = await fetch("/api/room/join", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ roomId: meetingId, walletAddress: address, displayName }),
                        signal: controller.signal
                    });

                    if (res.ok) {
                        const data = await res.json();
                        setToken(data.token);
                        setLiveKitUrl(data.livekitUrl);
                    } else {
                        const joinErrorData = await res.text();
                        setConnectionError(`Failed to join room: ${res.status} - ${joinErrorData}`);
                    }
                    clearTimeout(timeoutId);
                }
            } catch (error: any) {
                setConnectionError(error.message || "Network error occurred.");
            } finally {
                setIsConnecting(false);
            }
        };

        fetchToken();
    }, [address, meetingId, preJoinComplete, displayName]);

    const handleEndMeeting = () => {
        router.push("/app/dashboard");
    };

    const handlePreJoinSubmit = (name: string, mic: boolean, video: boolean) => {
        setDisplayName(name);
        setInitialMicEnabled(mic);
        setInitialVideoEnabled(video);
        setPreJoinComplete(true);
    };

    if (!preJoinComplete) {
        return (
            <PreJoinScreen
                onSubmit={handlePreJoinSubmit}
                onCancel={handleEndMeeting}
            />
        );
    }

    if (isConnecting) {
        return (
            <div className="flex flex-col h-screen bg-[#0A0A0B] items-center justify-center gap-4 text-gray-400 font-sans">
                <Loader2 size={32} className="animate-spin text-blue-500" />
                <span>Connecting to secure Starknet room...</span>
            </div>
        );
    }

    if (!token || !liveKitUrl) {
        return (
            <div className="flex flex-col h-screen bg-[#0A0A0B] items-center justify-center gap-4 text-gray-400 font-sans p-8 text-center">
                <span className="text-red-400 text-xl font-bold">Failed to connect to the meeting.</span>
                {connectionError && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm max-w-xl break-words">
                        {connectionError}
                    </div>
                )}
                <button onClick={handleEndMeeting} className="px-6 py-3 mt-4 bg-white/10 rounded-xl hover:bg-white/20 transition-colors text-white font-bold">Go Back</button>
            </div>
        );
    }

    const isHostMode = mode === "create";

    return (
        <LiveKitRoom
            video={initialVideoEnabled}
            audio={initialMicEnabled}
            token={token}
            serverUrl={liveKitUrl}
            data-lk-theme="default"
            className="flex flex-col h-screen bg-[#0A0A0B] text-white font-sans overflow-hidden"
        >
            <RoomInterface
                meetingId={meetingId}
                address={address}
                displayName={displayName}
                onLeave={handleEndMeeting}
                isInitialHost={isHostMode}
            />
            <RoomAudioRenderer />
        </LiveKitRoom>
    );
}

// ─── Room Interface ────────────────────────────────────────────────────────────
function RoomInterface({
    meetingId,
    address,
    displayName,
    onLeave,
    isInitialHost
}: {
    meetingId: string,
    address?: string,
    displayName: string,
    onLeave: () => void,
    isInitialHost: boolean
}) {
    // ── Account + Balance ──
    const { account } = useAccount();
    const { formatted: strkFormatted, isLoading: strkLoading } = useStrkBalance(address);

    // ── UI State ──
    const [isHandRaised, setIsHandRaised] = useState(false);
    const [raisedHands, setRaisedHands] = useState<string[]>([]);
    const [isChatOpen, setIsChatOpen] = useState(true);
    const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
    const [chatInput, setChatInput] = useState("");
    const [activeReaction, setActiveReaction] = useState<{ emoji: string, from: string } | null>(null);

    // ── Token Send State ──
    const [isSendUsdcOpen, setIsSendUsdcOpen] = useState(false);
    const [usdcRecipient, setUsdcRecipient] = useState<{ name: string, walletAddress: string } | null>(null);
    const [usdcAmount, setUsdcAmount] = useState(1);
    const [customAmount, setCustomAmount] = useState("");
    const [txStatus, setTxStatus] = useState<"idle" | "pending" | "success" | "error">("idle");
    const [txHash, setTxHash] = useState("");
    const [txError, setTxError] = useState("");
    // ── Payment received notification ──
    const [paymentNotif, setPaymentNotif] = useState<{ from: string, amount: string } | null>(null);

    // ── LiveKit Hooks ──
    const { localParticipant, isMicrophoneEnabled, isCameraEnabled, isScreenShareEnabled } = useLocalParticipant();
    const { send: sendChatMessage, chatMessages, isSending } = useChat();
    const { send: sendReactionData, message: incomingReaction } = useDataChannel("reactions");
    const { send: sendHandUpdate, message: handMessage } = useDataChannel("hands");
    const { send: sendPaymentNotif, message: incomingPayment } = useDataChannel("payments");
    const participants = useParticipants();

    const role = localParticipant?.metadata ? JSON.parse(localParticipant.metadata).role : "participant";
    const isHost = role === "host";

    const shortenedAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Guest";
    const userIdentifier = displayName || shortenedAddress;

    // ── Tracks ──
    const tracks = useTracks(
        [{ source: Track.Source.Camera, withPlaceholder: true }],
        { onlySubscribed: false },
    );
    const screenShareTracks = useTracks(
        [{ source: Track.Source.ScreenShare, withPlaceholder: false }],
        { onlySubscribed: false },
    );
    const hasScreenShare = screenShareTracks.length > 0;

    // ── Reactions ──
    useEffect(() => {
        if (incomingReaction) {
            try {
                const data = JSON.parse(new TextDecoder().decode(incomingReaction.payload));
                setActiveReaction(data);
                setTimeout(() => setActiveReaction(null), 3000);
            } catch (e) { console.error(e); }
        }
    }, [incomingReaction]);

    const handleSendReaction = (emoji: string) => {
        const payload = JSON.stringify({ emoji, from: userIdentifier });
        sendReactionData(new TextEncoder().encode(payload), { reliable: true });
        setActiveReaction({ emoji, from: "You" });
        setTimeout(() => setActiveReaction(null), 3000);
        setIsEmojiPickerOpen(false);
    };

    // ── Hand Raise ──
    useEffect(() => {
        if (handMessage) {
            try {
                const data = JSON.parse(new TextDecoder().decode(handMessage.payload));
                if (data.isRaised) {
                    setRaisedHands(prev => !prev.includes(data.from) ? [...prev, data.from] : prev);
                } else {
                    setRaisedHands(prev => prev.filter(id => id !== data.from));
                }
            } catch (e) { console.error(e); }
        }
    }, [handMessage]);

    const toggleHand = () => {
        const newState = !isHandRaised;
        setIsHandRaised(newState);
        const payload = JSON.stringify({ isRaised: newState, from: userIdentifier });
        sendHandUpdate(new TextEncoder().encode(payload), { reliable: true });
        if (newState) {
            setRaisedHands(prev => !prev.includes("You") ? [...prev, "You"] : prev);
        } else {
            setRaisedHands(prev => prev.filter(id => id !== "You"));
        }
    };

    // ── Chat ──
    const handleSendMessage = () => {
        if (chatInput.trim()) {
            sendChatMessage(chatInput.trim());
            setChatInput("");
        }
    };

    // ── End Meeting ──
    const handleEndMeetingGlobally = async () => {
        try {
            const res = await fetch("/api/room/end", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ roomId: meetingId, walletAddress: address })
            });
            onLeave();
        } catch (err) {
            onLeave();
        }
    };

    // ── Media controls ──
    const toggleMic = () => localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
    const toggleVideo = () => localParticipant.setCameraEnabled(!isCameraEnabled);
    const toggleScreenShare = () => localParticipant.setScreenShareEnabled(!isScreenShareEnabled);

    // ── USDC Send ──
    const openSendUsdc = (recipient?: { name: string, walletAddress: string }) => {
        setUsdcRecipient(recipient || null);
        setTxStatus("idle");
        setTxHash("");
        setTxError("");
        setIsSendUsdcOpen(true);
    };

    const handleSendToken = async () => {
        if (!account || !usdcRecipient) return;
        const finalAmount = customAmount ? parseFloat(customAmount) : usdcAmount;
        if (!finalAmount || finalAmount < TOKEN_MIN) return;

        try {
            setTxStatus("pending");

            // Proper Cairo uint256 encoding: split into low/high 128-bit parts
            // TOKEN_DECIMALS = 18, so multiplier = 1_000_000_000_000_000_000n
            const DECIMALS_FACTOR = 1_000_000_000_000_000_000n; // 10^18
            const amountRaw = BigInt(Math.round(finalAmount * 1e9)) * (DECIMALS_FACTOR / 1_000_000_000n);
            const U128_MAX = 340282366920938463463374607431768211456n; // 2^128
            const low = amountRaw % U128_MAX;
            const high = amountRaw / U128_MAX;

            const result = await account.execute([{
                contractAddress: TOKEN_CONTRACT,
                entrypoint: "transfer",
                calldata: [
                    usdcRecipient.walletAddress,
                    low.toString(),
                    high.toString()
                ]
            }]);

            const txHash = result.transaction_hash;
            setTxHash(txHash);
            setTxStatus("success");

            // Save to localStorage history (shows in dashboard)
            if (address) {
                saveTx(address, {
                    txHash,
                    from: userIdentifier,
                    fromAddress: address,
                    to: usdcRecipient.name,
                    toAddress: usdcRecipient.walletAddress,
                    amount: finalAmount.toString(),
                    symbol: TOKEN_SYMBOL,
                    timestamp: Date.now(),
                    direction: "sent"
                });
            }

            // Notify recipient via LiveKit data channel
            const notifPayload = JSON.stringify({
                to: usdcRecipient.walletAddress,
                from: userIdentifier,
                fromAddress: address,
                amount: finalAmount.toString()
            });
            sendPaymentNotif(new TextEncoder().encode(notifPayload), { reliable: true });
        } catch (err: any) {
            console.error("Token send error:", err);
            setTxError(err?.message || "Transaction failed");
            setTxStatus("error");
        }
    };

    // Participants available to receive token (exclude self)
    const otherParticipants = participants.filter(p => p.identity !== address);

    // Formatted STRK balance for header display
    const formattedBalance = strkLoading ? "…" : strkFormatted ? `${strkFormatted} ${TOKEN_SYMBOL}` : null;

    // Listen for incoming payment notifications via LiveKit
    useEffect(() => {
        if (incomingPayment) {
            try {
                const data = JSON.parse(new TextDecoder().decode(incomingPayment.payload));
                // Only show/save if this payment is addressed to me
                if (data.to === address) {
                    setPaymentNotif({ from: data.from, amount: data.amount });
                    setTimeout(() => setPaymentNotif(null), 6000);
                    // Save received tx to my history so it appears in dashboard
                    if (address) {
                        saveTx(address, {
                            txHash: "",  // no hash available on recipient side
                            from: data.from,
                            fromAddress: data.fromAddress || "",
                            to: userIdentifier,
                            toAddress: address,
                            amount: data.amount,
                            symbol: TOKEN_SYMBOL,
                            timestamp: Date.now(),
                            direction: "received"
                        });
                    }
                }
            } catch (e) { console.error(e); }
        }
    }, [incomingPayment, address]);

    return (
        <div className="flex flex-col flex-1 relative overflow-hidden">

            {/* ── Header Overlay ── */}
            <div className="absolute top-4 left-6 z-20 flex items-center gap-4">
                {/* Username + shield badge */}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-lg border border-white/5 shadow-xl">
                    <div className="w-5 h-5 relative">
                        <Image src="/assets/logos/logo.png" alt="Room" fill className="object-contain" />
                    </div>
                    <span className="text-[13px] font-bold tracking-tight text-white/90">{displayName || shortenedAddress}</span>
                    <div className="ml-2 flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                        <ShieldCheck size={14} className="text-green-500" />
                    </div>
                </div>
                {/* Participant count */}
                <div className="px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-lg border border-white/5 flex items-center gap-2">
                    <Users size={14} className="text-gray-400" />
                    <span className="text-[12px] font-bold text-gray-300">{participants.length}</span>
                </div>
                {/* Wallet STRK balance */}
                {formattedBalance && (
                    <div
                        className="px-3 py-1.5 bg-yellow-500/10 backdrop-blur-md rounded-lg border border-yellow-500/20 flex items-center gap-2 cursor-pointer hover:bg-yellow-500/20 transition-colors"
                        onClick={() => openSendUsdc()}
                        title="Click to send STRK"
                    >
                        <Coins size={13} className="text-yellow-400" />
                        <span className="text-[12px] font-bold text-yellow-300">{formattedBalance}</span>
                    </div>
                )}
            </div>

            {/* ── Raised Hands ── */}
            {raisedHands.length > 0 && (
                <div className="absolute top-20 left-6 z-20 flex flex-col gap-2">
                    {raisedHands.map((hand, idx) => (
                        <div key={`${hand}-${idx}`} className="bg-yellow-500/90 text-black px-3 py-1.5 rounded-lg flex items-center gap-2 font-bold text-[13px] animate-in slide-in-from-left shadow-lg">
                            <Hand size={16} className="animate-pulse" />
                            <span>{hand} raised hand</span>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Payment received banner ── */}
            {paymentNotif && (
                <div className="absolute top-20 right-6 z-50 animate-in slide-in-from-right duration-300 bg-yellow-500/90 text-black px-4 py-3 rounded-2xl flex items-center gap-3 shadow-2xl backdrop-blur-md border border-yellow-400">
                    <Coins size={20} className="text-black" />
                    <div>
                        <p className="text-[13px] font-black">You received {paymentNotif.amount} {TOKEN_SYMBOL}!</p>
                        <p className="text-[11px] font-bold opacity-70">from {paymentNotif.from}</p>
                    </div>
                    <button onClick={() => setPaymentNotif(null)} className="ml-2 opacity-60 hover:opacity-100">
                        <X size={14} />
                    </button>
                </div>
            )}

            {/* ── Top Right Controls ── */}
            <div className="absolute top-4 right-6 z-20 flex items-center gap-2">
                <button className="p-2 bg-black/40 backdrop-blur-md rounded-lg border border-white/5 hover:bg-white/5 transition-colors text-gray-400 hover:text-white">
                    <Maximize2 size={18} />
                </button>
            </div>

            {/* ── Reaction Overlay (floating above the content) ── */}
            {activeReaction && (
                <div className="absolute top-32 left-1/2 -translate-x-1/2 z-50 animate-bounce flex items-center gap-3 bg-black/60 px-5 py-3 rounded-full backdrop-blur-md border border-white/10 shadow-2xl">
                    <span className="text-4xl">{activeReaction.emoji}</span>
                    <span className="text-sm font-bold text-gray-300 pr-2">{activeReaction.from}</span>
                </div>
            )}

            {/* ── Main Layout: Video + Chat ── */}
            <div className="flex flex-1 relative overflow-hidden">

                {/* Video Grid Area */}
                <div className="flex-1 flex flex-col relative bg-[#0F0F10] transition-all duration-300">
                    <div className="w-full h-full p-3 pt-20 pb-3 relative flex">
                        {hasScreenShare ? (
                            <FocusLayoutContainer className="w-full h-full flex flex-col md:flex-row gap-3">
                                <div className="flex-1 h-full relative">
                                    <FocusLayout trackRef={screenShareTracks[0]} />
                                </div>
                                <div className="md:w-[220px] md:h-full h-[120px] w-full shrink-0">
                                    <CarouselLayout tracks={tracks as TrackReferenceOrPlaceholder[]}>
                                        <ParticipantTile />
                                    </CarouselLayout>
                                </div>
                            </FocusLayoutContainer>
                        ) : (
                            <GridLayout
                                tracks={tracks as TrackReferenceOrPlaceholder[]}
                                style={{ height: "100%", width: "100%" }}
                            >
                                <ParticipantTile />
                            </GridLayout>
                        )}
                    </div>
                </div>

                {/* ── Chat Sidebar ── */}
                {isChatOpen && (
                    <div className="w-[380px] bg-[#111112] border-l border-white/5 flex flex-col animate-in slide-in-from-right duration-300 shadow-2xl relative z-30">
                        <div className="p-6 flex items-center justify-between border-b border-white/5">
                            <h2 className="text-[18px] font-bold tracking-tight">Meeting Chat</h2>
                            <div className="flex items-center gap-2">
                                <button className="p-2 hover:bg-white/5 rounded-lg text-gray-400"><Maximize2 size={16} /></button>
                                <button onClick={() => setIsChatOpen(false)} className="p-2 hover:bg-white/5 rounded-lg text-gray-400"><X size={18} /></button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 custom-scrollbar relative">
                            {chatMessages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-10 opacity-40 mt-10">
                                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                                        <MessageCircle size={24} />
                                    </div>
                                    <span className="text-[14px] font-medium text-center max-w-[200px]">Send a message to start the conversation</span>
                                </div>
                            ) : (
                                chatMessages.map((msg: any) => (
                                    <div key={msg.id} className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[12px] font-bold text-gray-400">{msg.from?.name || msg.from?.identity || "Unknown"}</span>
                                            <span className="text-[10px] text-gray-600">{new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                                        </div>
                                        <div className="bg-white/5 p-3 rounded-xl text-[14px] text-gray-200 w-fit max-w-full break-words">
                                            {msg.message}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Chat Input */}
                        <div className="p-6 border-t border-white/5 bg-[#111112] relative">
                            <div className="flex items-center gap-2 mb-3 px-1">
                                <span className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">To:</span>
                                <button className="flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400 text-[12px] font-bold">
                                    Everyone <ChevronUp size={12} />
                                </button>
                            </div>

                            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 focus-within:border-blue-500/50 transition-all flex flex-col gap-4">
                                <textarea
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage();
                                        }
                                    }}
                                    placeholder="Type message here ..."
                                    className="bg-transparent border-none outline-none resize-none w-full text-[14px] text-gray-200 placeholder:text-gray-600 min-h-[40px] max-h-[120px] custom-scrollbar"
                                />
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1">
                                        <button className="p-2 hover:bg-white/5 rounded-lg text-gray-400"><Paperclip size={18} /></button>
                                        <button className="p-2 hover:bg-white/5 rounded-lg text-gray-400"><SmilePlus size={18} /></button>
                                        {/* Gift/Send USDC button */}
                                        <button
                                            onClick={() => openSendUsdc()}
                                            className="p-2 hover:bg-yellow-500/10 rounded-lg text-gray-400 hover:text-yellow-400 transition-all"
                                            title="Send USDC"
                                        >
                                            <Gift size={18} />
                                        </button>
                                    </div>
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={!chatInput.trim() || isSending}
                                        className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl hover:bg-blue-500/20 transition-all disabled:opacity-50 active:scale-95"
                                    >
                                        <Send size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="mt-2 flex items-center justify-center gap-2 py-1">
                                <Users size={12} className="text-gray-600" />
                                <span className="text-[11px] font-bold text-gray-600">Who can see your messages?</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Bottom Toolbar ── */}
            <div className="h-[96px] bg-[#0A0A0B]/80 backdrop-blur-xl border-t border-white/5 px-8 flex items-center justify-between z-40 relative shadow-[0_-20px_40px_-5px_rgba(0,0,0,0.4)]">

                {/* Left: Mic + Camera */}
                <div className="flex items-center gap-2 min-w-[120px]">
                    <div className="flex flex-col group p-1">
                        <ControlButton
                            icon={!isMicrophoneEnabled ? <MicOff className="text-red-500" /> : <Mic />}
                            label={!isMicrophoneEnabled ? "Unmute" : "Mute"}
                            onClick={toggleMic}
                            hasArrow
                        />
                    </div>
                    <div className="flex flex-col group p-1">
                        <ControlButton
                            icon={!isCameraEnabled ? <VideoOff className="text-red-500" /> : <Video />}
                            label={!isCameraEnabled ? "Start Video" : "Stop Video"}
                            onClick={toggleVideo}
                            hasArrow
                        />
                    </div>
                </div>

                {/* Center: Main Controls */}
                <div className="flex items-center gap-1 md:gap-4 bg-white/[0.02] border border-white/5 px-4 py-1.5 rounded-2xl shadow-xl">
                    <ControlButton icon={<Users />} label="Participants" badge={participants.length.toString()} hasArrow />
                    <ControlButton
                        icon={<MessageSquare />}
                        label="Chat"
                        hasArrow
                        active={isChatOpen}
                        onClick={() => setIsChatOpen(!isChatOpen)}
                    />

                    {/* ── Reactions Button with floating popup ── */}
                    <div className="relative">
                        <ControlButton
                            icon={<Smile />}
                            label="Reactions"
                            active={isEmojiPickerOpen}
                            onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
                            hasArrow
                        />
                        {/* Floating emoji popup — works WITHOUT chat being open */}
                        {isEmojiPickerOpen && (
                            <div className="absolute bottom-[calc(100%+12px)] left-1/2 -translate-x-1/2 bg-[#1C1C1E] border border-white/10 rounded-2xl p-3 flex gap-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                                {["👍", "👏", "❤️", "😂", "🎉", "😮", "🔥", "🤩"].map(emoji => (
                                    <button
                                        key={emoji}
                                        onClick={() => handleSendReaction(emoji)}
                                        className="text-2xl hover:bg-white/10 hover:scale-125 transition-all p-2 rounded-xl"
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <ControlButton
                        icon={<Hand className={isHandRaised ? "text-yellow-500" : ""} />}
                        label="Raise"
                        active={isHandRaised}
                        onClick={toggleHand}
                    />
                    <div className="w-px h-8 bg-white/5 mx-2" />

                    {/* ── Send USDC Button ── */}
                    <div className="relative">
                        <ControlButton
                            icon={<Coins className="text-yellow-400" />}
                            label="Send USDC"
                            onClick={() => openSendUsdc()}
                        />
                    </div>

                    <ControlButton
                        icon={<ScreenShare className={isScreenShareEnabled ? "text-red-500 animate-pulse" : "text-green-500"} />}
                        label={isScreenShareEnabled ? "Stop Sharing" : "Share Screen"}
                        onClick={toggleScreenShare}
                        hasArrow
                    />
                    <ControlButton icon={<MoreHorizontal />} label="More" />
                </div>

                {/* Right: End / Leave */}
                <div className="min-w-[120px] flex justify-end gap-2">
                    {isHost && (
                        <button
                            onClick={handleEndMeetingGlobally}
                            className="flex flex-col items-center gap-1.5 px-6 py-2 bg-red-500 hover:bg-red-600 group transition-all rounded-2xl border border-red-500/20 shadow-lg shadow-red-500/20 active:scale-95"
                            title="End meeting for all participants"
                        >
                            <PhoneOff size={22} className="text-white transition-colors" />
                            <span className="text-[10px] font-bold text-white uppercase tracking-[0.1em]">End All</span>
                        </button>
                    )}
                    <button
                        onClick={onLeave}
                        className="flex flex-col items-center gap-1.5 px-6 py-2 bg-white/10 hover:bg-white/20 group transition-all rounded-2xl border border-white/5 active:scale-95"
                        title="Leave meeting"
                    >
                        <PhoneOff size={22} className="text-gray-300 group-hover:text-white transition-colors rotate-[135deg]" />
                        <span className="text-[10px] font-bold text-gray-300 group-hover:text-white uppercase tracking-[0.1em]">Leave</span>
                    </button>
                </div>
            </div>

            {/* ── Send USDC Modal ── */}
            {isSendUsdcOpen && (
                <div
                    className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
                    onClick={(e) => { if (e.target === e.currentTarget) { setIsSendUsdcOpen(false); } }}
                >
                    <div className="bg-[#111112] border border-white/10 rounded-3xl w-full max-w-[440px] shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">

                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-yellow-500/10 rounded-xl flex items-center justify-center">
                                    <Coins size={20} className="text-yellow-400" />
                                </div>
                                <div>
                                    <h2 className="text-[17px] font-bold">Send USDC</h2>
                                    <p className="text-[12px] text-gray-500">Starknet · instant transfer</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsSendUsdcOpen(false)}
                                className="p-2 hover:bg-white/5 rounded-xl text-gray-400 hover:text-white transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-6 flex flex-col gap-6">

                            {txStatus === "success" ? (
                                /* Success state */
                                <div className="flex flex-col items-center gap-4 py-4">
                                    <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
                                        <CheckCircle2 size={32} className="text-green-400" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[16px] font-bold text-green-400">Sent!</p>
                                        <p className="text-[13px] text-gray-400 mt-1">
                                            {customAmount || usdcAmount} USDC → @{usdcRecipient?.name}
                                        </p>
                                    </div>
                                    {txHash && (
                                        <a
                                            href={`${VOYAGER_BASE}/${txHash}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-[12px] text-blue-400 hover:text-blue-300 transition-colors"
                                        >
                                            View on Voyager <ExternalLink size={12} />
                                        </a>
                                    )}
                                    <button
                                        onClick={() => { setTxStatus("idle"); setUsdcRecipient(null); setCustomAmount(""); }}
                                        className="px-6 py-2.5 bg-white/5 rounded-xl text-[13px] font-bold hover:bg-white/10 transition-colors"
                                    >
                                        Send Again
                                    </button>
                                </div>
                            ) : txStatus === "error" ? (
                                /* Error state */
                                <div className="flex flex-col items-center gap-4 py-4">
                                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
                                        <AlertCircle size={32} className="text-red-400" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[16px] font-bold text-red-400">Transaction Failed</p>
                                        <p className="text-[12px] text-gray-500 mt-1 max-w-[280px] break-words">{txError}</p>
                                    </div>
                                    <button
                                        onClick={() => setTxStatus("idle")}
                                        className="px-6 py-2.5 bg-white/5 rounded-xl text-[13px] font-bold hover:bg-white/10 transition-colors"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            ) : (
                                /* Normal send form */
                                <>
                                    {/* Step 1: Pick recipient */}
                                    <div>
                                        <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-2">
                                            <AtSign size={12} /> Recipients
                                        </p>
                                        {otherParticipants.length === 0 ? (
                                            <div className="text-[13px] text-gray-500 text-center py-4 bg-white/[0.02] rounded-2xl border border-white/5">
                                                No other participants in the room
                                            </div>
                                        ) : (
                                            <div className="flex flex-col gap-2">
                                                {otherParticipants.map((p) => {
                                                    const name = p.name || `${p.identity.slice(0, 6)}...${p.identity.slice(-4)}`;
                                                    const isSelected = usdcRecipient?.walletAddress === p.identity;
                                                    return (
                                                        <button
                                                            key={p.identity}
                                                            onClick={() => setUsdcRecipient({ name, walletAddress: p.identity })}
                                                            className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all text-left ${isSelected
                                                                ? "bg-yellow-500/10 border-yellow-500/40 text-yellow-300"
                                                                : "bg-white/[0.02] border-white/5 hover:bg-white/5 hover:border-white/10"
                                                                }`}
                                                        >
                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold ${isSelected ? "bg-yellow-500/20 text-yellow-300" : "bg-white/10 text-gray-300"}`}>
                                                                {name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-[14px] font-bold">@{name}</span>
                                                                <span className="text-[11px] text-gray-500 font-mono">
                                                                    {p.identity.slice(0, 10)}...{p.identity.slice(-6)}
                                                                </span>
                                                            </div>
                                                            {isSelected && (
                                                                <CheckCircle2 size={16} className="ml-auto text-yellow-400" />
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>

                                    {/* Step 2: Pick amount */}
                                    <div>
                                        <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-2">
                                            <DollarSign size={12} /> Amount (USDC)
                                        </p>
                                        <div className="grid grid-cols-4 gap-2 mb-3">
                                            {[5, 10, 25, 50].map((amt) => (
                                                <button
                                                    key={amt}
                                                    onClick={() => { setUsdcAmount(amt); setCustomAmount(""); }}
                                                    className={`py-2.5 rounded-xl text-[13px] font-bold transition-all border ${usdcAmount === amt && !customAmount
                                                        ? "bg-yellow-500 text-black border-yellow-500 shadow-lg shadow-yellow-500/20"
                                                        : "bg-white/5 text-gray-300 border-white/10 hover:border-yellow-500/40"
                                                        }`}
                                                >
                                                    {amt}
                                                </button>
                                            ))}
                                        </div>
                                        <input
                                            type="number"
                                            placeholder="Custom amount..."
                                            value={customAmount}
                                            onChange={(e) => setCustomAmount(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[14px] text-white placeholder:text-gray-600 focus:outline-none focus:border-yellow-500/50 transition-colors"
                                        />
                                    </div>

                                    {/* Send Button */}
                                    <button
                                        onClick={handleSendToken}
                                        disabled={!usdcRecipient || txStatus === "pending" || (parseFloat(customAmount || usdcAmount.toString()) < TOKEN_MIN)}
                                        className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:opacity-40 disabled:hover:bg-yellow-500 text-black font-black py-4 rounded-2xl text-[14px] transition-all shadow-lg shadow-yellow-500/20 active:scale-[0.98] flex items-center justify-center gap-2"
                                    >
                                        {txStatus === "pending" ? (
                                            <>
                                                <Loader2 size={18} className="animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <Coins size={18} />
                                                Send {customAmount || usdcAmount} {TOKEN_SYMBOL}
                                                {usdcRecipient && ` → @${usdcRecipient.name}`}
                                            </>
                                        )}
                                    </button>

                                    {!account && (
                                        <p className="text-center text-[12px] text-red-400">
                                            Wallet not connected — cannot send
                                        </p>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

// ─── Control Button ────────────────────────────────────────────────────────────
function ControlButton({
    icon,
    label,
    hasArrow = false,
    active = false,
    onClick,
    badge
}: {
    icon: React.ReactNode,
    label: string,
    hasArrow?: boolean,
    active?: boolean,
    onClick?: () => void,
    badge?: string
}) {
    return (
        <div className="flex flex-col items-center gap-1.5 relative group">
            <button
                onClick={onClick}
                className={`w-[44px] h-[44px] md:w-[52px] md:h-[52px] flex items-center justify-center rounded-xl transition-all relative
                ${active ? "bg-blue-500/20 text-blue-400" : "hover:bg-white/5 text-gray-400 hover:text-white active:scale-95"}`}
            >
                {React.cloneElement(icon as React.ReactElement, { size: 24 })}
                {hasArrow && (
                    <div className="absolute top-1 right-1 opacity-40 group-hover:opacity-100 transition-opacity">
                        <ChevronUp size={10} />
                    </div>
                )}
                {badge && (
                    <div className="absolute top-1.5 left-1/2 translate-x-[4px] bg-white/10 text-white min-w-[16px] h-[16px] rounded-full flex items-center justify-center text-[9px] font-black border border-white/20">
                        {badge}
                    </div>
                )}
            </button>
            <span className={`text-[10px] font-bold uppercase tracking-wider text-center transition-colors
                ${active ? "text-blue-400" : "text-gray-500 group-hover:text-gray-300"}`}>
                {label}
            </span>
        </div>
    );
}
