import { Module } from '../../../domain/entities/module.entity';
import { ModuleEntity } from '../entities/module.entity';

/**
 * Mapper para transformar entre la entidad pura de Dominio y la entidad ORM de persistencia.
 */
export class ModuleMapper {
  static toDomain(ormEntity: ModuleEntity): Module {
    return new Module({
      id: ormEntity.id,
      code: ormEntity.code,
      name: ormEntity.name,
      description: ormEntity.description,
      iconUrl: ormEntity.iconUrl,
      route: ormEntity.route,
      accentColor: ormEntity.accentColor,
      order: ormEntity.order,
      isActive: ormEntity.isActive,
      requiresAuth: ormEntity.requiresAuth,
      secondaryAction: ormEntity.secondaryAction
        ? {
            label: ormEntity.secondaryAction.label,
            route: ormEntity.secondaryAction.route,
            variant: ormEntity.secondaryAction.variant,
          }
        : null,
      isUnderMaintenance: ormEntity.isUnderMaintenance ?? false,
      maintenanceMessage: ormEntity.maintenanceMessage ?? null,
      estimatedRecoveryTime: ormEntity.estimatedRecoveryTime ?? null,
    });
  }

  static toOrm(domainEntity: Module): ModuleEntity {
    const orm = new ModuleEntity();
    if (domainEntity.id) {
      orm.id = domainEntity.id;
    }
    orm.code = domainEntity.code;
    orm.name = domainEntity.name;
    orm.description = domainEntity.description;
    orm.iconUrl = domainEntity.iconUrl;
    orm.route = domainEntity.route;
    orm.accentColor = domainEntity.accentColor;
    orm.order = domainEntity.order;
    orm.isActive = domainEntity.isActive;
    orm.requiresAuth = domainEntity.requiresAuth;
    orm.secondaryAction = domainEntity.secondaryAction
      ? {
          label: domainEntity.secondaryAction.label,
          route: domainEntity.secondaryAction.route,
          variant: domainEntity.secondaryAction.variant,
        }
      : null;
    orm.isUnderMaintenance = domainEntity.isUnderMaintenance;
    orm.maintenanceMessage = domainEntity.maintenanceMessage;
    orm.estimatedRecoveryTime = domainEntity.estimatedRecoveryTime;
    return orm;
  }
}
