import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import receiptsRoutes from './routes/receipts';
import resistedRoutes from './routes/resisted';
import waitingListRoutes from './routes/waitingList';
import dashboardRoutes from './routes/dashboard';
import coachRoutes from './routes/coach';
import profileRoutes from './routes/profile';

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.use('/api/auth', authRoutes);
app.use('/api/receipts', receiptsRoutes);
app.use('/api/resisted', resistedRoutes);
app.use('/api/waiting-list', waitingListRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/coach', coachRoutes);
app.use('/api/profile', profileRoutes);

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = parseInt(process.env.PORT || '3001');
app.listen(PORT, () => console.log(`ImpulseGuard backend running on port ${PORT}`));

export default app;
