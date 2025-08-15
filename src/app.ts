import express from 'express';
import 'express-async-errors';
import { routes } from './routes';
import { errorHandling } from './middlewares/error-handling';
import cors from 'cors';
import path from 'path';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();

app.use(express.json());
app.use(cors());

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log('Restaurante conectado:', socket.id, { cors: { origin: '*' } });
});

app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')));

app.use(routes);
app.use(errorHandling);

export { server, io };
