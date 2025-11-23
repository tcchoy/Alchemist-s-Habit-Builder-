
import React from 'react';
import { CategoryMeta, PotionCategory } from '../types';

// We now use material symbols for everything to ensure consistency and correct coloring
// The 'potion' equivalent in Material Symbols is often 'science', 'sanitizer', or 'liquor'
// We will use 'science' (flask) as the generic potion icon.

export const DEFAULT_CATEGORIES: Record<string, { color: string }> = {
    'General': { color: '#9ca3af' }, // Gray
    'Fitness': { color: '#ef4444' }, // Red
    'Learning': { color: '#3b82f6' }, // Blue
    'Housework': { color: '#eab308' }, // Yellow
    'Diet': { color: '#22c55e' }, // Green
    'Mental Health': { color: '#a855f7' }, // Purple
};

export const getCategoryStyle = (category: PotionCategory, customCategories: CategoryMeta[]) => {
    // Check custom first
    const custom = customCategories.find(c => c.name === category);
    if (custom) {
        return {
            color: custom.color,
            iconType: custom.type // 'potion' | 'book' | 'pen'
        };
    }

    const standard = DEFAULT_CATEGORIES[category] || DEFAULT_CATEGORIES['General'];
    return {
        color: standard.color,
        iconType: 'potion' as const
    };
};

export const renderCategoryIcon = (category: string, customCategories: CategoryMeta[], sizeClass: string = "size-10") => {
    const style = getCategoryStyle(category, customCategories);
    
    // Map internal types to Material Symbols
    let iconName = 'science'; // Default Potion
    if (style.iconType === 'book') iconName = 'menu_book';
    if (style.iconType === 'pen') iconName = 'edit';
    
    // Create the icon container
    return React.createElement('div', {
        className: `${sizeClass} flex items-center justify-center rounded-full bg-white/10 shrink-0`,
        style: { 
            color: style.color,
            border: `1px solid ${style.color}40` // Add subtle border matching color
        }
    }, 
        React.createElement('span', { 
            className: "material-symbols-outlined",
            style: { fontSize: '1.5em' } // Ensure icon fits well
        }, iconName)
    );
};
