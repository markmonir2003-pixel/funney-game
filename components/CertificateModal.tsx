"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, Download, Award, ShieldCheck, Printer, Image as ImageIcon, Share2, Star, Zap } from "lucide-react";
import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { toast } from "sonner";

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  lessonName: string;
  score: number;
  date: string;
}

export function CertificateModal({
  isOpen,
  onClose,
  studentName,
  lessonName,
  score,
  date,
}: CertificateModalProps) {
  const certificateRef = useRef<HTMLDivElement>(null);
  const captureRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownloadImage = async () => {
    if (!captureRef.current) return;

    setIsGenerating(true);
    const t = toast.loading("جاري تجهيز الشهادة بجودة عالية...");

    try {
      // Ensure fonts are loaded
      await document.fonts.ready;

      const dataUrl = await toPng(captureRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        skipFonts: false,
      });

      const link = document.createElement('a');
      link.download = `Certificate-${studentName.split(' ')[0]}-${lessonName}.png`;
      link.href = dataUrl;
      link.click();
      toast.dismiss(t);
      toast.success("تم الحفظ في جهازك بنجاح! ✨");
    } catch (err) {
      console.error('Capture failed', err);
      toast.dismiss(t);
      toast.error("حدث خطأ أثناء الحفظ.");
    } finally {
      setIsGenerating(false);
    }
  };

  const CertificateContent = ({ isCapture = false }) => (
    <div className={`bg-white relative ${isCapture ? 'w-[1200px] h-[850px]' : 'w-full aspect-[1.414/1]'}`}>
      <div className={`h-full w-full px-6 pt-12 pb-12 md:px-16 md:pt-24 md:pb-24 border-[10px] md:border-[30px] border-double border-yellow-600/30 relative flex flex-col items-center justify-center gap-4 md:gap-8`}>

        {/* Decorative Corners */}
        <div className="absolute top-0 left-0 w-32 h-32 md:w-64 md:h-64 border-t-[4px] md:border-t-[8px] border-l-[4px] md:border-l-[8px] border-yellow-600/20 rounded-tl-[1.5rem] md:rounded-tl-[3rem] -m-1 md:-m-2" />
        <div className="absolute bottom-0 right-0 w-32 h-32 md:w-64 md:h-64 border-b-[4px] md:border-b-[8px] border-r-[4px] md:border-r-[8px] border-yellow-600/20 rounded-br-[1.5rem] md:rounded-br-[3rem] -m-1 md:-m-2" />

        <div className="relative z-10 text-center flex flex-col items-center gap-4 md:gap-8 w-full max-w-4xl">
          {/* Badge */}
          <div className="relative mb-2 mt-16 md:mt-32">
            <div className={`bg-slate-900 rounded-full flex items-center justify-center text-yellow-500 shadow-2xl border-4 md:border-8 border-yellow-500/30 ${isCapture ? 'w-36 h-36' : 'w-16 h-16 md:w-36 md:h-36'}`}>
              <Award className={`${isCapture ? 'w-20 h-20' : 'w-8 h-8 md:w-20 md:h-20'}`} />
            </div>
            <div className={`absolute -bottom-2 -right-2 bg-yellow-500 text-slate-900 font-black rounded-full border-2 md:border-4 border-white ${isCapture ? 'px-4 py-1 text-lg' : 'px-2 py-0.5 text-[8px] md:text-lg md:px-3'}`}>
              MASTER
            </div>
          </div>

          <div className="space-y-1 md:space-y-4">
            <h4 className={`font-black uppercase tracking-[0.2em] md:tracking-[0.4em] text-yellow-600 ${isCapture ? 'text-lg' : 'text-[8px] md:text-lg'}`}>شهادة تقدير وإنجاز</h4>
            <h1 className={`font-serif text-slate-900 tracking-tighter leading-none ${isCapture ? 'text-8xl' : 'text-3xl md:text-8xl'}`}>Play 2 Learn</h1>
            <div className="h-0.5 md:h-1.5 w-20 md:w-48 bg-gradient-to-r from-transparent via-yellow-500 to-transparent mx-auto mt-1 md:mt-2" />
          </div>

          <div className="space-y-2 md:space-y-6 w-full">
            <p className={`text-slate-500 font-medium font-serif italic ${isCapture ? 'text-3xl' : 'text-[10px] md:text-3xl'}`}>
              نمنح هذه الشهادة بكل فخر وبكامل التقدير للطالب
            </p>
            <div className="relative inline-block w-full">
              <h2 className={`font-black text-slate-900 drop-shadow-sm leading-tight ${isCapture ? 'text-7xl mb-4' : 'text-xl md:text-7xl md:mb-2'}`}>{studentName}</h2>
              <div className={`bg-slate-900/10 w-full rounded-full ${isCapture ? 'h-2' : 'h-0.5 md:h-2'}`} />
            </div>
          </div>

          <div className="max-w-3xl mx-auto px-2">
            <p className={`text-slate-600 leading-relaxed font-medium ${isCapture ? 'text-2xl' : 'text-[9px] md:text-2xl'}`}>
              تقديراً لمثابرته وذكائه في اجتياز تحدي 
              <span className={`font-black text-slate-900 mx-1 md:mx-2 underline decoration-yellow-500 underline-offset-4 md:underline-offset-8 ${isCapture ? 'text-3xl decoration-4' : 'text-xs md:text-3xl md:decoration-4'}`}>"{lessonName}"</span> 
              بنسبة نجاح متميزة بلغت <span className={`font-black text-yellow-600 ${isCapture ? 'text-4xl' : 'text-sm md:text-4xl'}`}>{score}%</span>. 
              أنت الآن تحمل لقب مبرمج بطل! 🚀
            </p>
          </div>

          <div className={`w-full pt-8 md:pt-16 pb-24 md:pb-48 grid grid-cols-2 items-end border-t border-slate-100 gap-4 md:gap-24`}>
            <div className="text-right">
              <p className={`font-black uppercase tracking-widest text-slate-400 mb-1 md:mb-2 ${isCapture ? 'text-sm' : 'text-[6px] md:text-sm'}`}>تاريخ الاعتماد</p>
              <p className={`font-bold text-slate-900 ${isCapture ? 'text-2xl' : 'text-[10px] md:text-2xl'}`}>{date}</p>
            </div>
            <div className="text-left">
              <p className={`font-black uppercase tracking-widest text-slate-400 mb-1 md:mb-2 ${isCapture ? 'text-sm' : 'text-[6px] md:text-sm'}`}>توقيع الإدارة</p>
              <div className={`font-serif italic text-slate-400 opacity-50 ${isCapture ? 'text-4xl' : 'text-[12px] md:text-4xl'}`}>Play 2 Learn Team</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-5xl bg-slate-100 rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] my-auto"
          >
            {/* Action Bar */}
            <div className="p-4 sm:p-6 border-b border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/10 rounded-xl">
                  <Award className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900">شهادة الإنجاز</h3>
                  <p className="text-xs text-slate-500 font-bold">بطل القصة: {studentName}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  onClick={handleDownloadImage}
                  disabled={isGenerating}
                  className="flex-1 sm:flex-none bg-yellow-500 hover:bg-yellow-600 text-slate-900 rounded-xl font-black h-12 px-6 shadow-lg shadow-yellow-500/20 gap-2"
                >
                  <Download className="w-5 h-5" />
                  {isGenerating ? "جاري الحفظ..." : "حفظ في الاستوديو"}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 h-12 w-12"
                >
                  <X className="w-6 h-6" />
                </Button>
              </div>
            </div>

            {/* Responsive Preview Container */}
            <div className="p-4 sm:p-8 md:p-12 bg-slate-200/50">
              <div className="max-w-4xl mx-auto shadow-2xl rounded-lg overflow-hidden ring-1 ring-black/5">
                <CertificateContent isCapture={false} />
              </div>

              {/* Mobile Hint */}
              <div className="mt-6 flex items-center justify-center gap-2 text-slate-500 text-xs sm:text-sm font-bold bg-white/50 py-2 rounded-full px-4 w-fit mx-auto">
                <Share2 className="w-4 h-4" />
                <span>💡 نصيحة: احفظ الشهادة كصورة وشاركها مع أصدقائك!</span>
              </div>
            </div>

            {/* Hidden High-Res Version for Capture */}
            <div className="fixed -left-[10000px] top-0 pointer-events-none" aria-hidden="true">
              <div ref={captureRef}>
                <CertificateContent isCapture={true} />
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
