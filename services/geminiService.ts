
import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedImage, SoulmateProfile, TarotReading, DeckType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const IMAGE_MODEL = 'gemini-2.5-flash-image';
const TEXT_MODEL = 'gemini-3-pro-preview';

export const generateInitialImage = async (prompt: string): Promise<GeneratedImage> => {
  try {
    const response = await ai.models.generateContent({
      model: IMAGE_MODEL,
      contents: prompt,
    });
    return extractImageFromResponse(response);
  } catch (error: any) {
    console.error("Generation error:", error);
    throw new Error(error.message || "Failed to generate image.");
  }
};

export const editImage = async (base64Image: string, mimeType: string, prompt: string): Promise<GeneratedImage> => {
  try {
    const response = await ai.models.generateContent({
      model: IMAGE_MODEL,
      contents: {
        parts: [
          { inlineData: { mimeType: mimeType, data: base64Image } },
          { text: prompt }
        ]
      }
    });
    return extractImageFromResponse(response);
  } catch (error: any) {
    console.error("Editing error:", error);
    throw new Error(error.message || "Failed to edit image.");
  }
};

export const generateCardArt = async (cardName: string, deckType: DeckType): Promise<string> => {
  let stylePrompt = "";
  if (deckType === 'Rider-Waite') {
    stylePrompt = "Pamela Colman Smith 1910 Rider-Waite style. Authentic watercolor and ink, thick black outlines, bold symbolic colors, parchment texture, classic occult look.";
  } else if (deckType === 'Tarot de Marseille') {
    stylePrompt = "18th century woodcut style, Tarot de Marseille. Hand-carved aesthetic, limited palette of primary red, blue, and yellow on cream antique paper. Medieval centered composition.";
  } else if (deckType === 'Thoth') {
    stylePrompt = "Lady Frieda Harris Thoth style. Surreal geometric abstraction, intense color gradients, esoteric Egyptian and astrological symbols, dark and luminous atmosphere, complex layering.";
  }

  const prompt = `A vertical tarot card face showing the full figure of "${cardName}". ${stylePrompt} The image must be a full-bleed illustration that fills the entire frame. No borders, no frames, no text on the image itself. High fidelity, masterpiece quality.`;

  const response = await ai.models.generateContent({
    model: IMAGE_MODEL,
    contents: prompt,
    config: {
      imageConfig: {
        aspectRatio: "9:16"
      }
    }
  });
  const img = extractImageFromResponse(response);
  return img.base64;
};

export const generateTarotReading = async (spreadType: string, cardCount: number, deckType: DeckType): Promise<TarotReading> => {
  try {
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: `Perform a professional and mystical tarot reading for the spread type: "${spreadType}" using the "${deckType}" deck tradition. 
      Select ${cardCount} unique cards from the Major Arcana. Provide a deep interpretation for each card and its specific position in the spread, specifically reflecting the symbology of the ${deckType} tradition.
      Finally, provide a holistic overall interpretation of the combined energies.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            cards: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  interpretation: { type: Type.STRING },
                  positionName: { type: Type.STRING, description: "The name of the position (e.g., Past, Present, Future)" }
                },
                required: ["name", "interpretation", "positionName"]
              }
            },
            overallInterpretation: { type: Type.STRING }
          },
          required: ["cards", "overallInterpretation"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    return {
      cards: data.cards.map((c: any) => ({ ...c, isRevealed: false })),
      overallInterpretation: data.overallInterpretation,
      deckType
    };
  } catch (error: any) {
    console.error("Tarot reading error:", error);
    throw new Error("The ethereal connection was lost. Please re-initiate the ritual.");
  }
};

export const generateSoulmateProfile = async (data: {
  dob: string;
  pob: string;
  tob: string;
  preference: string;
}): Promise<SoulmateProfile> => {
  try {
    const textResponse = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: `Generate a highly detailed and mystical soulmate destiny profile in English. 
      The user was born on ${data.dob} in ${data.pob} at ${data.tob}. They are looking for a ${data.preference}.
      Use professional astrological and esoteric language.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            initials: { type: Type.STRING, description: "Initials of the soulmate's name" },
            zodiac: { type: Type.STRING, description: "Astrological sign and traits" },
            aura: { type: Type.STRING, description: "Description of their aura and energy" },
            personality: { type: Type.STRING, description: "Deep personality traits" },
            spiritualAlignment: { type: Type.STRING, description: "Their spiritual connection and energy" },
            spiritAnimal: { type: Type.STRING, description: "Their spirit animal and what it reveals" },
            career: { type: Type.STRING, description: "Their profession and ambition" },
            mission: { type: Type.STRING, description: "Their life purpose and impact" },
            timingLocation: { type: Type.STRING, description: "When and where you will meet" },
            meetingDetails: { type: Type.STRING, description: "Small details of the first encounter" },
            pastLife: { type: Type.STRING, description: "Their connection to you in previous incarnations" },
            tarotCompatibility: { type: Type.STRING, description: "A tarot reading for your compatibility" },
            spiritualSymbols: { type: Type.STRING, description: "Signs from the universe to look for" },
            conclusion: { type: Type.STRING, description: "A final encouraging spiritual message" },
            visualDescription: { type: Type.STRING, description: "A short prompt for an image generator to draw this person's portrait" }
          },
          required: ["initials", "zodiac", "aura", "personality", "spiritualAlignment", "spiritAnimal", "career", "mission", "timingLocation", "meetingDetails", "pastLife", "tarotCompatibility", "spiritualSymbols", "conclusion", "visualDescription"]
        }
      }
    });

    const profileData = JSON.parse(textResponse.text || "{}");

    const imageResponse = await ai.models.generateContent({
      model: IMAGE_MODEL,
      contents: `A hyper-realistic, ethereal charcoal and gold-leaf sketch of the soulmate: ${profileData.visualDescription}. High-end mystical portrait, cinematic lighting, celestial background.`,
    });

    const portrait = extractImageFromResponse(imageResponse);

    return {
      ...profileData,
      image: portrait
    };
  } catch (error: any) {
    console.error("Soulmate generation error:", error);
    throw new Error(error.message || "The stars are currently clouded. Please try again later.");
  }
};

const extractImageFromResponse = (response: any): GeneratedImage => {
  const parts = response?.candidates?.[0]?.content?.parts || response?.content?.parts;
  if (!parts) throw new Error("No content generated.");
  for (const part of parts) {
    if (part.inlineData) {
      return {
        base64: part.inlineData.data,
        mimeType: part.inlineData.mimeType || 'image/png',
        timestamp: Date.now()
      };
    }
  }
  throw new Error("No image data found in response.");
};
