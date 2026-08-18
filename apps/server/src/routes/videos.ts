import { Router, Request, Response, NextFunction } from 'express';
import { searchVideos } from '../services/youtube';

export const videosRouter = Router();

videosRouter.get(
  '/videos',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = req.query.query as string;
      const maxResults = parseInt(req.query.maxResults as string) || 5;

      if (!query) {
        res.status(400).json({
          success: false,
          error: 'query parameter is required',
        });
        return;
      }

      const videos = await searchVideos(query, Math.min(maxResults, 10));

      res.json({
        success: true,
        data: { videos },
      });
    } catch (err) {
      next(err);
    }
  }
);
