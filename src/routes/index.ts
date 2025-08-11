import { Router } from 'express';
import { clientsRoutes } from './clients-routes';
import { enterprisesRoutes } from './enterprises-routes';
import { sessionsRoutes } from './sessions-routes';
import { productsRoutes } from './products-routes';
import { ordersRoutes } from './orders-routes';

const routes = Router();

routes.use('/clients', clientsRoutes);
routes.use('/enterprises', enterprisesRoutes);
routes.use('/session', sessionsRoutes);
routes.use('/products', productsRoutes);
routes.use('/orders', ordersRoutes);

export { routes };
