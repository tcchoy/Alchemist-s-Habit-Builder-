
export const CUSTOMER_AVATARS = [
    "https://api.dicebear.com/9.x/adventurer/svg?seed=Kael&backgroundColor=ffdfbf", // Soft peach background
    "https://api.dicebear.com/9.x/adventurer/svg?seed=Luna&backgroundColor=ffd5dc", // Soft pink background
    "https://api.dicebear.com/9.x/adventurer/svg?seed=Milo&backgroundColor=b6e3f4", // Soft blue background
    "https://api.dicebear.com/9.x/adventurer/svg?seed=Nora&backgroundColor=c0aede", // Soft purple background
    "https://api.dicebear.com/9.x/adventurer/svg?seed=Finn&backgroundColor=d1d4f9", // Soft indigo background
];

export const getQuestAvatar = (questId: string) => {
    // Simple hash to deterministically pick an avatar based on ID string
    let hash = 0;
    for (let i = 0; i < questId.length; i++) {
        hash = questId.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % CUSTOMER_AVATARS.length;
    return CUSTOMER_AVATARS[index];
};
