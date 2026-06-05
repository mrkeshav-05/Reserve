import { pgTable, text, serial, integer, boolean, timestamp, numeric, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password"),
  role: text("role").notNull(), // Provider, NGO, Individual
  locationLat: numeric("location_lat"),
  locationLng: numeric("location_lng"),
  rating: numeric("rating").default("5.0"),
});

export const foodListings = pgTable("food_listings", {
  id: serial("id").primaryKey(),
  providerId: integer("provider_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  quantity: integer("quantity").notNull(),
  originalPrice: numeric("original_price").notNull(),
  currentPrice: numeric("current_price").notNull(),
  expiryTimestamp: timestamp("expiry_timestamp").notNull(),
  pickupWindow: text("pickup_window").notNull(),
  status: text("status").notNull().default("Available"), // Available, Reserved, Completed, Expired
  isDonation: boolean("is_donation").notNull().default(false),
  claimCode: text("claim_code"),
  claimerId: integer("claimer_id"),
  pricingRule: text("pricing_rule"),
  imageUrl: text("image_url"),
  nutritionalInfo: jsonb("nutritional_info"),
  createdAt: timestamp("created_at").defaultNow()
});

export const usersRelations = relations(users, ({ many }) => ({
  listings: many(foodListings, { relationName: "provider" }),
  claims: many(foodListings, { relationName: "claimer" }),
}));

export const foodListingsRelations = relations(foodListings, ({ one }) => ({
  provider: one(users, {
    fields: [foodListings.providerId],
    references: [users.id],
    relationName: "provider"
  }),
  claimer: one(users, {
    fields: [foodListings.claimerId],
    references: [users.id],
    relationName: "claimer"
  }),
}));

export const insertUserSchema = createInsertSchema(users).omit({ id: true, rating: true });
export const insertFoodListingSchema = createInsertSchema(foodListings).omit({ 
  id: true, claimCode: true, claimerId: true, status: true, currentPrice: true, createdAt: true 
}).extend({
  originalPrice: z.coerce.number(),
  quantity: z.coerce.number(),
  expiryTimestamp: z.coerce.date(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type FoodListing = typeof foodListings.$inferSelect;
export type InsertFoodListing = z.infer<typeof insertFoodListingSchema>;
