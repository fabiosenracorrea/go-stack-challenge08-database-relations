import { getRepository, Repository } from 'typeorm';
import { uuid } from 'uuidv4';

import IOrdersRepository from '@modules/orders/repositories/IOrdersRepository';
import ICreateOrderDTO from '@modules/orders/dtos/ICreateOrderDTO';
import Order from '../entities/Order';

class OrdersRepository implements IOrdersRepository {
  private ormRepository: Repository<Order>;

  constructor() {
    this.ormRepository = getRepository(Order);
  }

  public async create({ customer, products }: ICreateOrderDTO): Promise<Order> {
    const uniqueIDProducts = products.map(product => {
      return { ...product, id: uuid() };
    });
    // without this the id was default for product_id and it was causing problems
    // when trying to create multiple orders with the same product

    const order = this.ormRepository.create({
      customer_id: customer.id,
      order_products: uniqueIDProducts,
    });

    await this.ormRepository.save(order);

    return order;
  }

  public async findById(id: string): Promise<Order | undefined> {
    const order = await this.ormRepository.findOne(id);

    return order;
  }
}

export default OrdersRepository;
