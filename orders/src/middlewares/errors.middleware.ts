import { Request, Response, NextFunction } from "express";
import { HTTP_STATUS, ERROR_MESSAGES } from "../config/constants";

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error(error);

  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: ERROR_MESSAGES.INTERNAL_ERROR,
  });
};
