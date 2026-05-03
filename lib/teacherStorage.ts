// Storage utility for managing teacher-created lessons and questions
import { supabase } from "./supabase";
import LZString from "lz-string";

export interface CustomQuestion {
  id: string;
  lessonName: string;
  questionText: string;
  options: string[];
  correctAnswer: number;
  difficulty: "easy" | "medium" | "hard";
  explanation: string;
}

export interface CustomLesson {
  id: string;
  name: string;
  description: string;
  color: string;
  questions: CustomQuestion[];
  createdAt: string;
}

const TEACHER_STORAGE_KEY = "funnyGame_teacherData";

export function getTeacherData(): CustomLesson[] {
  if (typeof window === "undefined") return [];

  try {
    const data = localStorage.getItem(TEACHER_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveTeacherData(lessons: CustomLesson[]): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(TEACHER_STORAGE_KEY, JSON.stringify(lessons));
  } catch {
    console.warn("Failed to save teacher data to localStorage");
  }
}

export function addCustomLesson(name: string, description: string): CustomLesson {
  const lessons = getTeacherData();
  const newLesson: CustomLesson = {
    id: Math.random().toString(36).substr(2, 9),
    name,
    description,
    color: getRandomFunnyColor(),
    questions: [],
    createdAt: new Date().toISOString(),
  };
  
  lessons.push(newLesson);
  saveTeacherData(lessons);
  return newLesson;
}

export function deleteCustomLesson(lessonId: string): void {
  const lessons = getTeacherData().filter(l => l.id !== lessonId);
  saveTeacherData(lessons);
}

export function addQuestionToLesson(lessonId: string, question: Omit<CustomQuestion, "id">): void {
  const lessons = getTeacherData();
  const lessonIndex = lessons.findIndex(l => l.id === lessonId);
  
  if (lessonIndex !== -1) {
    const newQuestion: CustomQuestion = {
      ...question,
      id: Math.random().toString(36).substr(2, 9),
    };
    lessons[lessonIndex].questions.push(newQuestion);
    saveTeacherData(lessons);
  }
}

export function deleteQuestionFromLesson(lessonId: string, questionId: string): void {
  const lessons = getTeacherData();
  const lessonIndex = lessons.findIndex(l => l.id === lessonId);
  
  if (lessonIndex !== -1) {
    lessons[lessonIndex].questions = lessons[lessonIndex].questions.filter(q => q.id !== questionId);
    saveTeacherData(lessons);
  }
}

function getRandomFunnyColor(): string {
  const colors = [
    "from-pink-500 to-rose-500",
    "from-cyan-400 to-blue-500",
    "from-purple-500 to-indigo-500",
    "from-yellow-400 to-orange-500",
    "from-green-400 to-emerald-500",
    "from-red-500 to-pink-600",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

export function encodeLesson(lesson: CustomLesson): string {
  try {
    // Minify for URL: use single-letter keys and remove redundant fields (id, lessonName, color, etc.)
    const minified = {
      n: lesson.name,
      d: lesson.description,
      qs: lesson.questions.map(q => ({
        t: q.questionText,
        o: q.options,
        c: q.correctAnswer,
        dif: q.difficulty,
        ex: q.explanation
      }))
    };
    const json = JSON.stringify(minified);
    return LZString.compressToEncodedURIComponent(json);
  } catch (e) {
    console.error("Encoding failed", e);
    return "";
  }
}

export function decodeLesson(encoded: string): CustomLesson | null {
  try {
    const json = LZString.decompressFromEncodedURIComponent(encoded);
    if (!json) return null;
    
    const data = JSON.parse(json);
    
    // Check if it's the new minified format or the old format
    if (data.qs && Array.isArray(data.qs)) {
      return {
        id: "temp-" + Date.now(),
        name: data.n || "مهمة مشاركة",
        description: data.d || "",
        color: "from-cyan-500 to-blue-500",
        questions: data.qs.map((q: any, i: number) => ({
          id: i.toString(),
          lessonName: data.n || "",
          questionText: q.t,
          options: q.o,
          correctAnswer: q.c,
          difficulty: q.dif,
          explanation: q.ex
        })),
        createdAt: new Date().toISOString()
      };
    }
    
    return data; // Fallback for old format
  } catch (e) {
    console.error("Decoding failed", e);
    return null;
  }
}

export async function saveLessonToCloud(lesson: CustomLesson, teacherId?: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('lessons')
      .upsert({
        name: lesson.name,
        description: lesson.description,
        questions: lesson.questions,
        teacher_id: teacherId,
      }, { onConflict: 'name' })
      .select()
      .single();

    if (error) throw error;
    return data.id;
  } catch (e) {
    console.error("Failed to save to cloud", e);
    return null;
  }
}

export async function getLessonFromCloud(id: string): Promise<CustomLesson | null> {
  try {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return {
      ...data,
      questions: data.questions,
    } as CustomLesson;
  } catch (e) {
    console.error("Failed to fetch from cloud", e);
    return null;
  }
}
