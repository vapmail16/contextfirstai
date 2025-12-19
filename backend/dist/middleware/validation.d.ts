import { Request, Response, NextFunction } from 'express';
import { ValidationChain } from 'express-validator';
/**
 * Validation middleware wrapper
 * Runs validation chains and returns errors if any
 */
export declare const validate: (validations: ValidationChain[]) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Common validation rules
 */
export declare const validators: {
    email: ValidationChain;
    password: ValidationChain;
    name: ValidationChain;
    uuid: (field: string) => ValidationChain;
};
export default validate;
//# sourceMappingURL=validation.d.ts.map