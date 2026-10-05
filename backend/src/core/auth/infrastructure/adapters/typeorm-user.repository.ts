import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRepositoryPort } from '../../domain/ports/user.repository.port';
import { User } from '../../domain/entities/user.entity';
import { UserEntity } from '../persistence/entities/user.entity';
import { UserMapper } from '../persistence/mappers/user.mapper';

@Injectable()
export class TypeOrmUserRepository implements UserRepositoryPort {
  constructor(
    @InjectRepository(UserEntity)
    private readonly ormRepository: Repository<UserEntity>,
  ) {}

  async findAll(): Promise<User[]> {
    const entities = await this.ormRepository.find({
      order: { createdAt: 'ASC' },
    });
    return entities.map((e) => UserMapper.toDomain(e));
  }

  async findByUsername(username: string): Promise<User | null> {
    const entity = await this.ormRepository.findOne({
      where: { username },
    });
    if (!entity) return null;
    return UserMapper.toDomain(entity);
  }

  async findById(id: string): Promise<User | null> {
    const entity = await this.ormRepository.findOne({
      where: { id },
    });
    if (!entity) return null;
    return UserMapper.toDomain(entity);
  }

  async save(user: User): Promise<User> {
    const orm = UserMapper.toOrm(user);
    const saved = await this.ormRepository.save(orm);
    return UserMapper.toDomain(saved);
  }

  async delete(id: string): Promise<boolean> {
    const res = await this.ormRepository.delete(id);
    return (res.affected ?? 0) > 0;
  }

  async count(): Promise<number> {
    return this.ormRepository.count();
  }
}
