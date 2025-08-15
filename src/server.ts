import { server } from './app';
import { env } from './env';

server.listen(env.PORT, () =>
  console.log(`Server is running on port http://localhost:${env.PORT}`),
);
