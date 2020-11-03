import { getRepository, Repository } from 'typeorm';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICreateProductDTO from '@modules/products/dtos/ICreateProductDTO';
import IUpdateProductsQuantityDTO from '@modules/products/dtos/IUpdateProductsQuantityDTO';
import Product from '../entities/Product';

interface IFindProducts {
  id: string;
}

class ProductsRepository implements IProductsRepository {
  private ormRepository: Repository<Product>;

  constructor() {
    this.ormRepository = getRepository(Product);
  }

  public async create({
    name,
    price,
    quantity,
  }: ICreateProductDTO): Promise<Product> {
    const product = this.ormRepository.create({
      name,
      price,
      quantity,
    });

    await this.ormRepository.save(product);

    return product;
  }

  public async findByName(name: string): Promise<Product | undefined> {
    const findProduct = await this.ormRepository.findOne({
      where: {
        name,
      },
    });

    return findProduct;
  }

  public async findAllById(products: IFindProducts[]): Promise<Product[]> {
    const idArray = products.map(product => product.id);

    const foundProducts = await this.ormRepository.findByIds(idArray);

    return foundProducts;
  }

  public async updateQuantity(
    products: IUpdateProductsQuantityDTO[],
  ): Promise<Product[]> {
    const updatedProducts = await Promise.all(
      products.map(async ({ id, quantity }) => {
        const toUpdateProduct = (await this.ormRepository.findOne(
          id,
        )) as Product;

        const updatedQuantity = toUpdateProduct.quantity - quantity;

        const updatedProduct = {
          ...toUpdateProduct,
          quantity: updatedQuantity,
        };

        await this.ormRepository.save(updatedProduct);

        return updatedProduct;
      }),
    );

    return updatedProducts;
  }
}

export default ProductsRepository;
