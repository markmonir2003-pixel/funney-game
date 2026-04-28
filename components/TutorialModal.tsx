"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, GraduationCap, Play, BookOpen, Trophy, Sparkles, ShoppingBag, Target, Zap, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TutorialModal({ isOpen, onClose }: TutorialModalProps) {
  const steps = [
    {
      icon: <GraduationCap className="w-6 h-6" />,
      title: "اختر نوع الحساب",
      description: "يمكنك الدخول كـ طالب للعب وحل الأسئلة، أو كـ معلم لإنشاء دروس وأسئلة مخصصة لطلابك.",
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-500/10",
      textColor: "text-purple-400",
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: "اختر الدرس",
      description: "ستجد مجموعة من الدروس الجاهزة مثل الخوارزميات، المتغيرات، والحلقات. كما يمكنك لعب دروس المعلم المخصصة.",
      color: "from-cyan-500 to-blue-500",
      bgColor: "bg-cyan-500/10",
      textColor: "text-cyan-400",
    },
    {
      icon: <Play className="w-6 h-6" />,
      title: "ابدأ اللعب",
      description: "أجب على الأسئلة قبل نفاذ الوقت! كل إجابة صحيحة تمنحك نقاط خبرة (XP). الإجابات المتتالية الصحيحة تضاعف النقاط!",
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-500/10",
      textColor: "text-green-400",
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "اهرب من الوحش!",
      description: "في كل سؤال، الوحش يطاردك! أجب بسرعة وبشكل صحيح لتبقى في الأمام. كل خطأ يجعل الوحش يقترب أكثر!",
      color: "from-red-500 to-orange-500",
      bgColor: "bg-red-500/10",
      textColor: "text-red-400",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "استخدم القوى الخارقة",
      description: "اشترِ قوى خارقة من المتجر: ❄️ تجميد الوقت، 🛡️ درع الحماية، ⏩ تخطي السؤال. استخدمها بحكمة!",
      color: "from-yellow-500 to-amber-500",
      bgColor: "bg-yellow-500/10",
      textColor: "text-yellow-400",
    },
    {
      icon: <Trophy className="w-6 h-6" />,
      title: "اصعد في لوحة المتصدرين",
      description: "اجمع أكبر عدد من نقاط الخبرة لتتصدر لوحة المتصدرين! حقق الإنجازات واشترِ شخصيات جديدة من المتجر.",
      color: "from-indigo-500 to-violet-500",
      bgColor: "bg-indigo-500/10",
      textColor: "text-indigo-400",
    },
    {
      icon: <ShoppingBag className="w-6 h-6" />,
      title: "متجر الأبطال",
      description: "أنفق نقاط الخبرة في شراء شخصيات جديدة (نينجا، روبوت، صاروخ، ملك) وقوى خارقة تساعدك في اللعب!",
      color: "from-pink-500 to-rose-500",
      bgColor: "bg-pink-500/10",
      textColor: "text-pink-400",
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="tutorial-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="tutorial-modal"
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-gradient-to-b from-[#1e293b] to-[#1e293b]/95 backdrop-blur-xl p-8 pb-6 rounded-t-[2.5rem] border-b border-white/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl shadow-lg shadow-cyan-500/20">
                    <HelpCircle className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white">كيف تلعب؟ 🎮</h2>
                    <p className="text-slate-400 text-sm font-medium">دليل استخدام اللعبة التعليمية</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Steps */}
            <div className="p-8 pt-6 space-y-4">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  className="tutorial-step"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.08 }}
                >
                  <div className={`tutorial-step-number bg-gradient-to-br ${step.color} text-white shadow-lg`}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={step.textColor}>{step.icon}</span>
                      <h3 className="text-lg font-black text-white">{step.title}</h3>
                    </div>
                    <p className="text-slate-400 font-medium text-sm leading-relaxed">{step.description}</p>
                  </div>
                </motion.div>
              ))}

              {/* Tips Section */}
              <div className="mt-6 p-6 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-lg font-black text-cyan-400">نصائح ذهبية 💡</h3>
                </div>
                <ul className="space-y-2 text-slate-300 text-sm font-medium">
                  <li className="flex items-center gap-2">
                    <span className="text-cyan-500">•</span>
                    أجب بسرعة للحصول على مكافأة السرعة (+50 XP)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-cyan-500">•</span>
                    حقق سلسلة من 3 إجابات صحيحة لمضاعفة النقاط (2x)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-cyan-500">•</span>
                    حقق سلسلة من 5 إجابات لثلاثة أضعاف النقاط (3x)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-cyan-500">•</span>
                    اقرأ الشرح بعد كل سؤال لتتعلم أكثر!
                  </li>
                </ul>
              </div>

              {/* Close Button */}
              <Button
                onClick={onClose}
                className="w-full h-16 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-white font-black text-xl shadow-xl shadow-cyan-500/20 transition-all mt-6"
              >
                فهمت! هيا نلعب 🚀
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
