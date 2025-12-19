"use strict";
/**
 * Upload Service
 * TDD Approach: Implemented to make tests pass (GREEN phase)
 */
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadService = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const uuid_1 = require("uuid");
const logger_1 = __importDefault(require("../utils/logger"));
const errors_1 = require("../utils/errors");
class UploadService {
    /**
     * Upload an image file
     */
    static async uploadImage(file) {
        // Validate file type
        if (!this.ALLOWED_TYPES.includes(file.mimetype)) {
            throw new errors_1.ValidationError(`File type ${file.mimetype} is not allowed. Allowed types: ${this.ALLOWED_TYPES.join(', ')}`);
        }
        // Validate file size
        if (file.size > this.MAX_FILE_SIZE) {
            throw new errors_1.ValidationError(`File size ${file.size} bytes exceeds maximum allowed size of ${this.MAX_FILE_SIZE} bytes`);
        }
        // Ensure upload directory exists
        if (!fs.existsSync(this.UPLOAD_DIR)) {
            fs.mkdirSync(this.UPLOAD_DIR, { recursive: true });
        }
        // Generate unique filename
        const ext = path.extname(file.originalname);
        const filename = `${(0, uuid_1.v4)()}${ext}`;
        const filePath = path.join(this.UPLOAD_DIR, filename);
        // Write file
        fs.writeFileSync(filePath, file.buffer);
        logger_1.default.info('Image uploaded successfully', {
            filename,
            size: file.size,
            mimetype: file.mimetype,
        });
        // Generate URL (relative to public/uploads)
        const url = `/uploads/${filename}`;
        return {
            filename,
            path: filePath,
            url,
            size: file.size,
        };
    }
    /**
     * Delete an uploaded image
     */
    static async deleteImage(filename) {
        const filePath = path.join(this.UPLOAD_DIR, filename);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            logger_1.default.info('Image deleted successfully', { filename });
        }
        else {
            logger_1.default.warn('Image file not found for deletion', { filename });
        }
    }
    /**
     * Get image URL
     */
    static getImageUrl(filename) {
        return `/uploads/${filename}`;
    }
}
exports.UploadService = UploadService;
UploadService.UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads');
UploadService.MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '5242880', 10); // 5MB default
UploadService.ALLOWED_TYPES = (process.env.ALLOWED_IMAGE_TYPES || 'image/jpeg,image/png,image/webp,image/gif').split(',');
//# sourceMappingURL=uploadService.js.map