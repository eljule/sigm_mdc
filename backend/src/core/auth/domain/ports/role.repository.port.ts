import { Role } from '../entities/role.entity';

export abstract class RoleRepositoryPort {
  abstract findAll(): Promise<Role[]>;
  abstract findById(id: string): Promise<Role | null>;
  abstract findByCode(code: string): Promise<Role | null>;
  abstract save(role: Role): Promise<Role>;
  abstract delete(id: string): Promise<boolean>;
  abstract count(): Promise<number>;
}
