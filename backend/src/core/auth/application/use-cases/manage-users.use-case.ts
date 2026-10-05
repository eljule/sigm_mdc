import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { UserRepositoryPort } from '../../domain/ports/user.repository.port';
import { User } from '../../domain/entities/user.entity';
import { CreateUserDto, UpdatePermissionsDto } from '../dtos/create-user.dto';
import { UserSummaryDto } from '../dtos/auth-response.dto';

export interface UserDetailDto extends UserSummaryDto {
  personId?: string | null;
  isActive: boolean;
}

@Injectable()
export class ManageUsersUseCase {
  constructor(private readonly userRepository: UserRepositoryPort) {}

  async listAll(): Promise<UserDetailDto[]> {
    const users = await this.userRepository.findAll();
    return users.map((u) => ({
      id: u.id,
      username: u.username,
      fullName: u.fullName,
      email: u.email,
      role: u.role,
      allowedModules: u.allowedModules,
      personId: u.personId,
      isActive: u.isActive,
    }));
  }

  async createUser(dto: CreateUserDto): Promise<UserDetailDto> {
    const existing = await this.userRepository.findByUsername(dto.username.trim());
    if (existing) {
      throw new ConflictException(`El nombre de usuario "${dto.username}" ya está registrado`);
    }

    const newUser = new User({
      id: '',
      username: dto.username.trim(),
      passwordHash: dto.password,
      fullName: dto.fullName.trim(),
      email: dto.email?.trim() || `${dto.username.trim().toLowerCase()}@castilla.gob.pe`,
      role: dto.role,
      allowedModules: dto.allowedModules ?? [],
      isActive: true,
      personId: dto.personId ?? null,
    });

    const saved = await this.userRepository.save(newUser);
    return {
      id: saved.id,
      username: saved.username,
      fullName: saved.fullName,
      email: saved.email,
      role: saved.role,
      allowedModules: saved.allowedModules,
      personId: saved.personId,
      isActive: saved.isActive,
    };
  }

  async updatePermissions(userId: string, dto: UpdatePermissionsDto): Promise<UserDetailDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }

    user.updatePermissions(dto.role, dto.allowedModules);
    const updated = await this.userRepository.save(user);

    return {
      id: updated.id,
      username: updated.username,
      fullName: updated.fullName,
      email: updated.email,
      role: updated.role,
      allowedModules: updated.allowedModules,
      personId: updated.personId,
      isActive: updated.isActive,
    };
  }

  async toggleActive(userId: string): Promise<UserDetailDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }

    const props = user.toObject();
    props.isActive = !props.isActive;
    const updatedUser = new User(props);
    const saved = await this.userRepository.save(updatedUser);

    return {
      id: saved.id,
      username: saved.username,
      fullName: saved.fullName,
      email: saved.email,
      role: saved.role,
      allowedModules: saved.allowedModules,
      personId: saved.personId,
      isActive: saved.isActive,
    };
  }
}
