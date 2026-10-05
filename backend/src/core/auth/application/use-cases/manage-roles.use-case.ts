import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { RoleRepositoryPort } from '../../domain/ports/role.repository.port';
import { Role } from '../../domain/entities/role.entity';
import { CreateRoleDto, UpdateRoleDto, AssignPermissionsDto } from '../dtos/manage-roles.dto';

@Injectable()
export class ManageRolesUseCase {
  constructor(private readonly roleRepository: RoleRepositoryPort) {}

  async listAll(): Promise<Role[]> {
    return this.roleRepository.findAll();
  }

  async findById(id: string): Promise<Role> {
    const role = await this.roleRepository.findById(id);
    if (!role) {
      throw new NotFoundException(`Rol con ID ${id} no encontrado`);
    }
    return role;
  }

  async createRole(dto: CreateRoleDto): Promise<Role> {
    const existing = await this.roleRepository.findByCode(dto.code.trim().toLowerCase());
    if (existing) {
      throw new ConflictException(`Ya existe un rol con el código "${dto.code}"`);
    }

    const newRole = new Role({
      id: '',
      name: dto.name.trim(),
      code: dto.code.trim().toLowerCase(),
      description: dto.description?.trim() || '',
      subsystemCode: dto.subsystemCode,
      isSystem: false,
      permissionCodes: dto.permissionCodes || [],
      isActive: true,
    });

    return this.roleRepository.save(newRole);
  }

  async updateRole(id: string, dto: UpdateRoleDto): Promise<Role> {
    const role = await this.findById(id);
    role.updateDetails(dto.name.trim(), dto.description?.trim() || '', dto.subsystemCode);

    if (dto.permissionCodes !== undefined) {
      role.assignPermissions(dto.permissionCodes);
    }

    return this.roleRepository.save(role);
  }

  async assignPermissions(id: string, dto: AssignPermissionsDto): Promise<Role> {
    const role = await this.findById(id);
    role.assignPermissions(dto.permissionCodes);
    return this.roleRepository.save(role);
  }

  async deleteRole(id: string): Promise<boolean> {
    const role = await this.findById(id);
    if (role.isSystem) {
      throw new ForbiddenException('No está permitido eliminar roles protegidos del sistema');
    }
    return this.roleRepository.delete(id);
  }
}
