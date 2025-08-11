import { ProductsController } from '@/controllers/products-controller';
import { uploadHandling } from '@/middlewares/files-handling';
import { tokenValidation } from '@/middlewares/token-validation';
import { verifyAuthorization } from '@/middlewares/verify-authorization';
import { Router } from 'express';

const productsRoutes = Router();
const productsController = new ProductsController();

productsRoutes.use(tokenValidation);
productsRoutes.get('/:enterpriseId', productsController.getByEnterpriseId);

productsRoutes.put(
  '/:enterpriseId/:productId',
  verifyAuthorization(['enterprise']),
  uploadHandling,
  productsController.update,
);

productsRoutes.use(verifyAuthorization(['enterprise']));

productsRoutes.patch('/:enterpriseId/:productId', productsController.delete);

productsRoutes.get('/:enterpriseId/:productId', productsController.getById);

export { productsRoutes };
