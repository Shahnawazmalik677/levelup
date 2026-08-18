import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { healthRouter } from './routes/health';
import { learningPlanRouter } from './routes/learningPlan';
import { videosRouter } from './routes/videos';
import { swapTechniqueRouter } from './routes/swapTechnique';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api', healthRouter);
app.use('/api', learningPlanRouter);
app.use('/api', videosRouter);
app.use('/api', swapTechniqueRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
