"use server";

import { createServerClient } from "@/lib/supabaseServer";
import { CustomLesson } from "@/lib/teacherStorage";

export async function saveLessonAction(lesson: CustomLesson, teacherId?: string) {
  const supabase = createServerClient();
  
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

    if (error) {
       console.error("Supabase Error:", error);
       return { success: false, error: error.message };
    }
    
    return { success: true, id: data.id };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function saveScoreAction(scoreData: any) {
  const supabase = createServerClient();
  try {
    const { error } = await supabase
      .from('student_scores')
      .insert(scoreData);
      
    if (error) throw error;
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
