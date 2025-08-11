import { OrdersController } from '@/controllers/orders-controller';
import { tokenValidation } from '@/middlewares/token-validation';
import { verifyAuthorization } from '@/middlewares/verify-authorization';
import { Router } from 'express';

const ordersRoutes = Router();
const ordersController = new OrdersController();

ordersRoutes.use(tokenValidation);
ordersRoutes.post(
  '/',
  verifyAuthorization(['client']),
  ordersController.create,
);
ordersRoutes.get(
  '/:clientId',
  verifyAuthorization(['client', 'enterprise']),
  ordersController.getByClientId,
);

ordersRoutes.use(verifyAuthorization(['enterprise']));

ordersRoutes.get(
  '/enterprise/:enterpriseId',
  ordersController.getByEnterpriseId,
);
ordersRoutes.patch('/:enterpriseId/:orderId', ordersController.update);

export { ordersRoutes };
