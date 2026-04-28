"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, Download, Award, ShieldCheck, Star, Zap } from "lucide-react";
import { useRef } from "react";

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

  const handlePrint = () => {
    const printContent = certificateRef.current;
    const originalContents = document.body.innerHTML;
    
    if (printContent) {
        document.body.innerHTML = printContent.innerHTML;
        window.print();
        document.body.innerHTML = originalContents;
        window.location.reload(); // Reload to restore React state
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-4xl bg-white text-slate-900 rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-2xl my-auto"
          >
            {/* Header / Actions */}
            <div className="absolute top-3 right-3 sm:top-6 sm:right-6 flex gap-2 z-20 print:hidden">
              <Button 
                variant="outline" 
                onClick={handlePrint}
                className="bg-slate-100/80 hover:bg-slate-200 border-none rounded-xl font-bold h-9 sm:h-11 px-3 sm:px-4 text-xs sm:text-sm"
              >
                <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1 sm:ml-2" /> طباعة
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onClose}
                className="rounded-full hover:bg-slate-100 h-9 w-9 sm:h-11 sm:w-11"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </Button>
            </div>

            {/* Certificate Content */}
            <div ref={certificateRef} className="p-0.5 sm:p-1 max-h-[90vh] overflow-y-auto md:max-h-none md:overflow-visible">
                <div className="bg-white border-[8px] md:border-[16px] border-double border-slate-200 p-6 sm:p-10 md:p-20 relative overflow-hidden">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 md:w-64 md:h-64 bg-slate-50 rounded-full -mr-16 -mt-16 md:-mr-32 md:-mt-32 border-[20px] md:border-[40px] border-slate-100" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 md:w-64 md:h-64 bg-slate-50 rounded-full -ml-16 -mb-16 md:-ml-32 md:-mb-32 border-[20px] md:border-[40px] border-slate-100" />
                    
                    <div className="relative z-10 text-center space-y-6 md:space-y-12">
                        {/* Logo / Badge */}
                        <div className="flex justify-center mb-4 md:mb-8">
                            <div className="relative">
                                <div className="w-20 h-20 md:w-32 md:h-32 bg-slate-900 rounded-full flex items-center justify-center text-white shadow-xl">
                                    <Award className="w-10 h-10 md:w-16 md:h-16" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 md:-bottom-2 md:-right-2 w-8 h-8 md:w-12 md:h-12 bg-yellow-400 rounded-full border-2 md:border-4 border-white flex items-center justify-center text-slate-900 text-xs md:text-base font-black">
                                    100
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2 md:space-y-4">
                            <h4 className="text-[10px] md:text-sm font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-slate-400">شهادة تقدير وإنجاز</h4>
                            <h1 className="text-4xl md:text-7xl font-serif text-slate-900 italic">Play 2 Learn</h1>
                        </div>

                        <div className="space-y-4 md:space-y-8">
                            <p className="text-base md:text-2xl text-slate-500 font-medium leading-relaxed">
                                نمنح هذه الشهادة بكل فخر للطالب المتميز
                            </p>
                            <div className="relative inline-block px-6 md:px-12 py-2 md:py-4">
                                <div className="absolute inset-x-0 bottom-0 h-0.5 md:h-1 bg-slate-900" />
                                <h2 className="text-2xl md:text-6xl font-black text-slate-900">{studentName}</h2>
                            </div>
                        </div>

                        <div className="max-w-2xl mx-auto py-4 md:py-8">
                            <p className="text-sm md:text-xl text-slate-600 leading-loose">
                                تقديراً لنجاحه وتفوقه في إتمام مهمة البرمجة المتقدمة بعنوان 
                                <span className="font-black text-slate-900 mx-1 md:mx-2">"{lessonName}"</span> 
                                بنسبة نجاح مذهلة بلغت <span className="font-black text-slate-900">{score}%</span>. 
                                لقد أظهر مهارات استثنائية في حل المشكلات والتفكير المنطقي.
                            </p>
                        </div>

                        <div className="pt-6 md:pt-12 grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8 items-center border-t border-slate-100">
                            <div className="text-right">
                                <p className="text-[10px] font-black uppercase text-slate-400 mb-1">تاريخ الإصدار</p>
                                <p className="text-xs md:text-base font-bold text-slate-900">{date}</p>
                            </div>
                            <div className="hidden md:flex justify-center">
                                <ShieldCheck className="w-12 h-12 text-slate-200" />
                            </div>
                            <div className="text-left">
                                <p className="text-[10px] font-black uppercase text-slate-400 mb-1">توقيع المعلم</p>
                                <div className="font-serif italic text-lg md:text-2xl text-slate-300">Play 2 Learn Team</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
