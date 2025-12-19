import { Request, Response, NextFunction } from 'express';
/**
 * Async handler wrapper to catch errors in async route handlers
 *
 * Usage:
 * router.get('/users', asyncHandler(async (req, res) => {
 *   const users = await getUsersFromDB();
 *   res.json(users);
 * }));
 */
export declare const asyncHandler: (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => (req: Request, res: Response, next: NextFunction) => void;
export default asyncHandler;
//# sourceMappingURL=asyncHandler.d.ts.map