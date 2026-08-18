import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { healthRouter } from './routes/health';
import { learningPlanRouter } from './routes/learningPlan';
import { videosRouter } from './routes/videos';
import { swapTechniqueRouter } from './routes/swapTechnique';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

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
