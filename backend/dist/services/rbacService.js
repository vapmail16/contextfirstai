"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireSuperAdmin = exports.requireAdmin = exports.requireRoles = exports.hasHigherRole = exports.getRoleHierarchy = exports.canAccessResource = exports.getUsersByRole = exports.getUserRole = exports.updateUserRole = exports.isSuperAdmin = exports.isAdmin = exports.hasAllRoles = exports.hasAnyRole = exports.hasRole = void 0;
const database_1 = require("../config/database");
const logger_1 = __importDefault(require("../utils/logger"));
const errors_1 = require("../utils/errors");
/**
 * Role hierarchy levels (higher number = more privileges)
 */
const ROLE_HIERARCHY = {
    USER: 1,
    ADMIN: 2,
    SUPER_ADMIN: 3,
};
/**
 * Check if user has a specific role
 */
const hasRole = async (userId, role) => {
    try {
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
            select: { role: true },
        });
        if (!user) {
            return false;
        }
        return user.role === role;
    }
    catch (error) {
        logger_1.default.error('Error checking user role', {
            userId,
            role,
            error: error.message,
        });
        return false;
    }
};
exports.hasRole = hasRole;
/**
 * Check if user has any of the specified roles
 */
const hasAnyRole = async (userId, roles) => {
    try {
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
            select: { role: true },
        });
        if (!user) {
            return false;
        }
        return roles.includes(user.role);
    }
    catch (error) {
        logger_1.default.error('Error checking user roles', {
            userId,
            roles,
            error: error.message,
        });
        return false;
    }
};
exports.hasAnyRole = hasAnyRole;
/**
 * Check if user has all of the specified roles
 * Note: Since users have only one role, this only returns true if checking single role
 */
const hasAllRoles = async (userId, roles) => {
    try {
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
            select: { role: true },
        });
        if (!user) {
            return false;
        }
        // User can only have one role, so all roles must be that one role
        return roles.length === 1 && roles[0] === user.role;
    }
    catch (error) {
        logger_1.default.error('Error checking all user roles', {
            userId,
            roles,
            error: error.message,
        });
        return false;
    }
};
exports.hasAllRoles = hasAllRoles;
/**
 * Check if user is an admin (ADMIN or SUPER_ADMIN)
 */
const isAdmin = async (userId) => {
    return (0, exports.hasAnyRole)(userId, ['ADMIN', 'SUPER_ADMIN']);
};
exports.isAdmin = isAdmin;
/**
 * Check if user is a super admin
 */
const isSuperAdmin = async (userId) => {
    return (0, exports.hasRole)(userId, 'SUPER_ADMIN');
};
exports.isSuperAdmin = isSuperAdmin;
/**
 * Update user role
 */
const updateUserRole = async (userId, newRole) => {
    try {
        const user = await database_1.prisma.user.update({
            where: { id: userId },
            data: { role: newRole },
        });
        logger_1.default.info('User role updated', {
            userId,
            newRole,
        });
        return user;
    }
    catch (error) {
        logger_1.default.error('Failed to update user role', {
            userId,
            newRole,
            error: error.message,
        });
        if (error.code === 'P2025') {
            throw new errors_1.NotFoundError('User not found');
        }
        throw error;
    }
};
exports.updateUserRole = updateUserRole;
/**
 * Get user's role
 */
const getUserRole = async (userId) => {
    try {
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
            select: { role: true },
        });
        return user?.role || null;
    }
    catch (error) {
        logger_1.default.error('Error getting user role', {
            userId,
            error: error.message,
        });
        return null;
    }
};
exports.getUserRole = getUserRole;
/**
 * Get all users with a specific role
 */
const getUsersByRole = async (role) => {
    return database_1.prisma.user.findMany({
        where: { role },
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
        },
    });
};
exports.getUsersByRole = getUsersByRole;
/**
 * Check if user can access a resource
 *
 * Rules:
 * - Users can access their own resources
 * - Admins can access any resource
 * - Super admins can access any resource
 */
const canAccessResource = async (userId, resourceType, resourceOwnerId) => {
    try {
        // User can access own resource
        if (userId === resourceOwnerId) {
            return true;
        }
        // Check if user is admin or super admin
        const userIsAdmin = await (0, exports.isAdmin)(userId);
        if (userIsAdmin) {
            return true;
        }
        return false;
    }
    catch (error) {
        logger_1.default.error('Error checking resource access', {
            userId,
            resourceType,
            resourceOwnerId,
            error: error.message,
        });
        return false;
    }
};
exports.canAccessResource = canAccessResource;
/**
 * Get role hierarchy level
 */
const getRoleHierarchy = (role) => {
    return ROLE_HIERARCHY[role] || 0;
};
exports.getRoleHierarchy = getRoleHierarchy;
/**
 * Check if user1 has a higher role than user2
 */
const hasHigherRole = async (userId1, userId2) => {
    try {
        const [role1, role2] = await Promise.all([
            (0, exports.getUserRole)(userId1),
            (0, exports.getUserRole)(userId2),
        ]);
        if (!role1 || !role2) {
            return false;
        }
        return (0, exports.getRoleHierarchy)(role1) > (0, exports.getRoleHierarchy)(role2);
    }
    catch (error) {
        logger_1.default.error('Error comparing user roles', {
            userId1,
            userId2,
            error: error.message,
        });
        return false;
    }
};
exports.hasHigherRole = hasHigherRole;
/**
 * Middleware helper: Require specific role(s)
 */
const requireRoles = async (userId, requiredRoles) => {
    const hasRequiredRole = await (0, exports.hasAnyRole)(userId, requiredRoles);
    if (!hasRequiredRole) {
        throw new errors_1.ForbiddenError('Insufficient permissions');
    }
};
exports.requireRoles = requireRoles;
/**
 * Middleware helper: Require admin role
 */
const requireAdmin = async (userId) => {
    const userIsAdmin = await (0, exports.isAdmin)(userId);
    if (!userIsAdmin) {
        throw new errors_1.ForbiddenError('Admin access required');
    }
};
exports.requireAdmin = requireAdmin;
/**
 * Middleware helper: Require super admin role
 */
const requireSuperAdmin = async (userId) => {
    const userIsSuperAdmin = await (0, exports.isSuperAdmin)(userId);
    if (!userIsSuperAdmin) {
        throw new errors_1.ForbiddenError('Super admin access required');
    }
};
exports.requireSuperAdmin = requireSuperAdmin;
//# sourceMappingURL=rbacService.js.map