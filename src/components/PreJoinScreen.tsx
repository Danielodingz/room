"use client";

import React, { useState, useEffect } from "react";
import { Mic, MicOff, Video, VideoOff, Settings, Check } from "lucide-react";
import { createLocalAudioTrack, createLocalVideoTrack, LocalVideoTrack, LocalAudioTrack } from "livekit-client";

export default function PreJoinScreen({
    onSubmit,
    onCancel,
    defaultName = ""
}: {
    onSubmit: (name: string, isMicEnabled: boolean, isVideoEnabled: boolean) => void,
    onCancel: () => void,
    defaultName?: string
}) {
    const [name, setName] = useState(defaultName);
    const [isMicEnabled, setIsMicEnabled] = useState(true);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [videoTrack, setVideoTrack] = useState<LocalVideoTrack | null>(null);
    const [audioTrack, setAudioTrack] = useState<LocalAudioTrack | null>(null);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        // Load name from local storage if neither provided nor set
        if (!name) {
            const savedName = localStorage.getItem("room_display_name");
            if (savedName) setName(savedName);
        }
    }, [name]);

    useEffect(() => {
        let active = true;
        const initMedia = async () => {
            try {
                if (isVideoEnabled && !videoTrack) {
                    const track = await createLocalVideoTrack();
                    if (active) setVideoTrack(track);
                }
                if (isMicEnabled && !audioTrack) {
                    const track = await createLocalAudioTrack();
                    if (active) setAudioTrack(track);
                }
            } catch (err: any) {
                console.warn("Could not acquire media:", err);
                if (err.message.includes("Permission denied")) {
                    setError("Camera/Mic permission denied by browser.");
                }
                setIsVideoEnabled(false);
                setIsMicEnabled(false);
            }
        };

        initMedia();

        return () => {
            active = false;
        };
    }, [isVideoEnabled, isMicEnabled]);

    useEffect(() => {
        // Clean up tracks when component unmounts
        return () => {
            if (videoTrack) videoTrack.stop();
            if (audioTrack) audioTrack.stop();
        };
    }, [videoTrack, audioTrack]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const finalName = name.trim() || "Guest";
        localStorage.setItem("room_display_name", finalName);

        // Stop local preview tracks so LiveKitRoom can claim them
        if (videoTrack) videoTrack.stop();
        if (audioTrack) audioTrack.stop();

        onSubmit(finalName, isMicEnabled, isVideoEnabled);
    };

    const toggleVideo = async () => {
        if (isVideoEnabled) {
            if (videoTrack) {
                videoTrack.stop();
                setVideoTrack(null);
            }
            setIsVideoEnabled(false);
        } else {
            try {
                const track = await createLocalVideoTrack();
                setVideoTrack(track);
                setIsVideoEnabled(true);
                setError("");
            } catch (err) {
                console.error(err);
                setError("Could not access camera.");
            }
        }
    };

    const toggleAudio = async () => {
        if (isMicEnabled) {
            if (audioTrack) {
                audioTrack.stop();
                setAudioTrack(null);
            }
            setIsMicEnabled(false);
        } else {
            try {
                const track = await createLocalAudioTrack();
                setAudioTrack(track);
                setIsMicEnabled(true);
                setError("");
            } catch (err) {
                console.error(err);
                setError("Could not access microphone.");
            }
        }
    }

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-[#0A0A0B] text-white p-8 md:p-12 items-center justify-center gap-12 lg:gap-24 relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none" />

            {/* Video Preview Container */}
            <div className="flex-1 w-full max-w-[640px] flex flex-col gap-6 relative z-10">
                <div className="flex flex-col gap-2">
                    <h1 className="text-[32px] md:text-[48px] font-extrabold tracking-tight">Ready to join?</h1>
                    <p className="text-gray-400">Configure your devices and set your display name before entering.</p>
                </div>

                <div className="relative aspect-video w-full rounded-2xl md:rounded-[32px] bg-[#1C1C1E] border border-white/5 shadow-2xl overflow-hidden group">
                    {isVideoEnabled && videoTrack ? (
                        <video
                            ref={(el) => {
                                if (el && videoTrack) {
                                    videoTrack.attach(el);
                                }
                            }}
                            autoPlay
                            muted
                            playsInline
                            className="w-full h-full object-cover scale-x-[-1]"
                        />
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 gap-4">
                            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
                                <VideoOff size={32} />
                            </div>
                            <span className="font-medium text-[15px]">Camera is off</span>
                        </div>
                    )}

                    {error && (
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-500/90 text-white px-4 py-2 rounded-lg text-[13px] font-bold shadow-lg backdrop-blur-md whitespace-nowrap">
                            {error}
                        </div>
                    )}

                    {/* Quick overlay controls */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 transition-all z-20">
                        <button
                            onClick={toggleAudio}
                            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-xl backdrop-blur-md active:scale-95 ${isMicEnabled ? 'bg-black/60 text-white hover:bg-black/80 border border-white/10' : 'bg-red-500 text-white border-2 border-red-400 shadow-red-500/20'}`}
                        >
                            {isMicEnabled ? <Mic size={24} /> : <MicOff size={24} />}
                        </button>
                        <button
                            onClick={toggleVideo}
                            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-xl backdrop-blur-md active:scale-95 ${isVideoEnabled ? 'bg-black/60 text-white hover:bg-black/80 border border-white/10' : 'bg-red-500 text-white border-2 border-red-400 shadow-red-500/20'}`}
                        >
                            {isVideoEnabled ? <Video size={24} /> : <VideoOff size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Configuration Form Container */}
            <div className="flex-1 w-full max-w-[400px] flex flex-col relative z-10">
                <form onSubmit={handleSubmit} className="bg-[#1C1C1E]/50 backdrop-blur-xl border border-white/5 p-8 rounded-[32px] shadow-2xl flex flex-col gap-8">
                    <div className="flex flex-col gap-4">
                        <label className="text-[13px] font-bold text-gray-400 uppercase tracking-widest px-1">Display Name</label>
                        <div className="relative group">
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your Name"
                                required
                                className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white text-[16px] font-medium placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 transition-colors shadow-inner"
                            />
                            {name && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500 animate-in fade-in">
                                    <Check size={18} />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Audio/Video device selection could go here in future */}
                    <button
                        type="button"
                        className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors w-full text-left"
                    >
                        <div className="flex items-center gap-3">
                            <Settings size={18} className="text-gray-400" />
                            <span className="text-[14px] font-bold text-gray-300">Device Settings</span>
                        </div>
                    </button>

                    <div className="flex flex-col gap-3 pt-4 border-t border-white/5 mt-2">
                        <button
                            type="submit"
                            disabled={!name.trim()}
                            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white font-black py-4 rounded-2xl transition-all active:scale-95 shadow-lg shadow-blue-500/20 text-[16px]"
                        >
                            Join Meeting
                        </button>
                        <button
                            type="button"
                            onClick={onCancel}
                            className="w-full bg-transparent text-gray-400 hover:text-white font-bold py-4 rounded-2xl transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
