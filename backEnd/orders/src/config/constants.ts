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
  ORDER_NOT_FOUND: "Order not found",
  INVALID_ORDER_ITEMS: "Order must contain at least one item",
  PRODUCT_NOT_FOUND: "Product not found",
  OUT_OF_STOCK: "Product out of stock",
  CART_NOT_FOUND: "Cart not found",
  INVALID_QUANTITY: "Invalid quantity",
  INTERNAL_ERROR: "Internal server error",
} as const;

export const SUCCESS_MESSAGES = {
  ORDER_CREATED: "Order created successfully",
  ORDER_UPDATED: "Order updated successfully",
  CART_UPDATED: "Cart updated successfully",
} as const;
