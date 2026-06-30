import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { IUserRepository, NewUser } from '../../domain/user.repository';
import { User } from '../../domain/user.entity';
import { UserOrmEntity } from './user.orm-entity';
import { UserMapper } from './user.mapper';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly ormRepository: Repository<UserOrmEntity>,
  ) {}

  async findById(id: string): Promise<User | null> {
    const row = await this.ormRepository.findOne({ where: { id } });
    return row ? UserMapper.toDomain(row) : null;
  }

  async findByEmail(
    barbershopId: string | null,
    email: string,
  ): Promise<User | null> {
    const row = await this.ormRepository.findOne({
      where: {
        email,
        barbershopId: barbershopId ?? IsNull(),
      },
    });
    return row ? UserMapper.toDomain(row) : null;
  }

  async findAllByTenant(barbershopId: string): Promise<User[]> {
    const rows = await this.ormRepository.find({ where: { barbershopId } });
    return rows.map(UserMapper.toDomain);
  }

  async create(data: NewUser): Promise<User> {
    const created = this.ormRepository.create({
      barbershopId: data.barbershopId,
      name: data.name,
      email: data.email,
      passwordHash: data.passwordHash,
      role: data.role,
    });
    const saved = await this.ormRepository.save(created);
    return UserMapper.toDomain(saved);
  }

  async save(user: User): Promise<User> {
    const saved = await this.ormRepository.save(
      UserMapper.toPersistence(user),
    );
    return UserMapper.toDomain(saved);
  }
}
