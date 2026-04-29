"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Settings2, 
  Volume2, 
  Contrast, 
  MoveHorizontal, 
  Eye, 
  Type,
  X,
  Waveform,
  Activity
} from "lucide-react";
import { useAccessibility } from "@/hooks/useAccessibility";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AccessibilityMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AccessibilityMenu({ isOpen, onClose }: AccessibilityMenuProps) {
  const { settings, updateSetting } = useAccessibility();

  const menuVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { type: "spring", damping: 25, stiffness: 300 }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-md"
            onClick={onClose}
          />
          
          <motion.div
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="relative w-full max-w-lg bg-card/95 backdrop-blur-2xl border border-border rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[85vh]"
          >
            <div className="p-5 md:p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Settings2 className="w-6 h-6 text-blue-500" />
                  <h2 className="text-xl font-black">إعدادات الوصول</h2>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-4">
                {/* Visual Settings */}
                <div className="grid gap-2">
                  <AccessibilityItem 
                    icon={<Eye className="w-5 h-5 text-emerald-400" />}
                    title="الإشارات البصرية"
                    description="تنبيهات مرئية لضعاف السمع."
                    checked={settings.visualCues}
                    onChange={(v) => updateSetting("visualCues", v)}
                  />
                  <AccessibilityItem 
                    icon={<Contrast className="w-5 h-5 text-orange-400" />}
                    title="التباين العالي"
                    description="تحسين الرؤية لضعاف البصر."
                    checked={settings.highContrast}
                    onChange={(v) => updateSetting("highContrast", v)}
                  />
                </div>

                {/* Typography */}
                <div className="p-4 bg-muted/40 rounded-[1.5rem] border border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <Type className="w-5 h-5 text-cyan-400" />
                    <span className="text-sm font-bold">حجم الخط</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "normal", label: "عادي" },
                      { id: "large", label: "كبير" },
                      { id: "extra-large", label: "ضخم" }
                    ].map((size) => (
                      <button
                        key={size.id}
                        onClick={() => updateSetting("fontSize", size.id)}
                        className={`h-10 rounded-xl font-bold text-xs transition-all border ${
                          settings.fontSize === size.id 
                          ? "bg-primary text-primary-foreground border-transparent shadow-lg" 
                          : "bg-transparent text-muted-foreground hover:bg-muted border-border"
                        }`}
                      >
                        {size.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* THE MAIN TTS BUTTON AT THE BOTTOM */}
                <motion.div 
                  className={`p-4 md:p-6 rounded-[2rem] border-2 transition-all duration-500 relative overflow-hidden group ${
                    settings.textToSpeech 
                    ? "bg-blue-600 border-blue-400 shadow-[0_20px_40px_-10px_rgba(37,99,235,0.4)]" 
                    : "bg-muted/40 border-border hover:border-primary/50 hover:bg-muted/60"
                  }`}
                  animate={!settings.textToSpeech ? { scale: [1, 1.01, 1] } : {}}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="flex items-center justify-between gap-4 relative z-10">
                    <button 
                      onClick={() => updateSetting("textToSpeech", !settings.textToSpeech)}
                      className={`relative w-12 h-6 md:w-14 md:h-7 rounded-full transition-colors duration-300 focus:outline-none shrink-0 ${
                        settings.textToSpeech ? "bg-white" : "bg-slate-400/30"
                      }`}
                    >
                      <motion.div 
                        className={`absolute top-1 w-4 h-4 md:w-5 md:h-5 rounded-full shadow-sm ${
                          settings.textToSpeech ? "bg-blue-600" : "bg-white"
                        }`}
                        animate={{ x: settings.textToSpeech ? (typeof window !== 'undefined' && window.innerWidth < 640 ? -24 : -32) : -4 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    </button>
                    <div className="flex items-center gap-3 md:gap-4 text-right">
                      <div className="text-right">
                        <Label className={`text-sm md:text-lg font-black block leading-none mb-1 cursor-pointer ${
                          settings.textToSpeech ? "text-white" : "text-foreground"
                        }`}>
                          قراءة الأسئلة والخيارات
                        </Label>
                        <p className={`text-[9px] md:text-[11px] font-bold leading-tight ${
                          settings.textToSpeech ? "text-white/80" : "text-blue-500"
                        }`}>
                          {settings.textToSpeech ? "القارئ يعمل الآن.." : "اضغط هنا للتفعيل الصوتي"}
                        </p>
                      </div>
                      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-500 group-hover:scale-110 ${
                        settings.textToSpeech ? "bg-white/20" : "bg-blue-500/10 border border-blue-500/20"
                      }`}>
                        <Volume2 className={`w-5 h-5 md:w-6 md:h-6 ${settings.textToSpeech ? "text-white" : "text-blue-500"}`} />
                      </div>
                    </div>
                  </div>
                  {/* Decorative background circle */}
                  <div className={`absolute -left-4 -top-4 w-24 h-24 rounded-full blur-3xl transition-opacity duration-500 ${
                    settings.textToSpeech ? "bg-blue-400 opacity-40" : "bg-blue-500 opacity-0"
                  }`} />
                </motion.div>
              </div>

              <Button 
                onClick={onClose}
                className="w-full h-14 rounded-2xl bg-foreground text-background font-black text-xl transition-all active:scale-95 shadow-xl hover:opacity-90"
              >
                إغلاق الإعدادات
              </Button>

              <div className="flex items-center gap-3 justify-center py-2 px-4 bg-blue-500/10 rounded-2xl border border-blue-500/20 mt-4">
                <Activity className="w-4 h-4 text-blue-500 animate-pulse" />
                <span className="text-[10px] text-blue-500 font-bold uppercase tracking-widest text-center">
                   النظام يعمل بشكل متزامن واحترافي
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function AccessibilityItem({ icon, title, description, checked, onChange }: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="p-4 bg-muted/40 rounded-[1.5rem] border border-border hover:border-primary/50 transition-colors flex items-center justify-between gap-4 group cursor-pointer" onClick={() => onChange(!checked)}>
      <div className="flex items-center gap-4 text-right">
        <div className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <div className="space-y-0.5 pointer-events-none">
          <Label className="text-sm font-black text-foreground block">{title}</Label>
          <p className="text-[10px] text-muted-foreground leading-tight">{description}</p>
        </div>
      </div>
      <Switch 
        checked={checked}
        onCheckedChange={onChange}
        className="data-[state=checked]:bg-blue-500"
      />
    </div>
  );
}
