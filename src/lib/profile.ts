export const PROFILE_PICS = [
    "/assets/avatars/profile1.jpg",
    "/assets/avatars/profile2.jpg",
    "/assets/avatars/profile3.jpg",
    "/assets/avatars/profile4.jpg",
    "/assets/avatars/profile6.jpg"
];

export function getProfilePic(address?: string) {
    if (!address) return PROFILE_PICS[0];
    let hash = 0;
    for (let i = 0; i < address.length; i++) {
        hash = address.charCodeAt(i) + ((hash << 5) - hash);
    }
    return PROFILE_PICS[Math.abs(hash) % PROFILE_PICS.length];
}
