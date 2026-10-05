import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OfficeEntity } from '../persistence/entities/office.entity';
import {
  OfficeRepositoryPort,
  OfficeFilters,
} from '../../domain/ports/office.repository.port';

@Injectable()
export class TypeOrmOfficeRepository implements OfficeRepositoryPort {
  constructor(
    @InjectRepository(OfficeEntity)
    private readonly repo: Repository<OfficeEntity>,
  ) {}

  async findAll(filters?: OfficeFilters): Promise<OfficeEntity[]> {
    const qb = this.repo
      .createQueryBuilder('office')
      .leftJoinAndSelect('office.parent', 'parent')
      .orderBy('office.code', 'ASC');

    if (filters?.search) {
      const search = `%${filters.search.toLowerCase()}%`;
      qb.andWhere(
        '(LOWER(office.name) LIKE :search OR LOWER(office.code) LIKE :search OR LOWER(office.acronym) LIKE :search)',
        { search },
      );
    }

    if (filters?.sede) {
      qb.andWhere('office.sede = :sede', { sede: filters.sede });
    }

    if (filters?.level !== undefined) {
      qb.andWhere('office.level = :level', { level: filters.level });
    }

    if (filters?.parentName) {
      qb.andWhere('office.parentName = :parentName', {
        parentName: filters.parentName,
      });
    }

    if (filters?.isActive !== undefined) {
      qb.andWhere('office.isActive = :isActive', {
        isActive: filters.isActive,
      });
    }

    return qb.getMany();
  }

  async findById(id: string): Promise<OfficeEntity | null> {
    return this.repo.findOne({
      where: { id },
      relations: ['parent', 'children'],
    });
  }

  async findByCode(code: string): Promise<OfficeEntity | null> {
    return this.repo.findOne({
      where: { code },
      relations: ['parent', 'children'],
    });
  }

  async findByName(name: string): Promise<OfficeEntity | null> {
    return this.repo.findOne({
      where: { name },
    });
  }

  async findTree(): Promise<OfficeEntity[]> {
    // Return all root offices (parentId is null) with all nested children
    return this.repo.find({
      where: { parentId: null as any },
      relations: [
        'children',
        'children.children',
        'children.children.children',
      ],
      order: {
        code: 'ASC',
      },
    });
  }

  async findDistinctSedes(): Promise<string[]> {
    const raw = await this.repo
      .createQueryBuilder('office')
      .select('DISTINCT office.sede', 'sede')
      .where('office.sede IS NOT NULL')
      .orderBy('office.sede', 'ASC')
      .getRawMany();

    return raw.map((r) => r.sede);
  }

  async create(data: Partial<OfficeEntity>): Promise<OfficeEntity> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async update(id: string, data: Partial<OfficeEntity>): Promise<OfficeEntity> {
    const office = await this.repo.findOne({ where: { id } });
    if (!office) {
      throw new NotFoundException(`Oficina con ID ${id} no encontrada`);
    }
    Object.assign(office, data);
    return this.repo.save(office);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  async count(): Promise<number> {
    return this.repo.count();
  }
}
