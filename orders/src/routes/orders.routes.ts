import { Router } from "express";
import { OrderController } from "../controllers/orders.controller";

const router = Router();

// Order Routes
router.post("/", OrderController.createOrder);
router.get("/:id", OrderController.getOrder);
router.get("/user/:userId", OrderController.getUserOrders);
router.put("/:id/status", OrderController.updateOrderStatus);
router.delete("/:id/cancel", OrderController.cancelOrder);

// Cart Routes
router.get("/cart/:userId", OrderController.getCart);
router.post("/cart/:userId/items", OrderController.addToCart);
router.put("/cart/:userId/items/:productId", OrderController.updateCartItem);
router.delete("/cart/:userId", OrderController.clearCart);
router.post("/cart/:userId/checkout", OrderController.checkoutCart);

export default router;
