import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
/**
 * Global error handler middleware
 * Catches all errors and sends appropriate response
 */
export declare const errorHandler: (err: Error | AppError, req: Request, res: Response, _next: NextFunction) => void;
export default errorHandler;
//# sourceMappingURL=errorHandler.d.ts.map