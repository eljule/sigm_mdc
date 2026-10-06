import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ModuleRepositoryPort } from '../../domain/ports/module.repository.port';
import { Module } from '../../domain/entities/module.entity';
import { ModuleEntity } from '../persistence/entities/module.entity';
import { ModuleMapper } from '../persistence/mappers/module.mapper';

/**
 * Adaptador de persistencia TypeORM que implementa el puerto del repositorio de dominio.
 */
@Injectable()
export class TypeOrmModuleRepository implements ModuleRepositoryPort {
  constructor(
    @InjectRepository(ModuleEntity)
    private readonly ormRepository: Repository<ModuleEntity>,
  ) {}

  async findAll(): Promise<Module[]> {
    const ormEntities = await this.ormRepository.find({
      order: { order: 'ASC', createdAt: 'ASC' },
    });

    return ormEntities.map((entity) => ModuleMapper.toDomain(entity));
  }

  async findAllActive(): Promise<Module[]> {
    const ormEntities = await this.ormRepository.find({
      where: { isActive: true },
      order: { order: 'ASC', createdAt: 'ASC' },
    });

    return ormEntities.map((entity) => ModuleMapper.toDomain(entity));
  }

  async findById(id: string): Promise<Module | null> {
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (!isUuid) {
      return null;
    }
    const entity = await this.ormRepository.findOne({ where: { id } });
    if (!entity) {
      return null;
    }
    return ModuleMapper.toDomain(entity);
  }

  async findByCode(code: string): Promise<Module | null> {
    const entity = await this.ormRepository.findOne({ where: { code } });
    if (!entity) {
      return null;
    }
    return ModuleMapper.toDomain(entity);
  }

  async save(module: Module): Promise<Module> {
    const ormEntity = ModuleMapper.toOrm(module);
    const saved = await this.ormRepository.save(ormEntity);
    return ModuleMapper.toDomain(saved);
  }

  async saveMany(modules: Module[]): Promise<void> {
    const entities = modules.map((m) => ModuleMapper.toOrm(m));
    await this.ormRepository.save(entities);
  }

  async count(): Promise<number> {
    return this.ormRepository.count();
  }

  async delete(id: string): Promise<void> {
    await this.ormRepository.delete(id);
  }
}
