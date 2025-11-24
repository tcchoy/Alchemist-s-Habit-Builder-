
import React, { useEffect, useState } from 'react';

interface BrewingAnimationProps {
    onComplete: () => void;
}

const BrewingAnimation: React.FC<BrewingAnimationProps> = ({ onComplete }) => {
    const [step, setStep] = useState(0);

    useEffect(() => {
        // Timeline: Total 6 Seconds
        // 0s-1s: Ingredient Drop (Bounce)
        // 1s-2s: Ingredient Land + Start Stir
        // 2s-4s: Stirring (Bubbles)
        // 4s-5s: Smoke/Poof (Pot Disappears)
        // 5s-6s: Success Potion (Sparkles)
        
        const t1 = setTimeout(() => setStep(1), 100);   // Drop
        const t2 = setTimeout(() => setStep(2), 2000);  // Stir
        const t3 = setTimeout(() => setStep(3), 4000);  // Smoke
        const t4 = setTimeout(() => setStep(4), 5000);  // Reveal
        const t5 = setTimeout(onComplete, 6000);      // End

        return () => {
            clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5);
        };
    }, [onComplete]);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="relative size-80 flex items-center justify-center">
                
                {/* STEP 0-2: CAULDRON */}
                {step < 3 && (
                    <div className={`absolute bottom-0 text-9xl transition-all duration-500 ${step === 2 ? 'animate-bounce' : 'animate-in zoom-in'}`}>
                        <span className="material-symbols-outlined text-[180px] text-stone-300 drop-shadow-2xl">soup_kitchen</span>
                    </div>
                )}

                {/* STEP 1: INGREDIENT DROP (0s - 2s) */}
                {step === 1 && (
                    <div className="absolute top-0 animate-in slide-in-from-top-full duration-1000 fade-out-0 zoom-in bounce-in">
                         <span className="material-symbols-outlined text-7xl text-green-400 drop-shadow-lg">eco</span>
                    </div>
                )}

                {/* STEP 2: STIRRING / BUBBLES (2s - 4s) */}
                {step === 2 && (
                    <div className="absolute bottom-24 flex gap-4 justify-center w-full">
                        <span className="material-symbols-outlined text-primary text-5xl animate-ping">bubble_chart</span>
                        <span className="material-symbols-outlined text-primary text-3xl animate-bounce delay-150">bubble_chart</span>
                        <span className="material-symbols-outlined text-primary text-4xl animate-ping delay-300">bubble_chart</span>
                    </div>
                )}

                {/* STEP 3: SMOKE / POOF (4s - 5s) */}
                {step === 3 && (
                    <div className="absolute z-20 animate-in zoom-in fade-in duration-500">
                        <span className="material-symbols-outlined text-[200px] text-gray-500 opacity-80 blur-md animate-pulse">cloud</span>
                    </div>
                )}

                {/* STEP 4: SUCCESS POTION (5s - 6s) */}
                {step === 4 && (
                    <div className="absolute z-20 animate-in zoom-in spin-in-6 duration-700">
                        <div className="relative">
                            {/* Glow Effect */}
                            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-pulse"></div>
                            
                            <span className="material-symbols-outlined text-[140px] text-primary drop-shadow-[0_0_50px_rgba(251,191,36,1)]">science</span>
                            
                            {/* Sparkles */}
                            <span className="absolute -top-8 -right-8 material-symbols-outlined text-5xl text-yellow-200 animate-pulse">sparkle</span>
                            <span className="absolute -bottom-6 -left-8 material-symbols-outlined text-4xl text-yellow-200 animate-pulse delay-75">sparkle</span>
                            <span className="absolute top-0 -left-10 material-symbols-outlined text-3xl text-yellow-100 animate-pulse delay-150">star</span>
                        </div>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-8 whitespace-nowrap text-center">
                            <span className="text-white font-bold text-3xl font-display text-shadow-lg animate-in slide-in-from-bottom-5">Masterpiece!</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BrewingAnimation;
