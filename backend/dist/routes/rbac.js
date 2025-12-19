"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const rbacService = __importStar(require("../services/rbacService"));
const auth_1 = require("../middleware/auth");
const asyncHandler_1 = require("../utils/asyncHandler");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_1.authenticate);
/**
 * GET /api/rbac/me/role
 * Get current user's role
 */
router.get('/me/role', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const role = await rbacService.getUserRole(req.user.id);
    return res.json({
        success: true,
        data: { role },
    });
}));
/**
 * GET /api/rbac/me/permissions
 * Get current user's permissions info
 */
router.get('/me/permissions', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user.id;
    const role = await rbacService.getUserRole(userId);
    const permissions = {
        role,
        isAdmin: await rbacService.isAdmin(userId),
        isSuperAdmin: await rbacService.isSuperAdmin(userId),
        hierarchy: role ? rbacService.getRoleHierarchy(role) : 0,
    };
    return res.json({
        success: true,
        data: permissions,
    });
}));
/**
 * GET /api/rbac/users/role/:role
 * Get all users with a specific role (admin only)
 */
router.get('/users/role/:role', (0, auth_1.requireRole)('ADMIN', 'SUPER_ADMIN'), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const role = req.params.role;
    const users = await rbacService.getUsersByRole(role);
    return res.json({
        success: true,
        data: users,
    });
}));
/**
 * PUT /api/rbac/users/:userId/role
 * Update user role (super admin only)
 */
router.put('/users/:userId/role', (0, auth_1.requireRole)('SUPER_ADMIN'), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId } = req.params;
    const { role } = req.body;
    if (!role || !['USER', 'ADMIN', 'SUPER_ADMIN'].includes(role)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid role. Must be USER, ADMIN, or SUPER_ADMIN',
        });
    }
    const updatedUser = await rbacService.updateUserRole(userId, role);
    return res.json({
        success: true,
        data: updatedUser,
        message: `User role updated to ${role}`,
    });
}));
/**
 * GET /api/rbac/check/role/:role
 * Check if current user has a specific role
 */
router.get('/check/role/:role', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const role = req.params.role;
    const hasRole = await rbacService.hasRole(req.user.id, role);
    return res.json({
        success: true,
        data: { hasRole },
    });
}));
/**
 * POST /api/rbac/check/access
 * Check if current user can access a resource
 */
router.post('/check/access', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { resourceType, resourceOwnerId } = req.body;
    if (!resourceType || !resourceOwnerId) {
        return res.status(400).json({
            success: false,
            error: 'resourceType and resourceOwnerId are required',
        });
    }
    const canAccess = await rbacService.canAccessResource(req.user.id, resourceType, resourceOwnerId);
    return res.json({
        success: true,
        data: { canAccess },
    });
}));
/**
 * GET /api/rbac/compare/:userId
 * Compare current user's role with another user (admin only)
 */
router.get('/compare/:userId', (0, auth_1.requireRole)('ADMIN', 'SUPER_ADMIN'), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId } = req.params;
    const currentUserId = req.user.id;
    const [currentRole, targetRole, hasHigher] = await Promise.all([
        rbacService.getUserRole(currentUserId),
        rbacService.getUserRole(userId),
        rbacService.hasHigherRole(currentUserId, userId),
    ]);
    return res.json({
        success: true,
        data: {
            currentUser: {
                id: currentUserId,
                role: currentRole,
                hierarchy: currentRole ? rbacService.getRoleHierarchy(currentRole) : 0,
            },
            targetUser: {
                id: userId,
                role: targetRole,
                hierarchy: targetRole ? rbacService.getRoleHierarchy(targetRole) : 0,
            },
            hasHigherRole: hasHigher,
        },
    });
}));
exports.default = router;
//# sourceMappingURL=rbac.js.map