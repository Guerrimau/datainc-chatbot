import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function getFromPrompt(prompt: string, text: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const formatPrompt = `Eres un asistente virtual que response a traves de mensajeria.
    ${prompt}. A continuacion te voy a mandar un input de un cliente: ${text}`;

  const result = await model.generateContent(formatPrompt);
  const response = result.response;
  const answer = response.text();

  return answer;
}

const GeminiService = {
  getFromPrompt,
};

export default GeminiService;
