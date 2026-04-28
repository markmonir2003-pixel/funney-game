// Storage utility for managing teacher-created lessons and questions
import { supabase } from "./supabase";

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
    const json = JSON.stringify(lesson);
    // Use encodeURIComponent to handle non-ASCII characters (like Arabic)
    // then btoa to make it a safe base64 string
    return btoa(encodeURIComponent(json));
  } catch (e) {
    console.error("Encoding failed", e);
    return "";
  }
}

export function decodeLesson(encoded: string): CustomLesson | null {
  try {
    // atob decodes base64, then decodeURIComponent restores non-ASCII characters
    const json = decodeURIComponent(atob(encoded));
    return JSON.parse(json);
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
