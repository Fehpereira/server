import { prisma } from '@/database/prisma';
import { allowedMimes } from '@/middlewares/files-handling';
import { AppError } from '@/utils/AppError';
import { ProductType } from '@prisma/client';
import { hash } from 'bcrypt';
import { Request, Response } from 'express';
import z from 'zod';

class EnterprisesController {
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
      address: z.object({
        street: z.string().min(3),
        number: z.coerce.number().positive(),
        city: z.string(),
        state: z.string().min(2),
      }),
    });

    const { name, email, password, address } = bodySchema.parse(request.body);

    const userWhithSameEmail = await prisma.enterprise.findFirst({
      where: {
        email,
      },
    });

    if (userWhithSameEmail) {
      throw new AppError('User already exists');
    }

    const saltRounds = 10;
    const hashedPassword = await hash(password, saltRounds);

    const newUser = await prisma.enterprise.create({
      data: {
        name,
        email,
        password: hashedPassword,
        address: {
          create: {
            ...address,
          },
        },
      },
    });

    const { password: _, ...NewUserWithOutPassword } = newUser;

    return response.json(NewUserWithOutPassword);
  }
  async createProduct(request: Request, response: Response) {
    const bodySchema = z.object({
      name: z.string().min(3).trim(),
      price: z.coerce.number().positive(),
      description: z.string().min(3),
      category: z.enum(ProductType),
    });

    const paramsSchema = z.object({
      enterpriseId: z.uuid().trim(),
    });

    const parsedData = JSON.parse(request.body.data);

    const { name, price, description, category } = bodySchema.parse(parsedData);

    const { enterpriseId } = paramsSchema.parse(request.params);

    const { user, file } = request;

    if (!user || user.id !== enterpriseId) {
      throw new AppError('Unauthorized', 401);
    }
    if (file && !allowedMimes.includes(file.mimetype)) {
      throw new AppError('Invalid image format');
    }

    const newProduct = await prisma.product.create({
      data: {
        name,
        price,
        description,
        category,
        enterpriseId,
        photoUrl: file?.filename ?? null,
      },
      include: {
        enterprise: {
          select: {
            name: true,
          },
        },
      },
    });

    return response.status(201).json(newProduct);
  }
  async index(request: Request, response: Response) {
    const querySchema = z.object({
      name: z.string().optional().default(''),
    });

    const { name } = querySchema.parse(request.query);

    const enterprisesWithQueryName = await prisma.enterprise.findMany({
      where: {
        name: {
          contains: name.trim(),
          mode: 'insensitive',
        },
      },
      include: {
        address: {
          select: {
            city: true,
            street: true,
            number: true,
            state: true,
          },
        },
      },
      omit: {
        password: true,
      },
    });

    return response.json(enterprisesWithQueryName);
  }
  async getById(request: Request, response: Response) {
    const paramsSchema = z.object({
      enterpriseId: z.uuid(),
    });

    const { enterpriseId } = paramsSchema.parse(request.params);

    const enterprise = await prisma.enterprise.findFirst({
      where: {
        id: enterpriseId,
      },
      include: {
        address: {
          select: {
            city: true,
            street: true,
            number: true,
            state: true,
          },
        },
      },
      omit: {
        password: true,
        addressId: true,
        email: true,
        updatedAt: true,
        createdAt: true,
      },
    });

    if (!enterprise) {
      throw new AppError('Enterprise not found', 404);
    }

    return response.json(enterprise);
  }
  async updateOpenStatus(request: Request, response: Response) {
    const paramsSchema = z.object({
      enterpriseId: z.uuid().trim(),
    });
    const bodySchema = z.object({
      isOpen: z.boolean(),
    });

    const { enterpriseId } = paramsSchema.parse(request.params);
    const { isOpen } = bodySchema.parse(request.body);

    const { user } = request;

    if (!user || user.id !== enterpriseId) {
      throw new AppError('Unauthorized', 401);
    }

    await prisma.enterprise.update({
      data: {
        isOpen,
      },
      where: {
        id: enterpriseId,
      },
    });

    return response.json();
  }
  async updateOpeningHours(request: Request, response: Response) {
    const paramsSchema = z.object({
      enterpriseId: z.uuid().trim(),
    });
    const bodySchema = z.object({
      openingHours: z.string().min(1).max(85).trim(),
    });

    const { enterpriseId } = paramsSchema.parse(request.params);
    const { openingHours } = bodySchema.parse(request.body);

    const { user } = request;

    if (!user || user.id !== enterpriseId) {
      throw new AppError('Unauthorized', 401);
    }

    await prisma.enterprise.update({
      data: {
        openingHours,
      },
      where: {
        id: enterpriseId,
      },
    });

    return response.json(openingHours);
  }
  async updateLogo(request: Request, response: Response) {
    const paramsSchema = z.object({
      enterpriseId: z.uuid().trim(),
    });

    const { enterpriseId } = paramsSchema.parse(request.params);

    const { user, file } = request;

    if (!user || user.id !== enterpriseId) {
      throw new AppError('Unauthorized', 401);
    }

    if (!file || !allowedMimes.includes(file.mimetype)) {
      throw new AppError('Invalid image format');
    }

    await prisma.enterprise.update({
      data: {
        logoUrl: file.filename,
      },
      where: {
        id: enterpriseId,
      },
    });

    return response.json(file.filename);
  }
}

export { EnterprisesController };
