import { z } from 'zod';
import { insertUserSchema, insertFoodListingSchema, users, foodListings } from './schema';

export const errorSchemas = {
  validation: z.object({ message: z.string(), field: z.string().optional() }),
  notFound: z.object({ message: z.string() }),
  unauthorized: z.object({ message: z.string() }),
};

export const api = {
  auth: {
    register: {
      method: 'POST' as const,
      path: '/api/auth/register' as const,
      input: insertUserSchema,
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      }
    },
    // post
    login: {
      method: 'POST' as const,
      path: '/api/auth/login' as const,
      input: z.object({ email: z.string().email(), password: z.string() }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      }
    },
    // get method 
    me: {
      method: 'GET' as const,
      path: '/api/auth/me' as const,
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      }
    },
    // logout method 
    logout: {
      method: 'POST' as const,
      path: '/api/auth/logout' as const,
      responses: { 200: z.object({ message: z.string() }) }
    }
  },
  // listing 
  listings: {
    list: {
      method: 'GET' as const,
      path: '/api/listings' as const,
      responses: { 200: z.array(z.custom<typeof foodListings.$inferSelect & { provider: typeof users.$inferSelect }>()) }
    },
    // create post method 
    create: {
      method: 'POST' as const,
      path: '/api/listings' as const,
      input: insertFoodListingSchema,
      responses: {
        201: z.custom<typeof foodListings.$inferSelect>(),
        401: errorSchemas.unauthorized,
      }
    },
    // 
    get: {
      method: 'GET' as const,
      path: '/api/listings/:id' as const,
      responses: {
        200: z.custom<typeof foodListings.$inferSelect & { provider: typeof users.$inferSelect }>(),
        404: errorSchemas.notFound,
      }
    },
    claim: {
      method: 'POST' as const,
      path: '/api/listings/:id/claim' as const,
      responses: {
        200: z.custom<typeof foodListings.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      }
    }
  },
  stats: {
    impact: {
      method: 'GET' as const,
      path: '/api/stats/impact' as const,
      responses: {
        200: z.object({
          mealsSaved: z.number(),
          co2Offset: z.number()
        })
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
