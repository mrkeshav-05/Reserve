import { db } from "./db";
import { users, foodListings, InsertUser, InsertFoodListing } from "../../shared/schema";
import { eq, desc } from "drizzle-orm";

export async function getUser(id: number) {
  const [user] = await db.select().from(users).where(eq(users.id, id));
  return user;
}

export async function getUserByEmail(email: string) {
  const [user] = await db.select().from(users).where(eq(users.email, email));
  return user;
}

export async function createUser(insertUser: InsertUser) {
  const [user] = await db.insert(users).values(insertUser).returning();
  return user;
}

export async function getListings() {
  const results = await db
    .select({
      listing: foodListings,
      provider: users,
    })
    .from(foodListings)
    .innerJoin(users, eq(foodListings.providerId, users.id))
    .orderBy(desc(foodListings.createdAt));
    
  return results.map(row => ({
    ...row.listing,
    provider: row.provider
  }));
}

export async function getListing(id: number) {
  const results = await db
    .select({
      listing: foodListings,
      provider: users,
    })
    .from(foodListings)
    .innerJoin(users, eq(foodListings.providerId, users.id))
    .where(eq(foodListings.id, id));
    
  if (results.length === 0) return undefined;
  
  return {
    ...results[0].listing,
    provider: results[0].provider
  };
}

export async function createListing(insertListing: InsertFoodListing) {
  const values = {
    ...insertListing,
    originalPrice: insertListing.originalPrice?.toString() || "0",
    currentPrice: insertListing.originalPrice?.toString() || "0",
  };
  const [listing] = await db.insert(foodListings).values(values).returning();
  return listing;
}

export async function updateListing(id: number, updateData: Partial<InsertFoodListing> & { status?: string, claimerId?: number, claimCode?: string }) {
  const { originalPrice, ...rest } = updateData;
  const values = {
    ...rest,
    ...(originalPrice !== undefined ? { originalPrice: originalPrice.toString() } : {})
  };
  const [updated] = await db.update(foodListings)
    .set(values)
    .where(eq(foodListings.id, id))
    .returning();
  return updated;
}
