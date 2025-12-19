/**
 * Render email template with data
 */
export declare const renderTemplate: (templateName: string, data: Record<string, any>) => string;
/**
 * Send welcome email to new user
 */
export declare const sendWelcomeEmail: (params: {
    to: string;
    name?: string;
    actionUrl?: string;
}) => Promise<({
    data: import("resend").CreateEmailResponseSuccess;
    error: null;
} & {
    headers: Record<string, string> | null;
}) | {
    id: string;
}>;
/**
 * Send email verification email
 */
export declare const sendVerificationEmail: (params: {
    to: string;
    name?: string;
    token: string;
}) => Promise<({
    data: import("resend").CreateEmailResponseSuccess;
    error: null;
} & {
    headers: Record<string, string> | null;
}) | {
    id: string;
}>;
/**
 * Send password reset email
 */
export declare const sendPasswordResetEmail: (params: {
    to: string;
    name?: string;
    token: string;
}) => Promise<({
    data: import("resend").CreateEmailResponseSuccess;
    error: null;
} & {
    headers: Record<string, string> | null;
}) | {
    id: string;
}>;
/**
 * Send generic notification email
 */
export declare const sendNotificationEmail: (params: {
    to: string;
    subject: string;
    title: string;
    message: string;
    name?: string;
    actionUrl?: string;
    actionText?: string;
}) => Promise<({
    data: import("resend").CreateEmailResponseSuccess;
    error: null;
} & {
    headers: Record<string, string> | null;
}) | {
    id: string;
}>;
/**
 * Send contact form notification email to admin
 */
export declare const sendContactNotificationEmail: (params: {
    name: string;
    email: string;
    subject: string;
    message: string;
}) => Promise<({
    data: import("resend").CreateEmailResponseSuccess;
    error: null;
} & {
    headers: Record<string, string> | null;
}) | {
    id: string;
}>;
/**
 * Send newsletter confirmation email
 */
export declare const sendNewsletterConfirmationEmail: (params: {
    email: string;
    name?: string;
}) => Promise<({
    data: import("resend").CreateEmailResponseSuccess;
    error: null;
} & {
    headers: Record<string, string> | null;
}) | {
    id: string;
}>;
//# sourceMappingURL=emailService.d.ts.map