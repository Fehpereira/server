import { prisma } from '@/database/prisma';
import { allowedMimes } from '@/middlewares/files-handling';
import { AppError } from '@/utils/AppError';
import { Request, Response } from 'express';
import z from 'zod';

class ProductsController {
  async getByEnterpriseId(request: Request, response: Response) {
    const paramsSchema = z.object({
      enterpriseId: z.uuid(),
    });

    const { enterpriseId } = paramsSchema.parse(request.params);

    const products = await prisma.product.findMany({
      where: {
        enterpriseId,
        isActive: true,
      },
      orderBy: { id: 'asc' },
    });

    return response.json(products);
  }

  async getById(request: Request, response: Response) {
    const paramsSchema = z.object({
      enterpriseId: z.uuid(),
      productId: z.coerce.number(),
    });

    const { enterpriseId, productId } = paramsSchema.parse(request.params);

    const { user } = request;

    if (!user || enterpriseId !== user.id) {
      throw new AppError('Unauthorized', 401);
    }

    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        enterpriseId,
        isActive: true,
      },
    });

    return response.json(product);
  }

  async update(request: Request, response: Response) {
    const paramsSchema = z.object({
      enterpriseId: z.uuid(),
      productId: z.coerce.number().positive(),
    });

    const bodySchema = z.object({
      name: z.string().min(3).optional(),
      price: z.coerce.number().positive().optional(),
      description: z.string().min(3).optional(),
    });

    const { enterpriseId, productId } = paramsSchema.parse(request.params);

    const parsedData = JSON.parse(request.body.data);
    const { name, price, description } = bodySchema.parse(parsedData);

    const { user, file } = request;

    if (!user || user.id !== enterpriseId) {
      throw new AppError('Unauthorized', 401);
    }

    if (file && !allowedMimes.includes(file.mimetype)) {
      throw new AppError('Invalid image format');
    }

    try {
      const existingProduct = await prisma.product.findUnique({
        where: {
          id: productId,
          enterpriseId,
          isActive: true,
        },
      });

      if (!existingProduct) {
        throw new AppError('This product not exists!');
      }

      const productToUpdate = await prisma.product.update({
        where: {
          id: productId,
          enterpriseId,
          isActive: true,
        },
        data: {
          name,
          price,
          description,
          photoUrl: file?.filename ?? existingProduct.photoUrl,
        },
      });

      return response.json(productToUpdate);
    } catch (error) {
      throw new AppError('Incorrect data or this product does not exist!');
    }
  }

  async delete(request: Request, response: Response) {
    const paramsSchema = z.object({
      enterpriseId: z.uuid(),
      productId: z.coerce.number().positive().int(),
    });

    const { enterpriseId, productId } = paramsSchema.parse(request.params);

    const { user } = request;

    if (!user || user.id !== enterpriseId) {
      throw new AppError('Unauthorized', 401);
    }

    try {
      const productToDelete = await prisma.product.update({
        data: {
          isActive: false,
        },
        where: {
          id: productId,
          enterpriseId,
        },
      });

      if (!productToDelete) {
        throw new AppError('This product not exists!');
      }

      return response.json();
    } catch (error) {
      throw new AppError('Incorret Datas or this product not exists!');
    }
  }
}

export { ProductsController };
