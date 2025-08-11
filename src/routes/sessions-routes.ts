import { SessionsController } from '@/controllers/sessions-controller';
import { Router } from 'express';

const sessionsRoutes = Router();

const sessionsController = new SessionsController();

sessionsRoutes.post('/clients', sessionsController.clientLogin);
sessionsRoutes.post('/enterprises', sessionsController.enterpriseLogin);

export { sessionsRoutes };
