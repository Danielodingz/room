export const PROFILE_PICS = [
    "/assets/avatars/profile1.jpg",
    "/assets/avatars/profile2.jpg",
    "/assets/avatars/profile3.jpg",
    "/assets/avatars/profile4.jpg",
    "/assets/avatars/profile6.jpg"
];

export interface UserProfile {
    displayName?: string;
    avatarUrl?: string; // Base64 or external URL
    email?: string;
}

function storageKey(address: string) {
    return `room_profile_${address.toLowerCase()}`;
}

export function saveProfile(address: string, profile: UserProfile) {
    if (typeof window === "undefined") return;
    try {
        localStorage.setItem(storageKey(address), JSON.stringify(profile));
    } catch (e) {
        console.error("Failed to save profile:", e);
    }
}

export function loadProfile(address: string): UserProfile | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = localStorage.getItem(storageKey(address));
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        return null;
    }
}

export function getProfilePic(address?: string) {
    if (!address) return PROFILE_PICS[0];

    // Check for custom avatar in localStorage if in browser
    if (typeof window !== "undefined") {
        const profile = loadProfile(address);
        if (profile?.avatarUrl) return profile.avatarUrl;
    }

    let hash = 0;
    for (let i = 0; i < address.length; i++) {
        hash = address.charCodeAt(i) + ((hash << 5) - hash);
    }
    return PROFILE_PICS[Math.abs(hash) % PROFILE_PICS.length];
}
