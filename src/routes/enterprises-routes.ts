import { EnterprisesController } from '@/controllers/enterprises-controller';
import { uploadHandling } from '@/middlewares/files-handling';
import { tokenValidation } from '@/middlewares/token-validation';
import { verifyAuthorization } from '@/middlewares/verify-authorization';
import { Router } from 'express';

const enterprisesRoutes = Router();
const enterprisesController = new EnterprisesController();

enterprisesRoutes.post('/register', enterprisesController.create);
enterprisesRoutes.get('/', enterprisesController.index);
enterprisesRoutes.get('/:enterpriseId', enterprisesController.getById);

enterprisesRoutes.use(tokenValidation, verifyAuthorization(['enterprise']));
enterprisesRoutes.post(
  '/:enterpriseId/products',
  uploadHandling,
  enterprisesController.createProduct,
);
enterprisesRoutes.patch(
  '/:enterpriseId/is-open',
  enterprisesController.updateOpenStatus,
);
enterprisesRoutes.patch(
  '/:enterpriseId/opening-hours',
  enterprisesController.updateOpeningHours,
);
enterprisesRoutes.patch(
  '/:enterpriseId/logo',
  uploadHandling,
  enterprisesController.updateLogo,
);

export { enterprisesRoutes };
