import { Router, Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { generateLearningPlan } from '../services/gemini';
import { GeneratePlanRequest } from '../types';

export const learningPlanRouter = Router();

learningPlanRouter.post(
  '/learning-plan',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { hobby, level, preferences } = req.body as GeneratePlanRequest;

      if (!hobby || !level) {
        res.status(400).json({
          success: false,
          error: 'hobby and level are required',
        });
        return;
      }

      const validLevels = ['curious', 'beginner', 'intermediate'];
      if (!validLevels.includes(level)) {
        res.status(400).json({
          success: false,
          error: `level must be one of: ${validLevels.join(', ')}`,
        });
        return;
      }

      const techniques = await generateLearningPlan(hobby, level, preferences);

      res.json({
        success: true,
        data: {
          id: uuidv4(),
          hobby,
          level,
          techniques,
          createdAt: new Date().toISOString(),
        },
      });
    } catch (err) {
      next(err);
    }
  }
);
