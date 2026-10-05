import { Role } from '../../../domain/entities/role.entity';
import { RoleEntity } from '../entities/role.entity';

export class RoleMapper {
  static toDomain(orm: RoleEntity): Role {
    return new Role({
      id: orm.id,
      name: orm.name,
      code: orm.code,
      description: orm.description,
      subsystemCode: orm.subsystemCode,
      isSystem: orm.isSystem,
      permissionCodes: orm.permissionCodes || [],
      isActive: orm.isActive,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
    });
  }

  static toOrm(domain: Role): RoleEntity {
    const orm = new RoleEntity();
    if (domain.id) {
      orm.id = domain.id;
    }
    orm.name = domain.name;
    orm.code = domain.code;
    orm.description = domain.description;
    orm.subsystemCode = domain.subsystemCode;
    orm.isSystem = domain.isSystem;
    orm.permissionCodes = domain.permissionCodes;
    orm.isActive = domain.isActive;
    return orm;
  }
}
