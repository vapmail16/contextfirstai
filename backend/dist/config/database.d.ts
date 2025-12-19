import { PrismaClient } from '@prisma/client';
declare const prisma: PrismaClient<{
    log: ({
        level: "query";
        emit: "event";
    } | {
        level: "error";
        emit: "event";
    } | {
        level: "warn";
        emit: "event";
    })[];
}, "error" | "query" | "warn", import("@prisma/client/runtime/library").DefaultArgs>;
/**
 * Connect to database
 */
export declare const connectDatabase: () => Promise<void>;
/**
 * Disconnect from database
 */
export declare const disconnectDatabase: () => Promise<void>;
export { prisma };
export default prisma;
//# sourceMappingURL=database.d.ts.map