import { Router } from "express";
import { CatalogController } from "../controllers/catalog.controller.js";

const router = Router();

// Product Routes
router.get("/search", CatalogController.searchProducts);
router.get("/products/:id", CatalogController.getProduct);
router.post("/products", CatalogController.createProduct);
router.put("/products/:id", CatalogController.updateProduct);
router.delete("/products/:id", CatalogController.deleteProduct);
router.get("/category/:categoryId/products", CatalogController.getProductsByCategory);

// Category Routes
router.get("/categories", CatalogController.getAllCategories);
router.get("/categories/:id", CatalogController.getCategory);
router.post("/categories", CatalogController.createCategory);
router.put("/categories/:id", CatalogController.updateCategory);
router.delete("/categories/:id", CatalogController.deleteCategory);

// Stock Routes
router.post("/check-stock", CatalogController.checkStock);

export default router;
