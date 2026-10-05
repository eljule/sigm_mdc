import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleRepositoryPort } from '../../domain/ports/role.repository.port';
import { Role } from '../../domain/entities/role.entity';
import { RoleEntity } from '../persistence/entities/role.entity';
import { RoleMapper } from '../persistence/mappers/role.mapper';

@Injectable()
export class TypeOrmRoleRepository implements RoleRepositoryPort {
  constructor(
    @InjectRepository(RoleEntity)
    private readonly ormRepository: Repository<RoleEntity>,
  ) {}

  async findAll(): Promise<Role[]> {
    const entities = await this.ormRepository.find({
      order: { isSystem: 'DESC', name: 'ASC' },
    });
    return entities.map((e) => RoleMapper.toDomain(e));
  }

  async findById(id: string): Promise<Role | null> {
    const entity = await this.ormRepository.findOne({ where: { id } });
    if (!entity) return null;
    return RoleMapper.toDomain(entity);
  }

  async findByCode(code: string): Promise<Role | null> {
    const entity = await this.ormRepository.findOne({ where: { code } });
    if (!entity) return null;
    return RoleMapper.toDomain(entity);
  }

  async save(role: Role): Promise<Role> {
    const orm = RoleMapper.toOrm(role);
    const saved = await this.ormRepository.save(orm);
    return RoleMapper.toDomain(saved);
  }

  async delete(id: string): Promise<boolean> {
    const res = await this.ormRepository.delete(id);
    return (res.affected ?? 0) > 0;
  }

  async count(): Promise<number> {
    return this.ormRepository.count();
  }
}
