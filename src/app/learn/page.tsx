"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart, ArrowRight, CheckCircle2, XCircle, Zap } from "lucide-react";
import Link from "next/link";
import { MOCK_LESSON } from "@/lib/mock-data";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n";

export default function LearnPage() {
  const { t } = useLanguage();
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [hearts, setHearts] = useState(MOCK_LESSON.hearts);
  const [progress, setProgress] = useState(30);

  const handleCheck = () => {
    if (selectedOption === null) return;
    
    const correct = selectedOption === MOCK_LESSON.correctIndex;
    setIsCorrect(correct);
    setIsChecked(true);

    if (correct) {
      toast.success(t("common.correct"));
      setProgress(prev => Math.min(prev + 20, 100));
    } else {
      toast.error(t("common.incorrect") + " " + MOCK_LESSON.options[MOCK_LESSON.correctIndex]);
      setHearts(prev => Math.max(prev - 1, 0));
    }
  };

  const handleContinue = () => {
    setSelectedOption(null);
    setIsChecked(false);
    setIsCorrect(null);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] max-w-4xl mx-auto">
      {/* Top Bar */}
      <div className="flex items-center gap-6 mb-12">
         <Link href="/dashboard" className="text-muted-foreground hover:text-primary transition-colors">
           <ArrowRight className="w-8 h-8 rotate-180" />
         </Link>
         <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden p-1 border-2">
           <div 
             className="h-full bg-primary rounded-full transition-all duration-500" 
             style={{ width: `${progress}%` }}
           />
         </div>
         <div className="flex items-center gap-4 font-black text-lg">
            <div className="flex items-center gap-1 text-red-500">
              <Heart className="w-6 h-6 fill-current" />
              <span>{hearts}</span>
            </div>
         </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center space-y-12">
        <div className="w-full space-y-8 text-center sm:text-left">
            <h2 className="text-3xl md:text-5xl font-black leading-tight">
              {MOCK_LESSON.question}
            </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 w-full">
           {MOCK_LESSON.options.map((option, i) => (
             <button
               key={i}
               disabled={isChecked}
               onClick={() => setSelectedOption(i)}
               className={cn(
                 "relative p-6 text-left border-4 rounded-2xl transition-all duration-200 group flex items-center justify-between shadow-[0_4px_0_0_rgba(0,0,0,0.1)] active:translate-y-1 active:shadow-none",
                 selectedOption === i 
                   ? "border-primary bg-primary/5 text-primary" 
                   : "border-white/10 bg-card hover:bg-accent/50 text-foreground",
                 isChecked && i === MOCK_LESSON.correctIndex && "border-green-500 bg-green-500/10 text-green-500 shadow-[0_4px_0_0_#22c55e]",
                 isChecked && selectedOption === i && i !== MOCK_LESSON.correctIndex && "border-red-500 bg-red-500/10 text-red-500 shadow-[0_4px_0_0_#ef4444]",
                 isChecked && i !== MOCK_LESSON.correctIndex && i !== selectedOption && "opacity-50 shadow-none translate-y-0"
               )}
             >
               <div className="flex items-center gap-6">
                 <span className="w-10 h-10 rounded-xl border-2 flex items-center justify-center font-black text-sm group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                   {i + 1}
                 </span>
                 <span className="font-black text-xl">{option}</span>
               </div>
               <div className={cn(
                 "w-8 h-8 rounded-full border-4 flex items-center justify-center transition-all",
                 selectedOption === i ? "border-primary bg-primary text-white" : "border-white/10",
                 isChecked && i === MOCK_LESSON.correctIndex && "border-green-500 bg-green-500 text-white",
                 isChecked && selectedOption === i && i !== MOCK_LESSON.correctIndex && "border-red-500 bg-red-500 text-white",
               )}>
                 {isChecked && i === MOCK_LESSON.correctIndex ? <CheckCircle2 className="w-5 h-5" /> : 
                  isChecked && selectedOption === i && i !== MOCK_LESSON.correctIndex ? <XCircle className="w-5 h-5" /> : 
                  null}
               </div>
             </button>
           ))}
        </div>
      </main>

      {/* Footer Check Section */}
      <div className={cn(
        "fixed bottom-0 left-0 w-full py-8 border-t-4 transition-all duration-300 z-20",
        isChecked ? (isCorrect ? "bg-green-500/20 border-green-500/30" : "bg-red-500/20 border-red-500/30") : "bg-background border-white/5"
      )}>
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
               {isChecked ? (
                 <>
                   <div className={cn(
                     "w-20 h-20 rounded-2xl flex items-center justify-center shadow-xl",
                     isCorrect ? "bg-green-500 text-white" : "bg-red-500 text-white"
                   )}>
                     {isCorrect ? <CheckCircle2 className="w-12 h-12" /> : <XCircle className="w-12 h-12" />}
                   </div>
                   <div className="space-y-1">
                     <h3 className={cn("text-3xl font-black uppercase", isCorrect ? "text-green-500" : "text-red-500")}>
                       {isCorrect ? t("common.correct") : t("common.error")}
                     </h3>
                     <p className={cn("font-bold text-lg", isCorrect ? "text-green-500/80" : "text-red-500/80")}>
                       {isCorrect ? `+${MOCK_LESSON.xp} XP` : `${t("common.incorrect")} ${MOCK_LESSON.options[MOCK_LESSON.correctIndex]}`}
                     </p>
                   </div>
                 </>
               ) : (
                 <div className="flex items-center gap-4 text-muted-foreground font-black text-lg uppercase tracking-widest">
                   <Zap className="w-8 h-8 text-yellow-400 animate-bounce" />
                   <span>{t("common.start")}</span>
                 </div>
               )}
            </div>

            <Button 
              size="lg" 
              onClick={isChecked ? handleContinue : handleCheck}
              disabled={selectedOption === null}
              className={cn(
                "w-full md:w-72 h-20 rounded-2xl text-2xl font-black transition-all duration-200 shadow-lg",
                !isChecked && (selectedOption === null ? "bg-muted text-muted-foreground shadow-none" : "bg-primary text-primary-foreground shadow-[0_6px_0_0_#46a302] hover:bg-primary/90 active:translate-y-1 active:shadow-none"),
                isChecked && (isCorrect ? "bg-green-500 text-white shadow-[0_6px_0_0_#15803d] hover:bg-green-600 active:translate-y-1 active:shadow-none" : "bg-red-500 text-white shadow-[0_6px_0_0_#b91c1c] hover:bg-red-600 active:translate-y-1 active:shadow-none")
              )}
            >
              {isChecked ? t("common.continue") : t("common.check")}
            </Button>
        </div>
      </div>
    </div>
  );
}
