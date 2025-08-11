import { prisma } from '@/database/prisma';
import { AppError } from '@/utils/AppError';
import { hash } from 'bcrypt';
import { Request, Response } from 'express';
import z from 'zod';

class ClientsController {
  async create(request: Request, response: Response) {
    const bodySchema = z.object({
      name: z.string().min(3),
      email: z.email(),
      password: z
        .string()
        .min(8, 'A senha deve conter no mínimo 8 caracteres')
        .regex(
          /(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/,
          'A senha deve conter no minímo 1 letra maíuscula, 1 minúscula, 1 número e um caracter especial',
        )
        .trim(),
    });

    const { name, email, password } = bodySchema.parse(request.body);

    const userWhithSameEmail = await prisma.client.findFirst({
      where: {
        email,
      },
    });

    if (userWhithSameEmail) {
      throw new AppError('User already exists');
    }

    const saltRounds = 10;
    const hashedPassword = await hash(password, saltRounds);

    const newUser = await prisma.client.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    const { password: _, ...NewUserWithOutPassword } = newUser;

    return response.json(NewUserWithOutPassword);
  }
}

export { ClientsController };
