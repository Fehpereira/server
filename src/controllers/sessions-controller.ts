import { Request, Response } from 'express';
import z from 'zod';
import { compare } from 'bcrypt';
import { prisma } from '@/database/prisma';
import { AppError } from '@/utils/AppError';
import { sign } from 'jsonwebtoken';
import { env } from '@/env';

class SessionsController {
  async clientLogin(request: Request, response: Response) {
    const bodySchema = z.object({
      email: z.email(),
      password: z.string().min(8),
    });

    const { email, password } = bodySchema.parse(request.body);

    const userToLogin = await prisma.client.findFirst({
      where: {
        email,
      },
    });

    if (!userToLogin) {
      throw new AppError('Email/password is invalid!');
    }

    const passwordMatched = await compare(password, userToLogin.password);

    if (!passwordMatched) {
      throw new AppError('Email/password is invalid!');
    }

    const token = sign({ role: userToLogin.role }, env.JWT_SECRET, {
      subject: userToLogin.id,
      expiresIn: '1d',
    });

    const { password: _, ...userToLoginWithOutPassword } = userToLogin;

    return response.json({ token, user: userToLoginWithOutPassword });
  }

  async enterpriseLogin(request: Request, response: Response) {
    const bodySchema = z.object({
      email: z.email(),
      password: z.string().min(8),
    });

    const { email, password } = bodySchema.parse(request.body);

    const userToLogin = await prisma.enterprise.findFirst({
      where: {
        email,
      },
    });

    if (!userToLogin) {
      throw new AppError('Email/password is invalid!');
    }

    const passwordMatched = await compare(password, userToLogin.password);

    if (!passwordMatched) {
      throw new AppError('Email/password is invalid!');
    }

    const token = sign({ role: userToLogin.role }, env.JWT_SECRET, {
      subject: userToLogin.id,
      expiresIn: '1d',
    });

    const { password: _, ...userToLoginWithOutPassword } = userToLogin;

    return response.json({ token, user: userToLoginWithOutPassword });
  }
}
export { SessionsController };
