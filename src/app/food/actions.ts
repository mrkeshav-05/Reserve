"use server"

import { db } from "@/lib/db";
import { foodListings } from "../../../shared/schema";
import { GoogleGenAI } from "@google/genai";
import { getSession } from "@/lib/session";

type ClientFoodItemData = {
  name: string;
  description: string;
  basePrice: number;
  quantity: number;
  expiryDate: Date;
  pricingRule: string;
  pickupWindow: string;
  imageUrl?: string;
};

function getLocalNutritionalEstimate(name: string) {
  const lowerName = name.toLowerCase();
  if (lowerName.includes("pastry") || lowerName.includes("croissant") || lowerName.includes("muffin") || lowerName.includes("cake") || lowerName.includes("donut") || lowerName.includes("bakery")) {
    return { calories: 380, protein: 6, carbs: 48, fats: 18 };
  }
  if (lowerName.includes("bread") || lowerName.includes("sourdough") || lowerName.includes("baguette") || lowerName.includes("loaf")) {
    return { calories: 260, protein: 8, carbs: 54, fats: 1.5 };
  }
  if (lowerName.includes("salad") || lowerName.includes("vegetable") || lowerName.includes("greens")) {
    return { calories: 80, protein: 2, carbs: 8, fats: 5 };
  }
  if (lowerName.includes("pasta") || lowerName.includes("noodle") || lowerName.includes("spaghetti")) {
    return { calories: 150, protein: 5, carbs: 30, fats: 1 };
  }
  if (lowerName.includes("pizza")) {
    return { calories: 266, protein: 11, carbs: 33, fats: 10 };
  }
  if (lowerName.includes("chicken") || lowerName.includes("poultry") || lowerName.includes("turkey")) {
    return { calories: 165, protein: 31, carbs: 0, fats: 3.6 };
  }
  if (lowerName.includes("beef") || lowerName.includes("meat") || lowerName.includes("pork") || lowerName.includes("steak")) {
    return { calories: 250, protein: 26, carbs: 0, fats: 15 };
  }
  if (lowerName.includes("rice") || lowerName.includes("grain")) {
    return { calories: 130, protein: 2.7, carbs: 28, fats: 0.3 };
  }
  if (lowerName.includes("fruit") || lowerName.includes("apple") || lowerName.includes("banana") || lowerName.includes("orange") || lowerName.includes("berry")) {
    return { calories: 60, protein: 0.8, carbs: 15, fats: 0.2 };
  }
  return { calories: 200, protein: 7, carbs: 25, fats: 8 };
}

export async function createFoodItem(data: ClientFoodItemData) {
  const session = await getSession();
  if (!session?.userId) {
    throw new Error("Unauthorized: Must be logged in to create a food item.");
  }

  // Initialize the Gemini client
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  let nutritionalInfo = null;
  try {
    const prompt = `Provide a brief JSON breakdown of the estimated macronutrients (calories, protein, carbs, fats) for 100g of ${data.name}. Only output valid JSON, with keys: "calories", "protein", "carbs", "fats". Do not use markdown blocks.`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    
    const text = response.text || "{}";
    const cleanedText = text.replace(/```json/gi, "").replace(/```/g, "").trim();
    nutritionalInfo = JSON.parse(cleanedText);
  } catch (err) {
    console.error("Failed to fetch nutritional info from Gemini, using fallback:", err);
    nutritionalInfo = getLocalNutritionalEstimate(data.name);
  }

  const [newItem] = await db.insert(foodListings).values({
    title: data.name + (nutritionalInfo ? " (AI-Powered Pricing)" : ""),
    description: data.description,
    originalPrice: data.basePrice.toString(),
    currentPrice: data.basePrice.toString(),
    expiryTimestamp: data.expiryDate,
    quantity: data.quantity,
    pickupWindow: data.pickupWindow,
    providerId: session.userId,
    isDonation: data.basePrice === 0,
    status: "Available",
    pricingRule: data.pricingRule,
    imageUrl: data.imageUrl || null,
    nutritionalInfo,
  }).returning();

  return newItem;
}
