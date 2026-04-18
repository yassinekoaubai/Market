import { Request, Response } from "express";
import { OrderService } from "../services/orders.service";
import {
  createOrderSchema,
  updateOrderStatusSchema,
  addToCartSchema,
  updateCartItemSchema,
} from "../schemas/orders.schemas";
import { HTTP_STATUS, ERROR_MESSAGES, SUCCESS_MESSAGES } from "../config/constants";

export class OrderController {
  // Order Endpoints
  static async createOrder(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = createOrderSchema.parse(req.body);
      const order = await OrderService.createOrder(validatedData);

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: SUCCESS_MESSAGES.ORDER_CREATED,
        data: order,
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

  static async getOrder(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const order = await OrderService.getOrder(id);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: order,
      });
    } catch (error) {
      if (error instanceof Error && error.message === ERROR_MESSAGES.ORDER_NOT_FOUND) {
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

  static async getUserOrders(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.userId);
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;

      const result = await OrderService.getUserOrders(userId, limit, offset);

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

  static async updateOrderStatus(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const validatedData = updateOrderStatusSchema.parse(req.body);
      const order = await OrderService.updateOrderStatus(id, validatedData);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.ORDER_UPDATED,
        data: order,
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

  static async cancelOrder(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const order = await OrderService.cancelOrder(id);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "Order cancelled successfully",
        data: order,
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

  // Cart Endpoints
  static async getCart(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.userId);
      const cart = await OrderService.getOrCreateCart(userId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: cart,
      });
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: ERROR_MESSAGES.INTERNAL_ERROR,
      });
    }
  }

  static async addToCart(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.userId);
      const validatedData = addToCartSchema.parse(req.body);
      const cart = await OrderService.addToCart(userId, validatedData);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.CART_UPDATED,
        data: cart,
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

  static async updateCartItem(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.userId);
      const productId = parseInt(req.params.productId);
      const validatedData = updateCartItemSchema.parse(req.body);
      const cart = await OrderService.updateCartItem(userId, productId, validatedData);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.CART_UPDATED,
        data: cart,
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

  static async clearCart(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.userId);
      const cart = await OrderService.clearCart(userId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "Cart cleared successfully",
        data: cart,
      });
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: ERROR_MESSAGES.INTERNAL_ERROR,
      });
    }
  }

  static async checkoutCart(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.userId);
      const order = await OrderService.checkoutCart(userId);

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: "Checkout completed successfully",
        data: order,
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
