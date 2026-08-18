import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error(`[Error] ${err.message}`);

  if (err.message.includes('API key')) {
    res.status(503).json({
      success: false,
      error: 'Service configuration error',
    });
    return;
  }

  if (err.message.includes('quota') || err.message.includes('rate limit')) {
    res.status(429).json({
      success: false,
      error: 'Rate limit exceeded, please try again later',
    });
    return;
  }

  res.status(500).json({
    success: false,
    error: 'Something went wrong, please try again',
  });
}
