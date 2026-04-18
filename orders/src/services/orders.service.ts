import { PrismaClient } from "@prisma/client";
import { CreateOrderInput, UpdateOrderStatusInput, AddToCartInput, UpdateCartItemInput } from "../schemas/orders.schemas";
import { ERROR_MESSAGES } from "../config/constants";
import axios from "axios";
import { ENV } from "../config/env";

const prisma = new PrismaClient();

export class OrderService {
  // Order Methods
  static async createOrder(input: CreateOrderInput) {
    if (!input.items || input.items.length === 0) {
      throw new Error(ERROR_MESSAGES.INVALID_ORDER_ITEMS);
    }

    // Verify stock for all items via Catalog service
    for (const item of input.items) {
      try {
        await axios.post(`${ENV.CATALOG_SERVICE_URL}/catalog/check-stock`, {
          productId: item.productId,
          quantity: item.quantity,
        });
      } catch (error) {
        throw new Error(ERROR_MESSAGES.OUT_OF_STOCK);
      }
    }

    const orderNumber = `ORD-${Date.now()}`;
    const totalAmount = input.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);

    const order = await prisma.order.create({
      data: {
        order_number: orderNumber,
        user_id: input.userId,
        total_amount: totalAmount,
        items: {
          create: input.items.map((item) => ({
            product_id: item.productId,
            quantity: item.quantity,
            unit_price: item.unitPrice,
            subtotal: item.unitPrice * item.quantity,
          })),
        },
        history: {
          create: {
            status: "PENDING",
            note: "Order created",
          },
        },
      },
      include: { items: true, history: true },
    });

    return order;
  }

  static async getOrder(id: number) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true, history: true },
    });

    if (!order) {
      throw new Error(ERROR_MESSAGES.ORDER_NOT_FOUND);
    }

    return order;
  }

  static async getUserOrders(userId: number, limit = 10, offset = 0) {
    const orders = await prisma.order.findMany({
      where: { user_id: userId },
      include: { items: true },
      take: limit,
      skip: offset,
      orderBy: { created_at: "desc" },
    });

    const total = await prisma.order.count({
      where: { user_id: userId },
    });

    return { data: orders, total, limit, offset };
  }

  static async updateOrderStatus(id: number, input: UpdateOrderStatusInput) {
    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new Error(ERROR_MESSAGES.ORDER_NOT_FOUND);
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status: input.status as any },
      include: { items: true, history: true },
    });

    // Add history entry
    await prisma.orderHistory.create({
      data: {
        orderId: id,
        status: input.status as any,
        note: input.note,
      },
    });

    return updated;
  }

  static async cancelOrder(id: number) {
    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new Error(ERROR_MESSAGES.ORDER_NOT_FOUND);
    }

    if (order.status !== "PENDING" && order.status !== "CONFIRMED") {
      throw new Error("Cannot cancel order in current status");
    }

    return this.updateOrderStatus(id, {
      status: "CANCELLED",
      note: "Order cancelled by user",
    });
  }

  // Cart Methods
  static async getOrCreateCart(userId: number) {
    let cart = await prisma.cart.findUnique({
      where: { user_id: userId },
      include: { items: true },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { user_id: userId },
        include: { items: true },
      });
    }

    return cart;
  }

  static async getCart(userId: number) {
    const cart = await prisma.cart.findUnique({
      where: { user_id: userId },
      include: { items: true },
    });

    if (!cart) {
      throw new Error(ERROR_MESSAGES.CART_NOT_FOUND);
    }

    return cart;
  }

  static async addToCart(userId: number, input: AddToCartInput) {
    const cart = await this.getOrCreateCart(userId);

    // Check if item already exists
    const existingItem = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, product_id: input.productId },
    });

    let cartItem;
    if (existingItem) {
      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + input.quantity },
      });
    } else {
      cartItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          product_id: input.productId,
          quantity: input.quantity,
        },
      });
    }

    return this.getCart(userId);
  }

  static async updateCartItem(userId: number, productId: number, input: UpdateCartItemInput) {
    const cart = await this.getCart(userId);

    const cartItem = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, product_id: productId },
    });

    if (!cartItem) {
      throw new Error("Item not found in cart");
    }

    if (input.quantity === 0) {
      await prisma.cartItem.delete({ where: { id: cartItem.id } });
    } else {
      await prisma.cartItem.update({
        where: { id: cartItem.id },
        data: { quantity: input.quantity },
      });
    }

    return this.getCart(userId);
  }

  static async clearCart(userId: number) {
    const cart = await this.getCart(userId);

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return this.getCart(userId);
  }

  static async checkoutCart(userId: number) {
    const cart = await this.getCart(userId);

    if (cart.items.length === 0) {
      throw new Error("Cart is empty");
    }

    // Get product prices from catalog service
    const orderItems = await Promise.all(
      cart.items.map(async (item) => {
        try {
          const response = await axios.get(
            `${ENV.CATALOG_SERVICE_URL}/catalog/products/${item.product_id}`
          );
          return {
            productId: item.product_id,
            quantity: item.quantity,
            unitPrice: response.data.data.price,
          };
        } catch (error) {
          throw new Error(ERROR_MESSAGES.PRODUCT_NOT_FOUND);
        }
      })
    );

    // Create order
    const order = await this.createOrder({
      userId,
      items: orderItems,
    });

    // Clear cart
    await this.clearCart(userId);

    return order;
  }
}
