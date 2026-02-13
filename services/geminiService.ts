import { GoogleGenAI } from "@google/genai";

// Use process.env.API_KEY directly as per SDK requirements
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getMedicalInsight = async (symptoms: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Berikan ringkasan medis profesional dan daftar kemungkinan diagnosa untuk gejala berikut: ${symptoms}`,
      config: {
        systemInstruction: "Anda adalah asisten medis profesional untuk klinik di Indonesia. Berikan jawaban dalam Bahasa Indonesia yang sopan dan ringkas.",
        temperature: 0.7,
      },
    });

    // The .text property directly returns the string output as per guidelines
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Maaf, asisten AI sedang tidak tersedia saat ini.";
  }
};