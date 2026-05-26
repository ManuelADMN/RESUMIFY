import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey });
};

export const improveTextWithGemini = async (text: string, context: string): Promise<string> => {
  try {
    const ai = getClient();
    const model = "gemini-2.5-flash";
    
    const prompt = `
      Actúa como un experto redactor de currículums profesional y reclutador técnico senior.
      
      Tu tarea es reescribir y mejorar el siguiente texto para un currículum en ESPAÑOL.
      El contexto es: ${context} (ej. Experiencia laboral, educación, resumen).
      
      Reglas:
      1. Usa verbos de acción fuertes al inicio.
      2. Cuantifica los resultados si es posible (aunque tengas que usar placeholders genéricos como 'X%').
      3. Mantén un tono profesional, elegante y directo.
      4. Elimina la voz pasiva.
      5. Devuelve SOLO el texto mejorado, sin comillas ni explicaciones adicionales.
      6. Mantén el idioma Español.

      Texto original: "${text}"
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text?.trim() || text;
  } catch (error) {
    console.error("Error calling Gemini:", error);
    // Fallback logic or rethrow
    return text;
  }
};