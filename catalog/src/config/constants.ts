export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const ERROR_MESSAGES = {
  PRODUCT_NOT_FOUND: "Product not found",
  CATEGORY_NOT_FOUND: "Category not found",
  INVALID_PRICE: "Invalid price value",
  DUPLICATE_PRODUCT: "Product with this SKU already exists",
  INVALID_QUANTITY: "Invalid quantity",
  OUT_OF_STOCK: "Product out of stock",
  INTERNAL_ERROR: "Internal server error",
} as const;

export const SUCCESS_MESSAGES = {
  PRODUCT_CREATED: "Product created successfully",
  PRODUCT_UPDATED: "Product updated successfully",
  PRODUCT_DELETED: "Product deleted successfully",
  CATEGORY_CREATED: "Category created successfully",
} as const;
