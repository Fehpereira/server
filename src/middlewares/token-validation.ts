import { env } from '@/env';
import { AppError } from '@/utils/AppError';
import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';
import { UserRole } from './verify-authorization';

interface JwtPayload {
  role: UserRole;
  sub: string;
}

function tokenValidation(
  request: Request,
  _response: Response,
  next: NextFunction,
) {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new AppError('Invalid JWT token!');
    }

    const [_, token] = authHeader.split(' ');

    const { role, sub: id } = verify(token, env.JWT_SECRET) as JwtPayload;

    if (!role || !id) {
      throw new AppError('Invalid JWT token!');
    }

    request.user = {
      id,
      role,
    };

    return next();
  } catch (err) {
    throw new AppError('Invalid JWT token!');
  }
}

export { tokenValidation };
