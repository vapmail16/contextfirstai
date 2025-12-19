"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require("./auth"));
const health_1 = __importDefault(require("./health"));
const notifications_1 = __importDefault(require("./notifications"));
const audit_1 = __importDefault(require("./audit"));
const rbac_1 = __importDefault(require("./rbac"));
const payments_1 = __importDefault(require("./payments"));
const gdpr_1 = __importDefault(require("./gdpr"));
const content_1 = __importDefault(require("./content"));
const adminContent_1 = __importDefault(require("./adminContent"));
const contact_1 = __importDefault(require("./contact"));
const newsletter_1 = __importDefault(require("./newsletter"));
const upload_1 = __importDefault(require("./upload"));
const router = (0, express_1.Router)();
// Mount routes
router.use('/health', health_1.default);
router.use('/auth', auth_1.default);
router.use('/notifications', notifications_1.default);
router.use('/audit', audit_1.default);
router.use('/rbac', rbac_1.default);
router.use('/payments', payments_1.default);
router.use('/gdpr', gdpr_1.default);
router.use('/content', content_1.default);
router.use('/admin', adminContent_1.default);
router.use('/contact', contact_1.default);
router.use('/newsletter', newsletter_1.default);
router.use('/upload', upload_1.default);
// Root endpoint
router.get('/', (_req, res) => {
    res.json({
        success: true,
        message: 'App Template API',
        version: '1.0.0',
    });
});
exports.default = router;
//# sourceMappingURL=index.js.map