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
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-4xl bg-white text-slate-900 rounded-[2rem] overflow-hidden shadow-2xl"
          >
            {/* Header / Actions */}
            <div className="absolute top-6 right-6 flex gap-2 z-10 print:hidden">
              <Button 
                variant="outline" 
                onClick={handlePrint}
                className="bg-slate-100 hover:bg-slate-200 border-none rounded-xl font-bold"
              >
                <Download className="w-4 h-4 ml-2" /> طباعة الشهادة
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onClose}
                className="rounded-full hover:bg-slate-100"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>

            {/* Certificate Content */}
            <div ref={certificateRef} className="p-1">
                <div className="bg-white border-[16px] border-double border-slate-200 p-12 md:p-20 relative overflow-hidden">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -mr-32 -mt-32 border-[40px] border-slate-100" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-slate-50 rounded-full -ml-32 -mb-32 border-[40px] border-slate-100" />
                    
                    <div className="relative z-10 text-center space-y-12">
                        {/* Logo / Badge */}
                        <div className="flex justify-center mb-8">
                            <div className="relative">
                                <div className="w-32 h-32 bg-slate-900 rounded-full flex items-center justify-center text-white shadow-xl">
                                    <Award className="w-16 h-16" />
                                </div>
                                <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-yellow-400 rounded-full border-4 border-white flex items-center justify-center text-slate-900 font-black">
                                    100
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-sm font-black uppercase tracking-[0.3em] text-slate-400">شهادة تقدير وإنجاز</h4>
                            <h1 className="text-5xl md:text-7xl font-serif text-slate-900 italic">Play 2 Learn</h1>
                        </div>

                        <div className="space-y-8">
                            <p className="text-xl md:text-2xl text-slate-500 font-medium leading-relaxed">
                                نمنح هذه الشهادة بكل فخر للطالب المتميز
                            </p>
                            <div className="relative inline-block px-12 py-4">
                                <div className="absolute inset-x-0 bottom-0 h-1 bg-slate-900" />
                                <h2 className="text-4xl md:text-6xl font-black text-slate-900">{studentName}</h2>
                            </div>
                        </div>

                        <div className="max-w-2xl mx-auto py-8">
                            <p className="text-lg md:text-xl text-slate-600 leading-loose">
                                تقديراً لنجاحه وتفوقه في إتمام مهمة البرمجة المتقدمة بعنوان 
                                <span className="font-black text-slate-900 mx-2">"{lessonName}"</span> 
                                بنسبة نجاح مذهلة بلغت <span className="font-black text-slate-900">{score}%</span>. 
                                لقد أظهر مهارات استثنائية في حل المشكلات والتفكير المنطقي.
                            </p>
                        </div>

                        <div className="pt-12 grid grid-cols-2 md:grid-cols-3 gap-8 items-center border-t border-slate-100">
                            <div className="text-right">
                                <p className="text-xs font-black uppercase text-slate-400 mb-2">تاريخ الإصدار</p>
                                <p className="font-bold text-slate-900">{date}</p>
                            </div>
                            <div className="hidden md:flex justify-center">
                                <ShieldCheck className="w-12 h-12 text-slate-200" />
                            </div>
                            <div className="text-left">
                                <p className="text-xs font-black uppercase text-slate-400 mb-2">توقيع المعلم</p>
                                <div className="font-serif italic text-2xl text-slate-300">Play 2 Learn Team</div>
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
