import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,

    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,

    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const user = await this.customersRepository.findById(customer_id);

    if (!user) {
      throw new AppError('Invalid User.');
    }

    const productsIds = products.map(product => ({
      id: product.id,
    }));

    const toOrderProducts = await this.productsRepository.findAllById(
      productsIds,
    );

    const productsWithPrice = products.map(product => {
      const savedProduct = toOrderProducts.find(pr => pr.id === product.id);

      if (!savedProduct) {
        throw new AppError('Invalid product requested.');
      }

      if (product.quantity > savedProduct.quantity) {
        throw new AppError('Not enough products on storage');
      }

      const { price } = savedProduct;

      return { ...product, price, product_id: product.id };
    });

    await this.productsRepository.updateQuantity(products);

    const order = await this.ordersRepository.create({
      customer: user,
      products: productsWithPrice,
    });

    const orderWithJoin = (await this.ordersRepository.findById(
      order.id,
    )) as Order;

    return orderWithJoin;
  }
}

export default CreateOrderService;
