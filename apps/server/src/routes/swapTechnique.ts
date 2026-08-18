import { Router, Request, Response, NextFunction } from 'express';
import { generateSwapTechnique } from '../services/gemini';
import { SwapTechniqueRequest } from '../types';

export const swapTechniqueRouter = Router();

swapTechniqueRouter.post(
  '/swap-technique',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { hobby, level, currentTechnique, existingTechniques, reason } =
        req.body as SwapTechniqueRequest;

      if (!hobby || !level || !currentTechnique || !existingTechniques) {
        res.status(400).json({
          success: false,
          error: 'hobby, level, currentTechnique, and existingTechniques are required',
        });
        return;
      }

      const technique = await generateSwapTechnique(
        hobby,
        level,
        currentTechnique,
        existingTechniques,
        reason
      );

      res.json({
        success: true,
        data: { technique },
      });
    } catch (err) {
      next(err);
    }
  }
);
