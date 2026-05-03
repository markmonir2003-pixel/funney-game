"use server";

/**
 * AI Action to generate educational questions using Groq (Llama 3.3 70B).
 * This is an extremely fast and reliable alternative to Gemini.
 */
export async function generateQuestionsAction(topic: string, count: number = 5, difficulty: string = "medium") {
  const apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey || apiKey.trim() === "") {
    return { 
      success: false, 
      error: "يرجى إضافة GROQ_API_KEY في ملف .env.local للبدء في توليد الأسئلة." 
    };
  }

  const systemInstruction = `
    You are an expert Arabic educational content creator specialized in gamified learning.
    Your goal is to create engaging, fun, and scientifically accurate multiple-choice questions.
    
    RULES:
    1. Language: Use clear, modern, and fun Arabic.
    2. Format: Return ONLY a valid JSON array.
    3. Structure: Each object must exactly match:
       {
         "questionText": "string",
         "options": ["string", "string", "string", "string"],
         "correctAnswer": number (0-3 index),
         "difficulty": "easy" | "medium" | "hard",
         "explanation": "string (a brief, fun explanation)"
       }
    4. Quality: Ensure only one answer is correct. The distractors (wrong answers) should be plausible but clearly wrong.
  `;

  const userPrompt = `Generate ${count} ${difficulty} difficulty questions about: "${topic}" in Arabic. Return ONLY the JSON array.`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" } // Groq supports JSON mode
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "فشل الاتصال بمزود الذكاء الاصطناعي");
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parse the JSON. Groq's json_object mode usually returns a single object.
    let questions;
    const parsed = JSON.parse(content);
    
    if (Array.isArray(parsed)) {
      questions = parsed;
    } else if (parsed.questions && Array.isArray(parsed.questions)) {
      questions = parsed.questions;
    } else {
      // Try extracting array using regex if structure is unexpected
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("تنسيق البيانات الناتج غير صحيح.");
      }
    }

    return { success: true, questions };

  } catch (error: any) {
    console.error("AI Generation Error (Groq):", error);
    return { 
      success: false, 
      error: `حدث خطأ: ${error.message || "خطأ غير معروف"}`
    };
  }
}
