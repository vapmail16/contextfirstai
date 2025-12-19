/**
 * Upload Service
 * TDD Approach: Implemented to make tests pass (GREEN phase)
 */
export interface UploadResult {
    filename: string;
    path: string;
    url: string;
    size: number;
}
export declare class UploadService {
    private static readonly UPLOAD_DIR;
    private static readonly MAX_FILE_SIZE;
    private static readonly ALLOWED_TYPES;
    /**
     * Upload an image file
     */
    static uploadImage(file: {
        originalname: string;
        mimetype: string;
        buffer: Buffer;
        size: number;
    }): Promise<UploadResult>;
    /**
     * Delete an uploaded image
     */
    static deleteImage(filename: string): Promise<void>;
    /**
     * Get image URL
     */
    static getImageUrl(filename: string): string;
}
//# sourceMappingURL=uploadService.d.ts.map