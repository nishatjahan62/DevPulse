import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
import authRoutes from "./modules/auth/auth.routes"
import issueRoutes  from "./modules/auth/auth.routes"
import { errorHandler } from './middleware/errorHandler';

const app: Application = express();

app.use(cors());
app.use(express.json());

app.get('/', (_req: Request, res: Response) => {
  res.json({ success: true, message: 'DevPulse API is running!' });
});

app.use('/api/auth', authRoutes);
app.use('/api/issus', issueRoutes);


app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use(errorHandler);

export default app;