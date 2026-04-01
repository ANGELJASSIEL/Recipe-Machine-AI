import { GoogleGenAI, Type } from "@google/genai";
import { base64ToPcm, pcmToWav } from "../lib/audioUtils";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface RecipeIngredient {
  name: string;
  amount: string;
  searchQuery: string;
  buyUrl?: string; // We'll try to get this from grounding
}

export interface RecipeInstruction {
  step: number;
  text: string;
}

export interface Recipe {
  title: string;
  description: string;
  imagePrompt: string;
  ingredients: RecipeIngredient[];
  instructions: RecipeInstruction[];
}

export async function generateFusionRecipe(
  country1: string,
  country2: string,
  courseType: string,
  dietaryPreferences: string[],
  specificIngredients: string,
  allergies: string
): Promise<Recipe> {
  const prompt = `
Eres un chef experto de clase mundial especializado en cocina fusión.
Crea una receta de cocina fusión única y deliciosa que combine la gastronomía de ${country1} y ${country2}.

Investiga profundamente la cocina tradicional, las técnicas y los ingredientes autóctonos de cada uno de estos dos países para asegurar que los ingredientes y la preparación sean auténticos y correctos según su contexto cultural.

Detalles de la solicitud:
- Tipo de plato: ${courseType}
- Preferencias dietéticas: ${dietaryPreferences.length > 0 ? dietaryPreferences.join(', ') : 'Ninguna'}
- Ingredientes específicos a incluir: ${specificIngredients || 'Ninguno'}
- Alergias a evitar: ${allergies || 'Ninguna'}

Para cada ingrediente, proporciona un término de búsqueda (searchQuery) que el usuario pueda usar para comprarlo en línea.

Responde estrictamente en formato JSON usando la estructura definida.
`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Nombre creativo de la receta fusión" },
          description: { type: Type.STRING, description: "Breve descripción apetitosa de la fusión y sus sabores" },
          imagePrompt: { type: Type.STRING, description: "Prompt detallado en inglés para generar una imagen fotorrealista de este plato, estilo fotografía culinaria profesional" },
          ingredients: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                amount: { type: Type.STRING },
                searchQuery: { type: Type.STRING, description: "Término de búsqueda para comprar este ingrediente en un supermercado online" }
              },
              required: ["name", "amount", "searchQuery"]
            }
          },
          instructions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                step: { type: Type.INTEGER },
                text: { type: Type.STRING }
              },
              required: ["step", "text"]
            }
          }
        },
        required: ["title", "description", "imagePrompt", "ingredients", "instructions"]
      },
      tools: [{ googleSearch: {} }],
      toolConfig: { includeServerSideToolInvocations: true }
    }
  });

  const text = response.text;
  if (!text) {
    throw new Error("No response from Gemini");
  }

  try {
    const recipe: Recipe = JSON.parse(text);
    
    // Try to attach grounding URLs to ingredients if available
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (groundingChunks && groundingChunks.length > 0) {
      // Map URLs to ingredients based on search queries (simplified approach)
      // We just provide a generic search link if we don't have a specific grounded link
      recipe.ingredients = recipe.ingredients.map(ing => {
        // Find a chunk that might match the ingredient
        const matchingChunk = groundingChunks.find(chunk => 
          chunk.web?.title?.toLowerCase().includes(ing.name.toLowerCase()) ||
          chunk.web?.uri?.toLowerCase().includes(ing.name.toLowerCase())
        );
        
        return {
          ...ing,
          buyUrl: matchingChunk?.web?.uri || `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(ing.searchQuery)}`
        };
      });
    } else {
      // Fallback to Google Shopping links
      recipe.ingredients = recipe.ingredients.map(ing => ({
        ...ing,
        buyUrl: `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(ing.searchQuery)}`
      }));
    }

    return recipe;
  } catch (e) {
    console.error("Failed to parse recipe JSON", text);
    throw new Error("Failed to parse recipe from AI");
  }
}

export async function generateRecipeImage(imagePrompt: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          text: imagePrompt,
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "16:9",
      }
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
    }
  }
  
  throw new Error("No image generated");
}

export async function generateRecipeAudio(recipe: Recipe): Promise<string> {
  const textToRead = `
    ${recipe.title}.
    ${recipe.description}.
    Ingredientes:
    ${recipe.ingredients.map(i => i.amount + ' de ' + i.name).join(', ')}.
    Instrucciones:
    ${recipe.instructions.map(i => 'Paso ' + i.step + ': ' + i.text).join('. ')}.
    ¡Buen provecho!
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: textToRead }] }],
    config: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' }, // Or another voice
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (base64Audio) {
    const pcmData = base64ToPcm(base64Audio);
    const wavBlob = pcmToWav(pcmData, 24000);
    return URL.createObjectURL(wavBlob);
  }
  
  throw new Error("No audio generated");
}
