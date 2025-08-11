import { prisma } from '@/database/prisma';
import { OrderStatus, Prisma } from '@prisma/client';
import { AppError } from '@/utils/AppError';
import { Request, Response } from 'express';
import z, { string } from 'zod/v4';

class OrdersController {
  async create(request: Request, response: Response) {
    const bodySchema = z.object({
      enterpriseId: z.uuid(),
      items: z.array(
        z.object({
          productId: z.number().positive().int(),
          quantity: z.number().positive().int(),
        }),
      ),
    });

    const { enterpriseId, items } = bodySchema.parse(request.body);
    const { user } = request;

    if (!user) {
      throw new AppError('Unauthorized', 401);
    }

    if (items.length <= 0) {
      throw new AppError('You must add at least one product');
    }

    try {
      await prisma.$transaction(async (tx) => {
        const productsMap = new Map<number, Prisma.Decimal>();

        for (const item of items) {
          const product = await tx.product.findFirst({
            where: {
              id: item.productId,
              enterpriseId,
            },
          });

          if (!product) {
            throw new AppError(`Product ID ${item.productId} not found.`);
          }

          productsMap.set(item.productId, product.price);
        }

        let order = await tx.order.findFirst({
          where: {
            status: 'created',
            enterpriseId,
            clientId: user.id,
          },
        });

        if (!order) {
          order = await tx.order.create({
            data: {
              total: 0,
              enterpriseId,
              clientId: user.id,
            },
          });
        }

        let total = new Prisma.Decimal(0);

        // Cria todos os orderProducts e acumula o total
        for (const item of items) {
          const productPrice = productsMap.get(item.productId)!;

          await tx.orderProduct.create({
            data: {
              orderId: order.id,
              clientId: user.id,
              enterpriseId,
              productId: item.productId,
              quantity: item.quantity,
            },
          });

          total = total.add(productPrice.mul(item.quantity));
        }

        // Atualiza o total do pedido
        const orderCompleted = await tx.order.update({
          where: {
            id: order.id,
          },
          data: {
            total: order.total.add(total),
          },
          include: {
            ordersProducts: {
              select: {
                product: {
                  select: {
                    name: true,
                    price: true,
                  },
                },
              },
            },
          },
        });

        return response.json(orderCompleted);
      });
    } catch (error) {
      return response.status(500).json({ message: error });
    }
  }

  async getByClientId(request: Request, response: Response) {
    const paramsSchema = z.object({
      clientId: z.uuid(),
    });
    const querySchema = z.object({
      page: z.coerce.number().positive().optional().default(1),
      limit: z.coerce.number().positive().optional().default(10),
    });

    const { clientId } = paramsSchema.parse(request.params);
    const { page, limit } = querySchema.parse(request.query);

    const MAX_LIMIT = 50;
    const safeLimit = Math.min(limit, MAX_LIMIT);
    const offset = (page - 1) * safeLimit;

    if (limit > MAX_LIMIT) {
      throw new AppError('Limit reached, maximum of 50');
    }

    const { user } = request;

    if (!user) {
      throw new AppError('Unauthorized', 401);
    }

    if (user.role === 'client' && user.id !== clientId) {
      throw new AppError('Unauthorized', 401);
    }

    const totalCount = await prisma.order.count({
      where: {
        clientId,
      },
    });

    const totalPages = Math.ceil(totalCount / safeLimit);

    const orders = await prisma.order.findMany({
      skip: offset,
      take: safeLimit,
      where: {
        clientId,
      },
      include: {
        client: {
          select: {
            name: true,
          },
        },
        ordersProducts: {
          select: {
            quantity: true,
            product: {
              select: {
                name: true,
                price: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const formattedOrders = orders.map((order) => {
      const { ordersProducts, client, ...rest } = order;
      return {
        ...rest,
        client: client.name,
        items: ordersProducts.map((item) => {
          return {
            name: item.product.name,
            price: item.product.price,
            quantity: item.quantity,
          };
        }),
      };
    });

    if (user.role === 'client' && user.id === clientId) {
      return response.json({
        orders: formattedOrders,
        pagination: {
          currentPage: page,
          limit: safeLimit,
          totalPages,
        },
      });
    }

    if (user.role === 'enterprise') {
      const ordersOfUniqueEnterprise = formattedOrders.filter(
        (order) => order.enterpriseId === user.id,
      );

      return response.json({
        orders: ordersOfUniqueEnterprise,
        pagination: {
          currentPage: page,
          limit: safeLimit,
        },
      });
    }
  }

  async getByEnterpriseId(request: Request, response: Response) {
    const paramsSchema = z.object({
      enterpriseId: z.uuid(),
    });
    const querySchema = z.object({
      page: z.coerce.number().positive().optional().default(1),
      limit: z.coerce.number().positive().optional().default(10),
    });

    const { enterpriseId } = paramsSchema.parse(request.params);

    const { page, limit } = querySchema.parse(request.query);
    const MAX_LIMIT = 50;
    const safeLimit = Math.min(limit, MAX_LIMIT);
    const offset = (page - 1) * safeLimit;

    if (limit > MAX_LIMIT) {
      throw new AppError('Limit reached, maximum of 50');
    }

    const { user } = request;

    if (!user || user.role !== 'enterprise' || user.id !== enterpriseId) {
      throw new AppError('Unauthorized', 401);
    }

    const totalCount = await prisma.order.count({
      where: {
        enterpriseId,
      },
    });

    const totalPages = Math.ceil(totalCount / safeLimit);

    const orders = await prisma.order.findMany({
      skip: offset,
      take: safeLimit,
      where: {
        enterpriseId,
      },
      include: {
        client: {
          select: {
            name: true,
          },
        },
        ordersProducts: {
          select: {
            quantity: true,
            product: {
              select: {
                name: true,
                price: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const formattedOrders = orders.map((order) => {
      const { ordersProducts, client, ...rest } = order;
      return {
        ...rest,
        client: client.name,
        items: ordersProducts.map((item) => {
          return {
            name: item.product.name,
            price: item.product.price,
            quantity: item.quantity,
          };
        }),
      };
    });

    return response.json({
      orders: formattedOrders,
      pagination: {
        currentPage: page,
        totalPages,
        limit: safeLimit,
      },
    });
  }

  async update(request: Request, response: Response) {
    const bodySchema = z.object({
      status: z.enum(OrderStatus),
    });

    const paramsSchema = z.object({
      enterpriseId: z.uuid(),
      orderId: z.uuid(),
    });

    const { status } = bodySchema.parse(request.body);
    const { enterpriseId, orderId } = paramsSchema.parse(request.params);

    const { user } = request;

    if (!user || user.id !== enterpriseId) {
      throw new AppError('Unauthorized', 401);
    }

    if (status === 'created') {
      throw new AppError(
        'You cannot open an order that has already been opened or closed.',
      );
    }

    const orderToUpdate = await prisma.order.findFirst({
      where: {
        id: orderId,
        enterpriseId: enterpriseId,
      },
    });

    if (!orderToUpdate) {
      throw new AppError('This order does not exist', 404);
    }

    if (orderToUpdate.status === status) {
      throw new AppError('The status is already this');
    }

    if (orderToUpdate.status === 'closed') {
      throw new AppError('It is not possible modify a closed order');
    }

    const orderUpdated = await prisma.order.update({
      where: {
        id: orderId,
        enterpriseId,
      },
      data: {
        status,
      },
    });

    return response.json(orderUpdated);
  }
}

export { OrdersController };
