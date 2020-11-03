import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import Customer from '../infra/typeorm/entities/Customer';
import ICustomersRepository from '../repositories/ICustomersRepository';

interface IRequest {
  name: string;
  email: string;
}

@injectable()
class CreateCustomerService {
  constructor(
    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ name, email }: IRequest): Promise<Customer> {
    if (!name || !email) {
      throw new AppError('Invalid data provided.');
    }

    const emailAlreadyRegistered = await this.customersRepository.findByEmail(
      email,
    );

    if (emailAlreadyRegistered) {
      throw new AppError('Email already registered.');
    }

    const createdUser = await this.customersRepository.create({
      email,
      name,
    });

    return createdUser;
  }
}

export default CreateCustomerService;
