import { GoogleGenAI } from "@google/genai";
import { Property } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getPropertySuggestion(userQuery: string, properties: Property[]) {
  try {
    const propertyContext = properties.map(p => 
      `${p.name} (${p.type}): ${p.description} - السعر: ${p.pricePerNight}$ - الموقع: ${p.location}`
    ).join('\n---\n');

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        أنت مساعد في تطبيق "مأوى". مهمتك هي مساعدة المستخدم في العثور على أفضل مأوى بناءً على طلبه.
        إليك قائمة العقارات المتوفرة حالياً:
        ${propertyContext}

        سؤال المستخدم: "${userQuery}"

        يرجى الرد باللغة العربية، بأسلوب ودي ومتعاون، واقتراح العقار الأنسب مع ذكر السبب باختصار.
      `,
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "عذراً، حدث خطأ أثناء معالجة طلبك. يرجى المحاولة لاحقاً.";
  }
}
