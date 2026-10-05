import { User } from '../../../domain/entities/user.entity';
import { UserEntity } from '../entities/user.entity';

export class UserMapper {
  static toDomain(orm: UserEntity): User {
    return new User({
      id: orm.id,
      username: orm.username,
      passwordHash: orm.passwordHash,
      fullName: orm.fullName,
      email: orm.email,
      role: orm.role,
      allowedModules: orm.allowedModules ?? [],
      isActive: orm.isActive,
      personId: orm.personId,
    });
  }

  static toOrm(domain: User): UserEntity {
    const orm = new UserEntity();
    if (domain.id) {
      orm.id = domain.id;
    }
    orm.username = domain.username;
    orm.passwordHash = domain.passwordHash;
    orm.fullName = domain.fullName;
    orm.email = domain.email;
    orm.role = domain.role;
    orm.allowedModules = domain.allowedModules;
    orm.isActive = domain.isActive;
    orm.personId = domain.personId;
    return orm;
  }
}
