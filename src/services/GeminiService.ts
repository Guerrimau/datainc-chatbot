import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function getFromPrompt(prompt: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const result = await model.generateContent(prompt);
  const response = result.response;
  const answer = response.text();

  return answer;
}

const GeminiService = {
  getFromPrompt,
};

export default GeminiService;
