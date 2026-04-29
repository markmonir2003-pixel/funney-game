import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8 bg-card border border-border rounded-[2.5rem] p-12 shadow-2xl">
        <div className="text-8xl animate-bounce">🤔</div>
        
        <div className="space-y-4">
          <h1 className="text-4xl font-black text-foreground tracking-tight">الصفحة غير موجودة!</h1>
          <p className="text-muted-foreground font-medium text-lg">
            يبدو أنك ضللت الطريق في عالم الأكواد. هذه الصفحة غير موجودة حالياً.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <Link href="/">
            <Button
              className="w-full h-16 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl font-black text-xl gap-2 shadow-xl shadow-primary/20"
            >
              <Home className="w-6 h-6" />
              عد إلى القاعدة
            </Button>
          </Link>
          <Link href="/lessons">
            <Button
              variant="ghost"
              className="w-full h-14 rounded-2xl text-muted-foreground font-bold text-lg gap-2"
            >
              <Search className="w-5 h-5" />
              تصفح الدروس المتاحة
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
