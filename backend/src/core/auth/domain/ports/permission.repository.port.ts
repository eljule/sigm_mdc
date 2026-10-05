import { Permission } from '../entities/permission.entity';

export abstract class PermissionRepositoryPort {
  abstract findAll(): Promise<Permission[]>;
  abstract findBySubsystem(subsystemCode: string): Promise<Permission[]>;
  abstract findByCode(code: string): Promise<Permission | null>;
  abstract save(permission: Permission): Promise<Permission>;
  abstract saveMany(permissions: Permission[]): Promise<void>;
  abstract count(): Promise<number>;
}
