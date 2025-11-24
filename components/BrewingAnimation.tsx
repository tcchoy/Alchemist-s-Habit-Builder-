
import React, { useEffect, useState } from 'react';

interface BrewingAnimationProps {
    onComplete: () => void;
}

const IMAGES = [
    "https://raw.githubusercontent.com/tcchoy/Alchemist-s-Habit-Builder-Images/refs/heads/main/potion_making1.jpg", // Adding
    "https://raw.githubusercontent.com/tcchoy/Alchemist-s-Habit-Builder-Images/refs/heads/main/potion_making2.jpg", // Stirring
    "https://raw.githubusercontent.com/tcchoy/Alchemist-s-Habit-Builder-Images/refs/heads/main/potion_success1.jpg"  // Success
];

const BrewingAnimation: React.FC<BrewingAnimationProps> = ({ onComplete }) => {
    const [step, setStep] = useState(0);

    useEffect(() => {
        // Timeline: Total 3 Seconds
        // 0s - 1.0s: Ingredient Adding
        // 1.0s - 2.0s: Stirring
        // 2.0s - 3.0s: Success
        
        const t1 = setTimeout(() => setStep(1), 1000);  
        const t2 = setTimeout(() => setStep(2), 2000);  
        const t3 = setTimeout(onComplete, 3000);

        return () => {
            clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);
        };
    }, [onComplete]);

    const getCaption = () => {
        if (step === 0) return "Adding Ingredients...";
        if (step === 1) return "Mixing Essence...";
        return "Brewing Complete!";
    };

    return (
        <div 
            onClick={onComplete}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300 cursor-pointer"
        >
            <div className="relative w-[90%] max-w-md aspect-[4/3] bg-[#3e3223] rounded-xl border-4 border-[#8b7355] shadow-2xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                
                {/* RPG Decor Frame Inner */}
                <div className="absolute inset-1 border border-[#5d4a35] rounded-lg pointer-events-none z-20"></div>
                <div className="absolute top-2 left-2 size-3 bg-[#fcd34d] rounded-full shadow-inner z-20 border border-[#b45309]"></div>
                <div className="absolute top-2 right-2 size-3 bg-[#fcd34d] rounded-full shadow-inner z-20 border border-[#b45309]"></div>
                <div className="absolute bottom-2 left-2 size-3 bg-[#fcd34d] rounded-full shadow-inner z-20 border border-[#b45309]"></div>
                <div className="absolute bottom-2 right-2 size-3 bg-[#fcd34d] rounded-full shadow-inner z-20 border border-[#b45309]"></div>

                {/* Skip Tooltip */}
                <div className="absolute top-4 right-6 z-30 bg-black/50 text-white text-[10px] px-2 py-1 rounded border border-white/20 backdrop-blur-md pointer-events-none">
                    Click anywhere to skip
                </div>

                {/* Image Display */}
                <div className="flex-1 relative bg-black" onClick={onComplete}>
                    {IMAGES.map((src, index) => (
                        <img 
                            key={index}
                            src={src} 
                            alt={`Step ${index}`}
                            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${step === index ? 'opacity-100' : 'opacity-0'}`}
                        />
                    ))}
                    
                    {/* Flash effect on success */}
                    {step === 2 && (
                        <div className="absolute inset-0 bg-white/30 animate-pulse z-10 pointer-events-none"></div>
                    )}
                </div>

                {/* Text Box Area */}
                <div className="h-16 bg-[#fdf6e3] border-t-4 border-[#8b7355] flex items-center justify-center p-2 relative z-10">
                    <div className="w-full h-full border border-[#d4c5a9] border-dashed rounded flex items-center justify-center bg-[#fff9f0]">
                        <p className="font-display text-[#5d4a35] font-bold text-lg animate-in slide-in-from-bottom-2 fade-in duration-300 key={step}">
                            {getCaption()}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BrewingAnimation;
