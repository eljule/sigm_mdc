import { Injectable, ConflictException } from '@nestjs/common';
import { PermissionRepositoryPort } from '../../domain/ports/permission.repository.port';
import { Permission } from '../../domain/entities/permission.entity';
import { CreatePermissionDto } from '../dtos/manage-roles.dto';

export interface SubsystemPermissionGroup {
  subsystemCode: string;
  subsystemName: string;
  color: string;
  permissions: Permission[];
}

const SUBSYSTEM_INFO: Record<string, { name: string; color: string }> = {
  central_dashboard: { name: 'Dashboard Central y Configuración', color: '#16a34a' },
  transport_licenses: { name: 'Licencias de Transportes', color: '#ea580c' },
  it_inventory: { name: 'Inventario y Gestión TI (ITAM)', color: '#2563eb' },
  helpdesk_support: { name: 'Soporte Técnico y Helpdesk', color: '#7c3aed' },
  GLOBAL: { name: 'Permisos Globales del SIGM', color: '#0f766e' },
};

@Injectable()
export class ManagePermissionsUseCase {
  constructor(private readonly permissionRepository: PermissionRepositoryPort) {}

  async listAll(): Promise<Permission[]> {
    return this.permissionRepository.findAll();
  }

  async listGrouped(): Promise<SubsystemPermissionGroup[]> {
    const all = await this.permissionRepository.findAll();
    const map = new Map<string, Permission[]>();

    for (const p of all) {
      const code = p.subsystemCode;
      if (!map.has(code)) {
        map.set(code, []);
      }
      map.get(code)!.push(p);
    }

    const groups: SubsystemPermissionGroup[] = [];
    for (const [code, permissions] of map.entries()) {
      const meta = SUBSYSTEM_INFO[code] || { name: code, color: '#64748b' };
      groups.push({
        subsystemCode: code,
        subsystemName: meta.name,
        color: meta.color,
        permissions,
      });
    }

    return groups;
  }

  async create(dto: CreatePermissionDto): Promise<Permission> {
    const existing = await this.permissionRepository.findByCode(dto.code.trim());
    if (existing) {
      throw new ConflictException(`Ya existe un permiso con el código "${dto.code}"`);
    }

    const permission = new Permission({
      id: '',
      code: dto.code.trim(),
      name: dto.name.trim(),
      description: dto.description?.trim() || '',
      subsystemCode: dto.subsystemCode,
      category: dto.category?.toUpperCase() || 'GENERAL',
      isActive: true,
    });

    return this.permissionRepository.save(permission);
  }
}
