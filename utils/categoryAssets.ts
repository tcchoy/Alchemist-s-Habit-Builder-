
import React from 'react';
import { CategoryMeta, PotionCategory } from '../types';

export const BASE_POTION_URL = "https://lh3.googleusercontent.com/aida-public/AB6AXuCCFxXk_ynOYi58Di_5xkb4eAmBkD9jwVEuyIvAmibjS24khrBaDqm6M2U1tpZCyRy3uz3d1aDPnsR0muu7pZsIp-JeJ7Dp4EN5hUMPguznYXOlHTquzOVq5x0BGqOamk6Wm9uU6hbvoQn6DB4rrVvFfidXtldrrV1UlP0JdXIArw1vezdQy6WfiL9KMBSrQTEJNZMAGvrM1ql83a-rWKzeq1FRo00TdmSApRhMx4tBSV3BcxpMusMjuiKW08tJysTsitMJrUM9g2M";

export const DEFAULT_CATEGORIES: Record<string, { color: string, filter: string }> = {
    'General': { color: '#9ca3af', filter: 'grayscale(100%) contrast(1.2)' }, // Gray
    'Fitness': { color: '#ef4444', filter: 'hue-rotate(0deg) saturate(200%) contrast(1.1)' }, // Red
    'Learning': { color: '#3b82f6', filter: 'hue-rotate(180deg) saturate(150%)' }, // Blue
    'Housework': { color: '#eab308', filter: 'hue-rotate(60deg) saturate(200%)' }, // Yellow
    'Diet': { color: '#22c55e', filter: 'hue-rotate(100deg) saturate(150%)' }, // Green
    'Mental Health': { color: '#a855f7', filter: 'hue-rotate(240deg) saturate(150%)' }, // Purple
};

export const getCategoryStyle = (category: PotionCategory, customCategories: CategoryMeta[]) => {
    // Check custom first
    const custom = customCategories.find(c => c.name === category);
    if (custom) {
        return {
            color: custom.color,
            filter: 'none', // Custom ones might use a different icon logic, or we apply a color tint
            iconType: custom.type
        };
    }

    const standard = DEFAULT_CATEGORIES[category] || DEFAULT_CATEGORIES['General'];
    return {
        color: standard.color,
        filter: standard.filter,
        iconType: 'potion'
    };
};

export const renderCategoryIcon = (category: string, customCategories: CategoryMeta[], sizeClass: string = "size-10") => {
    const style = getCategoryStyle(category, customCategories);
    
    if (style.iconType === 'potion') {
        return React.createElement('div', {
            className: `${sizeClass} bg-contain bg-center bg-no-repeat`,
            style: { 
                backgroundImage: `url("${BASE_POTION_URL}")`,
                filter: style.filter
            }
        });
    } else {
        // Fallback for non-potion icons (Book/Pen)
        const iconName = style.iconType === 'book' ? 'menu_book' : 'edit';
        return React.createElement('div', {
            className: `${sizeClass} flex items-center justify-center rounded-full bg-white/10`,
            style: { color: style.color }
        }, 
            React.createElement('span', { className: "material-symbols-outlined" }, iconName)
        );
    }
};
