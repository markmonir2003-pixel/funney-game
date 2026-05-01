import { LessonsClient } from "@/components/LessonsClient";

export default function LessonsPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-8 md:py-12 selection:bg-cyan-500/30 relative">
      <div className="max-w-7xl mx-auto">
        <LessonsClient />
      </div>
    </main>
  );
}
