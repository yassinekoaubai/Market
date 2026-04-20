import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.number().positive("Price must be positive"),
  quantity: z.number().int().nonnegative().default(0),
  sku: z.string().min(2, "SKU must be at least 2 characters"),
  categoryId: z.number().int().positive("Invalid category ID"),
  image_url: z.string().url().optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const createCategorySchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  image_url: z.string().url().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export const searchProductSchema = z.object({
  search: z.string().optional(),
  categoryId: z.coerce.number().int().optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  limit: z.coerce.number().int().positive().default(10),
  offset: z.coerce.number().int().nonnegative().default(0),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type SearchProductInput = z.infer<typeof searchProductSchema>;
