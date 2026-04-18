import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import type { CreateProductInput, UpdateProductInput, CreateCategoryInput, UpdateCategoryInput, SearchProductInput } from "../schemas/catalog.schemas";
import { ERROR_MESSAGES } from "../config/constants";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

export class CatalogService {
  // Product Methods
  static async createProduct(input: CreateProductInput) {
    const existing = await prisma.product.findUnique({
      where: { sku: input.sku },
    });

    if (existing) {
      throw new Error(ERROR_MESSAGES.DUPLICATE_PRODUCT);
    }

    const product = await prisma.product.create({
      data: {
        ...input,
        image_url: input.image_url ?? null,
      },
      include: { category: true },
    });

    return product;
  }

  static async getProduct(id: number) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true, ratings: true },
    });

    if (!product) {
      throw new Error(ERROR_MESSAGES.PRODUCT_NOT_FOUND);
    }

    return product;
  }

  static async updateProduct(id: number, input: UpdateProductInput) {
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new Error(ERROR_MESSAGES.PRODUCT_NOT_FOUND);
    }

    if (input.sku && input.sku !== product.sku) {
      const existing = await prisma.product.findUnique({
        where: { sku: input.sku },
      });
      if (existing) {
        throw new Error(ERROR_MESSAGES.DUPLICATE_PRODUCT);
      }
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.price !== undefined && { price: input.price }),
        ...(input.quantity !== undefined && { quantity: input.quantity }),
        ...(input.sku !== undefined && { sku: input.sku }),
        ...(input.categoryId !== undefined && { categoryId: input.categoryId }),
        ...(input.image_url !== undefined && { image_url: input.image_url }),
      },
      include: { category: true },
    });

    return updated;
  }

  static async deleteProduct(id: number) {
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new Error(ERROR_MESSAGES.PRODUCT_NOT_FOUND);
    }

    await prisma.product.delete({
      where: { id },
    });
  }

  static async searchProducts(input: SearchProductInput) {
    const where: any = { is_active: true };

    if (input.search) {
      where.OR = [
        { name: { contains: input.search, mode: "insensitive" } },
        { description: { contains: input.search, mode: "insensitive" } },
        { sku: { contains: input.search, mode: "insensitive" } },
      ];
    }

    if (input.categoryId) {
      where.categoryId = input.categoryId;
    }

    if (input.minPrice !== undefined || input.maxPrice !== undefined) {
      where.price = {};
      if (input.minPrice !== undefined) {
        where.price.gte = input.minPrice;
      }
      if (input.maxPrice !== undefined) {
        where.price.lte = input.maxPrice;
      }
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true },
        take: input.limit,
        skip: input.offset,
        orderBy: { created_at: "desc" },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      data: products,
      total,
      limit: input.limit,
      offset: input.offset,
    };
  }

  static async getProductsByCategory(categoryId: number, limit = 10, offset = 0) {
    const products = await prisma.product.findMany({
      where: { categoryId, is_active: true },
      include: { category: true },
      take: limit,
      skip: offset,
    });

    const total = await prisma.product.count({
      where: { categoryId, is_active: true },
    });

    return { data: products, total, limit, offset };
  }

  // Category Methods
  static async createCategory(input: CreateCategoryInput) {
    const category = await prisma.category.create({
      data: {
        ...input,
        image_url: input.image_url ?? null,
      },
    });

    return category;
  }

  static async getCategory(id: number) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: { products: true },
    });

    if (!category) {
      throw new Error(ERROR_MESSAGES.CATEGORY_NOT_FOUND);
    }

    return category;
  }

  static async getAllCategories() {
    return prisma.category.findMany({
      include: { products: true },
      orderBy: { name: "asc" },
    });
  }

  static async updateCategory(id: number, input: UpdateCategoryInput) {
    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new Error(ERROR_MESSAGES.CATEGORY_NOT_FOUND);
    }

    const updated = await prisma.category.update({
      where: { id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.image_url !== undefined && { image_url: input.image_url }),
      },
    });

    return updated;
  }

  static async deleteCategory(id: number) {
    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new Error(ERROR_MESSAGES.CATEGORY_NOT_FOUND);
    }

    await prisma.category.delete({
      where: { id },
    });
  }

  // Stock Methods
  static async checkStock(productId: number, quantity: number) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new Error(ERROR_MESSAGES.PRODUCT_NOT_FOUND);
    }

    if (product.quantity < quantity) {
      throw new Error(ERROR_MESSAGES.OUT_OF_STOCK);
    }

    return product;
  }

  static async updateStock(productId: number, quantityChange: number) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new Error(ERROR_MESSAGES.PRODUCT_NOT_FOUND);
    }

    const newQuantity = product.quantity + quantityChange;

    if (newQuantity < 0) {
      throw new Error(ERROR_MESSAGES.INVALID_QUANTITY);
    }

    return prisma.product.update({
      where: { id: productId },
      data: { quantity: newQuantity },
    });
  }
}
