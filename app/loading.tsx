import { Sparkles } from "lucide-react";

export default function Loading() {
  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-[200]">
      <div className="relative">
        <div className="w-24 h-24 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-primary animate-pulse" />
        </div>
      </div>
      <div className="mt-8 text-center space-y-2">
        <h2 className="text-2xl font-black tracking-tight text-foreground animate-pulse">Play 2 Learn</h2>
        <p className="text-muted-foreground font-medium text-sm">جاري تحسين التجربة من أجلك...</p>
      </div>
    </div>
  );
}
