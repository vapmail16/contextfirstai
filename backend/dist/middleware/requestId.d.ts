import { Request, Response, NextFunction } from 'express';
/**
 * Request ID middleware
 * Generates or extracts request ID from headers and adds it to request and response
 */
export declare const requestId: (req: Request, res: Response, next: NextFunction) => void;
export default requestId;
//# sourceMappingURL=requestId.d.ts.map