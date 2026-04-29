"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");

export async function generateQuestionsAction(topic: string, count: number = 5, difficulty: string = "medium") {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return { success: false, error: "Missing Gemini API Key. Please add GOOGLE_GENERATIVE_AI_API_KEY to your environment variables." };
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    You are an expert educational content creator. Create ${count} multiple-choice questions for students about the topic: "${topic}".
    The difficulty level should be "${difficulty}".
    
    IMPORTANT: Return the response ONLY as a valid JSON array of objects. Do not include any markdown formatting or extra text.
    Each object must have this exact structure:
    {
      "questionText": "string",
      "options": ["string", "string", "string", "string"],
      "correctAnswer": number (0-3 index of the correct option),
      "difficulty": "${difficulty}",
      "explanation": "string (a brief fun explanation why this is correct)"
    }
    
    Make the questions fun, engaging, and in Arabic language.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean up the text in case Gemini adds markdown code blocks
    const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    const questions = JSON.parse(cleanedText);
    
    return { success: true, questions };
  } catch (e: any) {
    console.error("AI Generation Error:", e);
    return { success: false, error: e.message || "Failed to generate questions. Please try again." };
  }
}
