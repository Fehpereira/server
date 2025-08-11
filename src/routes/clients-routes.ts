import { ClientsController } from '@/controllers/clients-controller';
import { Router } from 'express';

const clientsRoutes = Router();
const clientsController = new ClientsController();

clientsRoutes.post('/register', clientsController.create);

export { clientsRoutes };
