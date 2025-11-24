
export const CUSTOMER_AVATARS = [
    "https://api.dicebear.com/9.x/adventurer/svg?seed=Felix&backgroundColor=b6e3f4", // Knight/Blue
    "https://api.dicebear.com/9.x/adventurer/svg?seed=Sophia&backgroundColor=ffdfbf", // Mage/Pink
    "https://api.dicebear.com/9.x/adventurer/svg?seed=Willow&backgroundColor=c0aede", // Witch/Purple
    "https://api.dicebear.com/9.x/adventurer/svg?seed=Elias&backgroundColor=d1d4f9", // Rogue/Dark
    "https://api.dicebear.com/9.x/adventurer/svg?seed=Jasper&backgroundColor=ffd5dc", // Healer/Red
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