import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { OfficeRepositoryPort, OfficeFilters } from '../../domain/ports/office.repository.port';
import { OfficeEntity } from '../../infrastructure/persistence/entities/office.entity';
import { CreateOfficeDto, UpdateOfficeDto } from '../dtos/office.dto';

@Injectable()
export class ManageOfficesUseCase {
  constructor(private readonly officeRepo: OfficeRepositoryPort) {}

  async findAll(filters?: OfficeFilters): Promise<OfficeEntity[]> {
    return this.officeRepo.findAll(filters);
  }

  async findTree(): Promise<OfficeEntity[]> {
    return this.officeRepo.findTree();
  }

  async findSedes(): Promise<string[]> {
    const sedes = await this.officeRepo.findDistinctSedes();
    if (sedes.length === 0) {
      return [
        'PALACIO MUNICIPAL (SEDE PRINCIPAL)',
        'SEDE MAESTRANZA Y SERVICIOS PÚBLICOS',
        'SEDE SEGURIDAD CIUDADANA / BASE SERENAZGO',
        'SEDE MERCADO DE CASTILLA',
        'SEDE PROGRAMAS SOCIALES (DEMUNA / OMAPED / CIAM)',
        'SEDE ADMINISTRACIÓN TRIBUTARIA (RENTAS)',
      ];
    }
    return sedes;
  }

  async findById(id: string): Promise<OfficeEntity> {
    const office = await this.officeRepo.findById(id);
    if (!office) {
      throw new NotFoundException(`Oficina ${id} no encontrada`);
    }
    return office;
  }

  async create(dto: CreateOfficeDto): Promise<OfficeEntity> {
    const existing = await this.officeRepo.findByCode(dto.code);
    if (existing) {
      throw new ConflictException(`Ya existe una dependencia con el código ${dto.code}`);
    }

    let parentId: string | null = dto.parentId || null;
    let parentName: string | null = dto.parentName || null;

    if (dto.parentName && !dto.parentId) {
      const parent = await this.officeRepo.findByName(dto.parentName.trim());
      if (parent) {
        parentId = parent.id;
        parentName = parent.name;
      }
    } else if (dto.parentId && !dto.parentName) {
      const parent = await this.officeRepo.findById(dto.parentId);
      if (parent) {
        parentName = parent.name;
      }
    }

    // Calcular nivel según la cantidad de puntos en el código (01 -> 1, 02.01 -> 2, etc.)
    const calculatedLevel = dto.code.split('.').length;

    return this.officeRepo.create({
      code: dto.code.trim(),
      acronym: dto.acronym.trim().toUpperCase(),
      name: dto.name.trim().toUpperCase(),
      parentName,
      parentId,
      sede: dto.sede?.trim().toUpperCase() || 'PALACIO MUNICIPAL (SEDE PRINCIPAL)',
      level: dto.level || calculatedLevel,
      isActive: dto.isActive !== undefined ? dto.isActive : true,
    });
  }

  async update(id: string, dto: UpdateOfficeDto): Promise<OfficeEntity> {
    const office = await this.findById(id);

    if (dto.code && dto.code !== office.code) {
      const existing = await this.officeRepo.findByCode(dto.code);
      if (existing && existing.id !== id) {
        throw new ConflictException(`Ya existe una dependencia con el código ${dto.code}`);
      }
    }

    let parentId: string | null = dto.parentId !== undefined ? dto.parentId : office.parentId;
    let parentName: string | null = dto.parentName !== undefined ? dto.parentName : office.parentName;

    if (dto.parentName && dto.parentName !== office.parentName && !dto.parentId) {
      const parent = await this.officeRepo.findByName(dto.parentName.trim());
      if (parent) {
        parentId = parent.id;
        parentName = parent.name;
      }
    }

    const calculatedLevel = (dto.code || office.code).split('.').length;

    return this.officeRepo.update(id, {
      ...(dto.code ? { code: dto.code.trim() } : {}),
      ...(dto.acronym ? { acronym: dto.acronym.trim().toUpperCase() } : {}),
      ...(dto.name ? { name: dto.name.trim().toUpperCase() } : {}),
      ...(dto.sede ? { sede: dto.sede.trim().toUpperCase() } : {}),
      ...(dto.level !== undefined ? { level: dto.level } : { level: calculatedLevel }),
      ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      parentId,
      parentName,
    });
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    await this.officeRepo.delete(id);
  }
}
