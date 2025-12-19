import { User, Role } from '@prisma/client';
/**
 * Check if user has a specific role
 */
export declare const hasRole: (userId: string, role: Role) => Promise<boolean>;
/**
 * Check if user has any of the specified roles
 */
export declare const hasAnyRole: (userId: string, roles: Role[]) => Promise<boolean>;
/**
 * Check if user has all of the specified roles
 * Note: Since users have only one role, this only returns true if checking single role
 */
export declare const hasAllRoles: (userId: string, roles: Role[]) => Promise<boolean>;
/**
 * Check if user is an admin (ADMIN or SUPER_ADMIN)
 */
export declare const isAdmin: (userId: string) => Promise<boolean>;
/**
 * Check if user is a super admin
 */
export declare const isSuperAdmin: (userId: string) => Promise<boolean>;
/**
 * Update user role
 */
export declare const updateUserRole: (userId: string, newRole: Role) => Promise<User>;
/**
 * Get user's role
 */
export declare const getUserRole: (userId: string) => Promise<Role | null>;
/**
 * Get all users with a specific role
 */
export declare const getUsersByRole: (role: Role) => Promise<Partial<User>[]>;
/**
 * Check if user can access a resource
 *
 * Rules:
 * - Users can access their own resources
 * - Admins can access any resource
 * - Super admins can access any resource
 */
export declare const canAccessResource: (userId: string, resourceType: string, resourceOwnerId: string) => Promise<boolean>;
/**
 * Get role hierarchy level
 */
export declare const getRoleHierarchy: (role: Role) => number;
/**
 * Check if user1 has a higher role than user2
 */
export declare const hasHigherRole: (userId1: string, userId2: string) => Promise<boolean>;
/**
 * Middleware helper: Require specific role(s)
 */
export declare const requireRoles: (userId: string, requiredRoles: Role[]) => Promise<void>;
/**
 * Middleware helper: Require admin role
 */
export declare const requireAdmin: (userId: string) => Promise<void>;
/**
 * Middleware helper: Require super admin role
 */
export declare const requireSuperAdmin: (userId: string) => Promise<void>;
//# sourceMappingURL=rbacService.d.ts.map