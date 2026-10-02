import { Module, SecondaryAction } from '../../domain/entities/module.entity';

export class ModuleResponseDto {
  id!: string;
  code!: string;
  name!: string;
  description!: string;
  iconUrl!: string;
  route!: string;
  accentColor!: string;
  order!: number;
  isActive!: boolean;
  requiresAuth!: boolean;
  secondaryAction!: SecondaryAction | null;

  static fromDomain(entity: Module): ModuleResponseDto {
    const dto = new ModuleResponseDto();
    dto.id = entity.id;
    dto.code = entity.code;
    dto.name = entity.name;
    dto.description = entity.description;
    dto.iconUrl = entity.iconUrl;
    dto.route = entity.route;
    dto.accentColor = entity.accentColor;
    dto.order = entity.order;
    dto.isActive = entity.isActive;
    dto.requiresAuth = entity.requiresAuth;
    dto.secondaryAction = entity.secondaryAction;
    return dto;
  }
}
