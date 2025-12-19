"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAuthToken = exports.createTestAdmin = exports.createTestUser = void 0;
const database_1 = require("../config/database");
// Setup before all tests
beforeAll(async () => {
    // Ensure test database is connected
    await database_1.prisma.$connect();
});
// Cleanup after all tests
afterAll(async () => {
    // Disconnect from database
    await database_1.prisma.$disconnect();
});
// Clean database before each test
beforeEach(async () => {
    // Delete all data in reverse order of dependencies
    await database_1.prisma.auditLog.deleteMany();
    await database_1.prisma.passwordReset.deleteMany();
    await database_1.prisma.session.deleteMany();
    await database_1.prisma.user.deleteMany();
});
// Helper to create test user
const createTestUser = async (overrides) => {
    const bcrypt = require('bcryptjs');
    const defaultUser = {
        email: 'test@example.com',
        password: await bcrypt.hash('Password123!', 12),
        name: 'Test User',
        role: 'USER',
    };
    return database_1.prisma.user.create({
        data: { ...defaultUser, ...overrides },
    });
};
exports.createTestUser = createTestUser;
// Helper to create test admin
const createTestAdmin = async (overrides) => {
    return (0, exports.createTestUser)({
        email: 'admin@example.com',
        role: 'ADMIN',
        ...overrides,
    });
};
exports.createTestAdmin = createTestAdmin;
// Helper to get auth token for a user
const getAuthToken = async (userId) => {
    const jwt = require('jsonwebtoken');
    const config = require('../config').default;
    return jwt.sign({ userId }, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
};
exports.getAuthToken = getAuthToken;
//# sourceMappingURL=setup.js.map