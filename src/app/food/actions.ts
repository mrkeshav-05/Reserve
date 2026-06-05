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
    console.error("Failed to fetch nutritional info:", err);
    // We continue saving the food item even if the AI failed to respond properly
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
