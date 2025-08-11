import express from 'express';
import 'express-async-errors';
import { routes } from './routes';
import { errorHandling } from './middlewares/error-handling';
import cors from 'cors';
import path from 'path';

const app = express();

app.use(express.json());
app.use(cors());

app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')));

app.use(routes);
app.use(errorHandling);

export { app };
