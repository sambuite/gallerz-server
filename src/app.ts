import express from 'express';
import { router } from './routes';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';

import swaggerDocs from '@config/swagger.json';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use(router);

export { app };
