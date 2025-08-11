import { AppError } from '@/utils/AppError';
import { Request, Response, NextFunction } from 'express';

export type UserRole = 'enterprise' | 'client';

function verifyAuthorization(role: UserRole[]) {
  return (request: Request, _response: Response, next: NextFunction) => {
    const { user } = request;

    if (!user) {
      throw new AppError('Unauthorized', 401);
    }

    if (!role.includes(user.role)) {
      throw new AppError('Unauthorized', 401);
    }

    return next();
  };
}

export { verifyAuthorization };
