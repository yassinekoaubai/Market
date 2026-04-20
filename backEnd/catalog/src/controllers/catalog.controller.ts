import type { Request, Response } from "express";
import { CatalogService } from "../services/catalog.service.js";
import {
  createProductSchema,
  updateProductSchema,
  createCategorySchema,
  updateCategorySchema,
  searchProductSchema,
} from "../schemas/catalog.schemas.js";
import { HTTP_STATUS, ERROR_MESSAGES, SUCCESS_MESSAGES } from "../config/constants.js";

export class CatalogController {
  // Product Endpoints
  static async createProduct(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = createProductSchema.parse(req.body);
      const product = await CatalogService.createProduct(validatedData);

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: SUCCESS_MESSAGES.PRODUCT_CREATED,
        data: product,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: ERROR_MESSAGES.INTERNAL_ERROR,
        });
      }
    }
  }

  static async getProduct(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const product = await CatalogService.getProduct(id);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: product,
      });
    } catch (error) {
      if (error instanceof Error && error.message === ERROR_MESSAGES.PRODUCT_NOT_FOUND) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: ERROR_MESSAGES.INTERNAL_ERROR,
        });
      }
    }
  }

  static async updateProduct(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const validatedData = updateProductSchema.parse(req.body);
      const product = await CatalogService.updateProduct(id, validatedData);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.PRODUCT_UPDATED,
        data: product,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: ERROR_MESSAGES.INTERNAL_ERROR,
        });
      }
    }
  }

  static async deleteProduct(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      await CatalogService.deleteProduct(id);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.PRODUCT_DELETED,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: ERROR_MESSAGES.INTERNAL_ERROR,
        });
      }
    }
  }

  static async searchProducts(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = searchProductSchema.parse(req.query);
      const result = await CatalogService.searchProducts(validatedData);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: result.data,
        pagination: {
          total: result.total,
          limit: result.limit,
          offset: result.offset,
          hasMore: result.offset + result.limit < result.total,
        },
      });
    } catch (error) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: error instanceof Error ? error.message : ERROR_MESSAGES.INTERNAL_ERROR,
      });
    }
  }

  static async getProductsByCategory(req: Request, res: Response): Promise<void> {
    try {
      const categoryId = Number(req.params.categoryId);
      const limit = Number(req.query.limit as string) || 10;
      const offset = Number(req.query.offset as string) || 0;

      const result = await CatalogService.getProductsByCategory(categoryId, limit, offset);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: result.data,
        pagination: {
          total: result.total,
          limit: result.limit,
          offset: result.offset,
        },
      });
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: ERROR_MESSAGES.INTERNAL_ERROR,
      });
    }
  }

  // Category Endpoints
  static async createCategory(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = createCategorySchema.parse(req.body);
      const category = await CatalogService.createCategory(validatedData);

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: SUCCESS_MESSAGES.CATEGORY_CREATED,
        data: category,
      });
    } catch (error) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: error instanceof Error ? error.message : ERROR_MESSAGES.INTERNAL_ERROR,
      });
    }
  }

  static async getCategory(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const category = await CatalogService.getCategory(id);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: category,
      });
    } catch (error) {
      if (error instanceof Error && error.message === ERROR_MESSAGES.CATEGORY_NOT_FOUND) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: ERROR_MESSAGES.INTERNAL_ERROR,
        });
      }
    }
  }

  static async getAllCategories(_req: Request, res: Response): Promise<void> {
    try {
      const categories = await CatalogService.getAllCategories();

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: categories,
      });
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: ERROR_MESSAGES.INTERNAL_ERROR,
      });
    }
  }

  static async updateCategory(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const validatedData = updateCategorySchema.parse(req.body);
      const category = await CatalogService.updateCategory(id, validatedData);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: category,
      });
    } catch (error) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: error instanceof Error ? error.message : ERROR_MESSAGES.INTERNAL_ERROR,
      });
    }
  }

  static async deleteCategory(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      await CatalogService.deleteCategory(id);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "Category deleted successfully",
      });
    } catch (error) {
      if (error instanceof Error && error.message === ERROR_MESSAGES.CATEGORY_NOT_FOUND) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: ERROR_MESSAGES.INTERNAL_ERROR,
        });
      }
    }
  }

  // Stock Endpoints
  static async checkStock(req: Request, res: Response): Promise<void> {
    try {
      const { productId, quantity } = req.body;
      await CatalogService.checkStock(productId, quantity);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "Stock available",
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: ERROR_MESSAGES.INTERNAL_ERROR,
        });
      }
    }
  }
}
