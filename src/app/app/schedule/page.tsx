"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "@starknet-react/core";
import Image from "next/image";
import {
    ArrowLeft, Calendar, Clock, Globe, Lock, Users, Video,
    Radio, ChevronDown, Check, Loader2, CheckCircle2, Shield,
    FileText, Hash
} from "lucide-react";
import { saveScheduledMeeting, ScheduledMeeting } from "@/lib/scheduledMeetings";

// Popular timezones list
const TIMEZONES = [
    "Africa/Lagos", "Africa/Accra", "Africa/Nairobi", "Africa/Cairo",
    "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
    "America/Sao_Paulo", "America/Toronto", "America/Vancouver",
    "Europe/London", "Europe/Paris", "Europe/Berlin", "Europe/Moscow",
    "Asia/Dubai", "Asia/Kolkata", "Asia/Singapore", "Asia/Tokyo", "Asia/Shanghai",
    "Asia/Seoul", "Asia/Bangkok", "Asia/Karachi",
    "Australia/Sydney", "Australia/Melbourne",
    "Pacific/Auckland", "Pacific/Honolulu",
    "UTC",
];

const DURATIONS = [
    { label: "15m", value: 15 },
    { label: "30m", value: 30 },
    { label: "45m", value: 45 },
    { label: "1h", value: 60 },
    { label: "1.5h", value: 90 },
    { label: "2h", value: 120 },
    { label: "3h", value: 180 },
];

function formatDuration(mins: number) {
    if (mins < 60) return `${mins} min`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m === 0 ? `${h} hr` : `${h}h ${m}m`;
}

function formatDateTime(date: string, time: string, tz: string) {
    if (!date || !time) return "—";
    try {
        const dt = new Date(`${date}T${time}:00`);
        return dt.toLocaleString("en-US", {
            weekday: "short", month: "short", day: "numeric",
            year: "numeric", hour: "2-digit", minute: "2-digit",
            timeZone: tz, timeZoneName: "short"
        });
    } catch {
        return `${date} ${time}`;
    }
}

function generateId() {
    return Math.random().toString(36).substring(2, 11).toUpperCase();
}

// Today's date in YYYY-MM-DD
function todayStr() {
    const d = new Date();
    return d.toISOString().split("T")[0];
}

// Current time rounded up to next 30 min
function nextHalfHour() {
    const d = new Date();
    d.setMinutes(d.getMinutes() < 30 ? 30 : 60, 0, 0);
    if (d.getMinutes() === 0) d.setHours(d.getHours());
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
}

export default function SchedulePage() {
    const router = useRouter();
    const { address, isConnected, isConnecting, isReconnecting } = useAccount();
    const [hasMounted, setHasMounted] = useState(false);

    // Form state
    const [topic, setTopic] = useState("");
    const [description, setDescription] = useState("");
    const [date, setDate] = useState(todayStr());
    const [startTime, setStartTime] = useState(nextHalfHour());
    const [duration, setDuration] = useState(60);
    const [timezone, setTimezone] = useState("UTC");
    const [isPublic, setIsPublic] = useState(true);
    const [passcode, setPasscode] = useState("");
    const [maxParticipants, setMaxParticipants] = useState(10);
    const [enableRecording, setEnableRecording] = useState(false);
    const [tzSearch, setTzSearch] = useState("");
    const [tzOpen, setTzOpen] = useState(false);

    const [status, setStatus] = useState<"idle" | "saving" | "done">("idle");

    useEffect(() => {
        setHasMounted(true);
        // Auto-detect timezone
        try {
            const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
            if (TIMEZONES.includes(tz)) setTimezone(tz);
        } catch { }
    }, []);

    useEffect(() => {
        if (!hasMounted) return;
        if (!isConnected && !isConnecting && !isReconnecting) {
            router.push("/");
        }
    }, [hasMounted, isConnected, isConnecting, isReconnecting, router]);

    if (!hasMounted || isConnecting || isReconnecting) {
        return (
            <main className="min-h-screen bg-[#0A0A0B] flex items-center justify-center">
                <Loader2 size={36} className="animate-spin text-white/30" />
            </main>
        );
    }

    const filteredTz = TIMEZONES.filter(tz =>
        tz.toLowerCase().includes(tzSearch.toLowerCase())
    );

    const canSave = topic.trim().length > 0 && date && startTime &&
        (!isPublic ? passcode.trim().length >= 4 : true);

    const handleSave = () => {
        if (!canSave || !address) return;
        setStatus("saving");
        const meeting: ScheduledMeeting = {
            id: generateId(),
            topic: topic.trim(),
            description: description.trim(),
            date,
            startTime,
            duration,
            timezone,
            isPublic,
            passcode: isPublic ? "" : passcode.trim(),
            maxParticipants,
            enableRecording,
            createdAt: Date.now(),
            hostAddress: address,
        };
        saveScheduledMeeting(address, meeting);
        setTimeout(() => {
            setStatus("done");
            setTimeout(() => router.push("/app/dashboard"), 1200);
        }, 600);
    };

    return (
        <main className="min-h-screen bg-[#0A0A0B] text-white font-sans flex flex-col">
            {/* ── Top bar ── */}
            <header className="sticky top-0 z-20 h-[64px] px-4 md:px-10 flex items-center gap-4 bg-[#0A0A0B]/90 backdrop-blur-xl border-b border-white/5">
                <button
                    onClick={() => router.push("/app/dashboard")}
                    className="p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-all active:scale-95"
                >
                    <ArrowLeft size={20} />
                </button>
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 relative">
                        <Image src="/assets/logos/logo.png" alt="Room" fill className="object-contain" />
                    </div>
                    <span className="font-bold text-[16px]">Schedule a Meeting</span>
                </div>
            </header>

            <div className="flex-1 flex flex-col lg:flex-row gap-0 max-w-[1100px] mx-auto w-full px-4 md:px-10 py-8 md:py-12 gap-10">

                {/* ── Left: Form ── */}
                <div className="flex-1 flex flex-col gap-8">

                    {/* Topic */}
                    <div className="flex flex-col gap-2">
                        <label className="flex items-center gap-2 text-[12px] font-bold text-gray-400 uppercase tracking-widest">
                            <FileText size={14} />Meeting Topic <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. Weekly Design Review"
                            value={topic}
                            onChange={e => setTopic(e.target.value)}
                            maxLength={100}
                            className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-[16px] font-medium text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/60 transition-all"
                        />
                    </div>

                    {/* Description */}
                    <div className="flex flex-col gap-2">
                        <label className="flex items-center gap-2 text-[12px] font-bold text-gray-400 uppercase tracking-widest">
                            <Hash size={14} />Description / Agenda
                        </label>
                        <textarea
                            placeholder="What will be discussed? (optional)"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            maxLength={400}
                            rows={3}
                            className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-[15px] text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/60 transition-all resize-none custom-scrollbar"
                        />
                    </div>

                    {/* Date + Time row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="flex items-center gap-2 text-[12px] font-bold text-gray-400 uppercase tracking-widest">
                                <Calendar size={14} />Date <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="date"
                                value={date}
                                min={todayStr()}
                                onChange={e => setDate(e.target.value)}
                                className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-[15px] text-white focus:outline-none focus:border-blue-500/60 transition-all [color-scheme:dark]"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="flex items-center gap-2 text-[12px] font-bold text-gray-400 uppercase tracking-widest">
                                <Clock size={14} />Start Time <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="time"
                                value={startTime}
                                onChange={e => setStartTime(e.target.value)}
                                className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-[15px] text-white focus:outline-none focus:border-blue-500/60 transition-all [color-scheme:dark]"
                            />
                        </div>
                    </div>

                    {/* Duration */}
                    <div className="flex flex-col gap-3">
                        <label className="flex items-center gap-2 text-[12px] font-bold text-gray-400 uppercase tracking-widest">
                            <Clock size={14} />Duration
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {DURATIONS.map(d => (
                                <button
                                    key={d.value}
                                    type="button"
                                    onClick={() => setDuration(d.value)}
                                    className={`px-5 py-2.5 rounded-2xl font-bold text-[14px] transition-all active:scale-95 border ${duration === d.value
                                            ? "bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-500/20"
                                            : "bg-white/5 text-gray-400 border-white/10 hover:border-white/20 hover:text-white"
                                        }`}
                                >
                                    {d.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Timezone */}
                    <div className="flex flex-col gap-2 relative">
                        <label className="flex items-center gap-2 text-[12px] font-bold text-gray-400 uppercase tracking-widest">
                            <Globe size={14} />Time Zone
                        </label>
                        <button
                            type="button"
                            onClick={() => setTzOpen(o => !o)}
                            className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-[15px] text-white focus:outline-none hover:border-white/20 transition-all flex items-center justify-between"
                        >
                            <span>{timezone}</span>
                            <ChevronDown size={16} className={`text-gray-400 transition-transform ${tzOpen ? "rotate-180" : ""}`} />
                        </button>
                        {tzOpen && (
                            <div className="absolute top-[calc(100%+4px)] left-0 right-0 z-50 bg-[#1C1C1E] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                                <div className="p-3 border-b border-white/5">
                                    <input
                                        type="text"
                                        placeholder="Search timezone..."
                                        value={tzSearch}
                                        onChange={e => setTzSearch(e.target.value)}
                                        className="w-full bg-white/5 rounded-xl px-4 py-2 text-[14px] text-white placeholder:text-gray-600 focus:outline-none border border-white/5 focus:border-blue-500/40"
                                        autoFocus
                                    />
                                </div>
                                <div className="max-h-[220px] overflow-y-auto custom-scrollbar">
                                    {filteredTz.map(tz => (
                                        <button
                                            key={tz}
                                            type="button"
                                            onClick={() => { setTimezone(tz); setTzOpen(false); setTzSearch(""); }}
                                            className={`w-full text-left px-5 py-3 text-[14px] transition-all flex items-center justify-between ${timezone === tz ? "text-blue-400 bg-blue-500/10" : "text-gray-300 hover:bg-white/5"
                                                }`}
                                        >
                                            {tz}
                                            {timezone === tz && <Check size={14} />}
                                        </button>
                                    ))}
                                    {filteredTz.length === 0 && (
                                        <div className="px-5 py-6 text-gray-600 text-[14px] text-center">No results</div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Visibility */}
                    <div className="flex flex-col gap-4 bg-white/[0.03] border border-white/5 rounded-3xl p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {isPublic
                                    ? <Globe size={20} className="text-blue-400" />
                                    : <Lock size={20} className="text-yellow-400" />}
                                <div>
                                    <p className="font-bold text-[15px]">{isPublic ? "Public Meeting" : "Private Meeting"}</p>
                                    <p className="text-[12px] text-gray-500">
                                        {isPublic ? "Anyone with the link can join" : "Only invited guests with the passcode"}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsPublic(v => !v)}
                                className={`w-14 h-7 rounded-full p-1 transition-colors duration-300 ${isPublic ? "bg-blue-500" : "bg-yellow-500"}`}
                            >
                                <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${isPublic ? "translate-x-7" : "translate-x-0"}`} />
                            </button>
                        </div>

                        {!isPublic && (
                            <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                <label className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">
                                    Passcode <span className="text-red-400">*</span> <span className="text-gray-600 normal-case">(min 4 characters)</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter a passcode"
                                    value={passcode}
                                    onChange={e => setPasscode(e.target.value)}
                                    maxLength={20}
                                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[14px] text-yellow-300 font-mono font-bold placeholder:text-gray-600 focus:outline-none focus:border-yellow-500/40 transition-all"
                                />
                            </div>
                        )}
                    </div>

                    {/* Max Participants */}
                    <div className="flex flex-col gap-3">
                        <label className="flex items-center justify-between text-[12px] font-bold text-gray-400 uppercase tracking-widest">
                            <span className="flex items-center gap-2"><Users size={14} />Max Participants</span>
                            <span className="text-blue-400 text-[16px] normal-case font-black">{maxParticipants}</span>
                        </label>
                        <input
                            type="range"
                            min={2}
                            max={100}
                            step={1}
                            value={maxParticipants}
                            onChange={e => setMaxParticipants(Number(e.target.value))}
                            className="w-full accent-blue-500"
                        />
                        <div className="flex justify-between text-[11px] text-gray-600">
                            <span>2</span><span>25</span><span>50</span><span>75</span><span>100</span>
                        </div>
                    </div>

                    {/* Recording */}
                    <div className="flex items-center justify-between bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-4">
                        <div className="flex items-center gap-3">
                            <Radio size={18} className={enableRecording ? "text-red-400 animate-pulse" : "text-gray-500"} />
                            <div>
                                <p className="font-bold text-[15px]">Enable Recording</p>
                                <p className="text-[12px] text-gray-500">Auto-record this meeting session</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setEnableRecording(v => !v)}
                            className={`w-14 h-7 rounded-full p-1 transition-colors duration-300 ${enableRecording ? "bg-red-500" : "bg-white/10"}`}
                        >
                            <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${enableRecording ? "translate-x-7" : "translate-x-0"}`} />
                        </button>
                    </div>

                </div>

                {/* ── Right: Summary Card + CTA ── */}
                <div className="lg:w-[360px] flex flex-col gap-6 lg:sticky lg:top-[80px] lg:self-start">

                    {/* Live Summary */}
                    <div className="bg-[#111112] border border-white/10 rounded-3xl p-6 flex flex-col gap-5 shadow-2xl">
                        <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                            <div className="w-10 h-10 bg-blue-500/10 rounded-2xl flex items-center justify-center">
                                <Video size={20} className="text-blue-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-black text-[16px] truncate">{topic || "Meeting Topic"}</p>
                                <p className="text-[12px] text-gray-500">Scheduled by you</p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4">
                            <SummaryRow icon={<Calendar size={15} className="text-blue-400" />} label="When">
                                <span className="text-[13px] text-right">{formatDateTime(date, startTime, timezone)}</span>
                            </SummaryRow>
                            <SummaryRow icon={<Clock size={15} className="text-green-400" />} label="Duration">
                                {formatDuration(duration)}
                            </SummaryRow>
                            <SummaryRow icon={<Globe size={15} className="text-purple-400" />} label="Timezone">
                                {timezone}
                            </SummaryRow>
                            <SummaryRow
                                icon={isPublic
                                    ? <Globe size={15} className="text-blue-400" />
                                    : <Lock size={15} className="text-yellow-400" />}
                                label="Visibility"
                            >
                                <span className={isPublic ? "text-blue-400" : "text-yellow-400"}>
                                    {isPublic ? "Public" : "Private"}
                                </span>
                            </SummaryRow>
                            <SummaryRow icon={<Users size={15} className="text-orange-400" />} label="Max Guests">
                                {maxParticipants} people
                            </SummaryRow>
                            {enableRecording && (
                                <SummaryRow icon={<Radio size={15} className="text-red-400" />} label="Recording">
                                    <span className="text-red-400">Enabled</span>
                                </SummaryRow>
                            )}
                            {!isPublic && passcode && (
                                <SummaryRow icon={<Shield size={15} className="text-yellow-400" />} label="Passcode">
                                    <span className="font-mono text-yellow-300">{passcode}</span>
                                </SummaryRow>
                            )}
                        </div>

                        {description.trim() && (
                            <div className="pt-4 border-t border-white/5">
                                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Agenda</p>
                                <p className="text-[13px] text-gray-300 leading-relaxed">{description}</p>
                            </div>
                        )}
                    </div>

                    {/* Validation hint */}
                    {!canSave && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3 text-[13px] text-red-400 font-medium">
                            {!topic.trim()
                                ? "Please enter a meeting topic."
                                : !isPublic && passcode.trim().length < 4
                                    ? "Passcode must be at least 4 characters."
                                    : "Please fill in all required fields."}
                        </div>
                    )}

                    {/* CTA */}
                    <button
                        onClick={handleSave}
                        disabled={!canSave || status !== "idle"}
                        className={`w-full py-5 rounded-2xl font-black text-[16px] transition-all active:scale-95 flex items-center justify-center gap-3 shadow-xl ${status === "done"
                                ? "bg-green-500 text-white shadow-green-500/20"
                                : canSave
                                    ? "bg-blue-500 hover:bg-blue-400 text-white shadow-blue-500/20"
                                    : "bg-white/5 text-white/30 cursor-not-allowed"
                            }`}
                    >
                        {status === "saving" && <Loader2 size={20} className="animate-spin" />}
                        {status === "done" && <CheckCircle2 size={20} />}
                        {status === "idle" && <Calendar size={20} />}
                        {status === "saving" ? "Scheduling…" : status === "done" ? "Scheduled!" : "Schedule Meeting"}
                    </button>

                    <p className="text-center text-[12px] text-gray-600">
                        You can start the meeting directly from your dashboard.
                    </p>
                </div>
            </div>
        </main>
    );
}

function SummaryRow({
    icon, label, children
}: {
    icon: React.ReactNode;
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex items-start gap-3">
            <div className="mt-0.5 shrink-0">{icon}</div>
            <div className="flex flex-1 items-start justify-between gap-2">
                <span className="text-[12px] font-bold text-gray-500 shrink-0">{label}</span>
                <span className="text-[13px] font-bold text-white text-right">{children}</span>
            </div>
        </div>
    );
}
