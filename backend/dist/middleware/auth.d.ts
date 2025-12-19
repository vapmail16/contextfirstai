import { Request, Response, NextFunction } from 'express';
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                name: string | null;
                role: string;
            };
        }
    }
}
/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
export declare const authenticate: (req: Request, _res: Response, next: NextFunction) => Promise<void>;
/**
 * Authorization middleware
 * Checks if user has required role(s)
 */
export declare const requireRole: (...roles: string[]) => (req: Request, _res: Response, next: NextFunction) => void;
/**
 * Optional authentication middleware
 * Attaches user to request if token is present, but doesn't fail if absent
 */
export declare const optionalAuth: (req: Request, _res: Response, next: NextFunction) => Promise<void>;
declare const _default: {
    authenticate: (req: Request, _res: Response, next: NextFunction) => Promise<void>;
    requireRole: (...roles: string[]) => (req: Request, _res: Response, next: NextFunction) => void;
    optionalAuth: (req: Request, _res: Response, next: NextFunction) => Promise<void>;
};
export default _default;
//# sourceMappingURL=auth.d.ts.map