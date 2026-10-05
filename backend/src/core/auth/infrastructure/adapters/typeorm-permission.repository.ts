import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PermissionRepositoryPort } from '../../domain/ports/permission.repository.port';
import { Permission } from '../../domain/entities/permission.entity';
import { PermissionEntity } from '../persistence/entities/permission.entity';
import { PermissionMapper } from '../persistence/mappers/permission.mapper';

@Injectable()
export class TypeOrmPermissionRepository implements PermissionRepositoryPort {
  constructor(
    @InjectRepository(PermissionEntity)
    private readonly ormRepository: Repository<PermissionEntity>,
  ) {}

  async findAll(): Promise<Permission[]> {
    const entities = await this.ormRepository.find({
      order: { subsystemCode: 'ASC', code: 'ASC' },
    });
    return entities.map((e) => PermissionMapper.toDomain(e));
  }

  async findBySubsystem(subsystemCode: string): Promise<Permission[]> {
    const entities = await this.ormRepository.find({
      where: { subsystemCode },
      order: { code: 'ASC' },
    });
    return entities.map((e) => PermissionMapper.toDomain(e));
  }

  async findByCode(code: string): Promise<Permission | null> {
    const entity = await this.ormRepository.findOne({ where: { code } });
    if (!entity) return null;
    return PermissionMapper.toDomain(entity);
  }

  async save(permission: Permission): Promise<Permission> {
    const orm = PermissionMapper.toOrm(permission);
    const saved = await this.ormRepository.save(orm);
    return PermissionMapper.toDomain(saved);
  }

  async saveMany(permissions: Permission[]): Promise<void> {
    const orms = permissions.map((p) => PermissionMapper.toOrm(p));
    await this.ormRepository.save(orms);
  }

  async count(): Promise<number> {
    return this.ormRepository.count();
  }
}
