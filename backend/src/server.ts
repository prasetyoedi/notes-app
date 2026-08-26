import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from '../swagger-output.json'; 

import authRoutes from './routes/auth';
import tagRoutes from './routes/tags';
import noteRoutes from './routes/notes';
import { errorHandler } from './middlewares/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

// Swagger docs
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'Success',
    message: 'Server is healthy',
    data: { timestamp: new Date().toISOString() }
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/notes', noteRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'Error',
    message: 'Endpoint tidak ditemukan'
  });
});

// Global error handler
app.use(errorHandler);

// Jalankan server hanya jika bukan di Vercel (production)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📚 Swagger docs: http://localhost:${PORT}/api/docs`);
  });
}

export default app;