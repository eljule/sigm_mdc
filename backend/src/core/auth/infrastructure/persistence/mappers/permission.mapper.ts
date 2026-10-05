import { Permission } from '../../../domain/entities/permission.entity';
import { PermissionEntity } from '../entities/permission.entity';

export class PermissionMapper {
  static toDomain(orm: PermissionEntity): Permission {
    return new Permission({
      id: orm.id,
      code: orm.code,
      name: orm.name,
      description: orm.description,
      subsystemCode: orm.subsystemCode,
      category: orm.category,
      isActive: orm.isActive,
    });
  }

  static toOrm(domain: Permission): PermissionEntity {
    const orm = new PermissionEntity();
    if (domain.id) {
      orm.id = domain.id;
    }
    orm.code = domain.code;
    orm.name = domain.name;
    orm.description = domain.description;
    orm.subsystemCode = domain.subsystemCode;
    orm.category = domain.category;
    orm.isActive = domain.isActive;
    return orm;
  }
}
