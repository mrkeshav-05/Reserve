import { db } from "../src/lib/db";
import { users, foodListings } from "../shared/schema";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function seed() {
  console.log("Cleaning existing data from database...");
  await db.delete(foodListings);
  await db.delete(users);

  console.log("Seeding database...");

  // Generate some hashed passwords
  const passwordProvider = await hashPassword("password123");
  const passwordNgo = await hashPassword("password123");
  const passwordIndividual = await hashPassword("password123");

  // Insert Users
  const insertedUsers = await db.insert(users).values([
    {
      name: "Fresh Bakery",
      email: "fresh@bakery.com",
      password: passwordProvider,
      role: "Provider",
      locationLat: "37.7749",
      locationLng: "-122.4194",
      rating: "4.8"
    },
    {
      name: "Local Food Bank",
      email: "contact@localfoodbank.org",
      password: passwordNgo,
      role: "NGO",
      locationLat: "37.7849",
      locationLng: "-122.4094",
      rating: "5.0"
    },
    {
      name: "John Doe",
      email: "john@example.com",
      password: passwordIndividual,
      role: "Individual",
      locationLat: "37.7949",
      locationLng: "-122.3994",
      rating: "4.5"
    }
  ]).returning();

  console.log(`Inserted ${insertedUsers.length} users`);

  const provider = insertedUsers.find(u => u.role === "Provider");
  const ngo = insertedUsers.find(u => u.role === "NGO");

  if (!provider) {
    throw new Error("Provider user not found after insertion");
  }

  // Insert Food Listings
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);

  const insertedListings = await db.insert(foodListings).values([
    {
      providerId: provider.id,
      title: "Assorted Pastries",
      description: "A mix of leftover croissants, danishes, and muffins from today's batch.",
      quantity: 15,
      originalPrice: "30.00",
      currentPrice: "5.00",
      expiryTimestamp: tomorrow,
      pickupWindow: "18:00 - 20:00",
      status: "Available",
      isDonation: false,
      nutritionalInfo: {
        calories: 380,
        protein: 6,
        carbs: 48,
        fats: 18
      }
    },
    {
      providerId: provider.id,
      title: "Sourdough Loaves",
      description: "Freshly baked sourdough bread that didn't sell out.",
      quantity: 5,
      originalPrice: "25.00",
      currentPrice: "0.00",
      expiryTimestamp: tomorrow,
      pickupWindow: "17:00 - 19:00",
      status: "Available",
      isDonation: true,
      nutritionalInfo: {
        calories: 250,
        protein: 8,
        carbs: 52,
        fats: 1
      }
    },
    {
      providerId: provider.id,
      title: "Baguettes",
      description: "French baguettes, perfect for sandwiches or garlic bread.",
      quantity: 10,
      originalPrice: "20.00",
      currentPrice: "4.00",
      expiryTimestamp: nextWeek,
      pickupWindow: "12:00 - 15:00",
      status: "Available",
      isDonation: false,
      nutritionalInfo: {
        calories: 270,
        protein: 9,
        carbs: 56,
        fats: 1.5
      }
    }
  ]).returning();

  console.log(`Inserted ${insertedListings.length} food listings`);
  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Error seeding database:", err);
  process.exit(1);
});
