import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { ModuleRepositoryPort } from '../../domain/ports/module.repository.port';
import { Module } from '../../domain/entities/module.entity';
import { ModuleResponseDto } from '../dtos/module-response.dto';
import { CreateModuleDto } from '../dtos/create-module.dto';
import { UpdateModuleDto } from '../dtos/update-module.dto';
import { SetMaintenanceDto } from '../dtos/set-maintenance.dto';

@Injectable()
export class ManageModulesUseCase {
  constructor(private readonly moduleRepository: ModuleRepositoryPort) {}

  async findAll(): Promise<ModuleResponseDto[]> {
    const modules = await this.moduleRepository.findAll();
    return modules.map((m) => ModuleResponseDto.fromDomain(m));
  }

  async findByIdOrCode(idOrCode: string): Promise<ModuleResponseDto> {
    let module = await this.moduleRepository.findById(idOrCode);
    if (!module) {
      module = await this.moduleRepository.findByCode(idOrCode);
    }

    if (!module) {
      throw new NotFoundException(`El subsistema con identificador "${idOrCode}" no fue encontrado`);
    }

    return ModuleResponseDto.fromDomain(module);
  }

  async create(dto: CreateModuleDto): Promise<ModuleResponseDto> {
    const existing = await this.moduleRepository.findByCode(dto.code);
    if (existing) {
      throw new ConflictException(
        `Ya existe un subsistema registrado con el código "${dto.code}"`,
      );
    }

    const currentCount = await this.moduleRepository.count();

    const newModule = new Module({
      code: dto.code.trim().toLowerCase(),
      name: dto.name.trim(),
      description: dto.description.trim(),
      iconUrl: dto.iconUrl.trim(),
      route: dto.route.trim(),
      accentColor: dto.accentColor?.trim() || '#16a34a',
      order: dto.order !== undefined ? dto.order : currentCount + 1,
      isActive: dto.isActive !== undefined ? dto.isActive : true,
      requiresAuth: dto.requiresAuth !== undefined ? dto.requiresAuth : true,
      secondaryAction: dto.secondaryAction || null,
      isUnderMaintenance: dto.isUnderMaintenance ?? false,
      maintenanceMessage: dto.maintenanceMessage || null,
      estimatedRecoveryTime: dto.estimatedRecoveryTime || null,
    });

    const saved = await this.moduleRepository.save(newModule);
    return ModuleResponseDto.fromDomain(saved);
  }

  async update(id: string, dto: UpdateModuleDto): Promise<ModuleResponseDto> {
    let module = await this.moduleRepository.findById(id);
    if (!module) {
      module = await this.moduleRepository.findByCode(id);
    }

    if (!module) {
      throw new NotFoundException(`El subsistema con ID "${id}" no existe`);
    }

    module.updateDetails({
      name: dto.name?.trim(),
      description: dto.description?.trim(),
      iconUrl: dto.iconUrl?.trim(),
      route: dto.route?.trim(),
      accentColor: dto.accentColor?.trim(),
      order: dto.order,
      isActive: dto.isActive,
      requiresAuth: dto.requiresAuth,
      secondaryAction: dto.secondaryAction,
      isUnderMaintenance: dto.isUnderMaintenance,
      maintenanceMessage: dto.maintenanceMessage,
      estimatedRecoveryTime: dto.estimatedRecoveryTime,
    });

    const saved = await this.moduleRepository.save(module);
    return ModuleResponseDto.fromDomain(saved);
  }

  async setMaintenance(id: string, dto: SetMaintenanceDto): Promise<ModuleResponseDto> {
    let module = await this.moduleRepository.findById(id);
    if (!module) {
      module = await this.moduleRepository.findByCode(id);
    }

    if (!module) {
      throw new NotFoundException(`El subsistema con ID "${id}" no existe`);
    }

    module.setMaintenance(
      dto.isUnderMaintenance,
      dto.maintenanceMessage,
      dto.estimatedRecoveryTime,
    );

    const saved = await this.moduleRepository.save(module);
    return ModuleResponseDto.fromDomain(saved);
  }
}
