import { Router } from 'express';
import authRoutes from './auth';
import healthRoutes from './health';
import notificationRoutes from './notifications';
import auditRoutes from './audit';
import rbacRoutes from './rbac';
import paymentRoutes from './payments';
import gdprRoutes from './gdpr';
import contentRoutes from './content';
import adminContentRoutes from './adminContent';
import contactRoutes from './contact';
import newsletterRoutes from './newsletter';
import uploadRoutes from './upload';

const router = Router();

// Mount routes
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/notifications', notificationRoutes);
router.use('/audit', auditRoutes);
router.use('/rbac', rbacRoutes);
router.use('/payments', paymentRoutes);
router.use('/gdpr', gdprRoutes);
router.use('/content', contentRoutes);
router.use('/admin', adminContentRoutes);
router.use('/contact', contactRoutes);
router.use('/newsletter', newsletterRoutes);
router.use('/upload', uploadRoutes);

// Root endpoint
router.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'App Template API',
    version: '1.0.0',
  });
});

export default router;

