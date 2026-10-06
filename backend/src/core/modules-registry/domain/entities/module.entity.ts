export type ActionVariant = 'outline' | 'ghost' | 'solid';

export interface SecondaryAction {
  label: string;
  route: string;
  variant?: ActionVariant;
}

export interface ModuleProps {
  id?: string;
  code: string;
  name: string;
  description: string;
  iconUrl: string;
  route: string;
  accentColor: string;
  order: number;
  isActive: boolean;
  requiresAuth: boolean;
  secondaryAction?: SecondaryAction | null;
  isUnderMaintenance?: boolean;
  maintenanceMessage?: string | null;
  estimatedRecoveryTime?: string | null;
}

/**
 * Entidad de dominio pura Module (Arquitectura Hexagonal).
 * Totalmente libre de dependencias de TypeORM o NestJS.
 */
export class Module {
  private readonly _id?: string;
  private readonly _code: string;
  private _name: string;
  private _description: string;
  private _iconUrl: string;
  private _route: string;
  private _accentColor: string;
  private _order: number;
  private _isActive: boolean;
  private _requiresAuth: boolean;
  private _secondaryAction: SecondaryAction | null;
  private _isUnderMaintenance: boolean;
  private _maintenanceMessage: string | null;
  private _estimatedRecoveryTime: string | null;

  constructor(props: ModuleProps) {
    this._id = props.id;
    this._code = props.code;
    this._name = props.name;
    this._description = props.description;
    this._iconUrl = props.iconUrl;
    this._route = props.route;
    this._accentColor = props.accentColor;
    this._order = props.order;
    this._isActive = props.isActive;
    this._requiresAuth = props.requiresAuth;
    this._secondaryAction = props.secondaryAction ?? null;
    this._isUnderMaintenance = props.isUnderMaintenance ?? false;
    this._maintenanceMessage = props.maintenanceMessage ?? null;
    this._estimatedRecoveryTime = props.estimatedRecoveryTime ?? null;
  }

  get id(): string | undefined {
    return this._id;
  }

  get code(): string {
    return this._code;
  }

  get name(): string {
    return this._name;
  }

  get description(): string {
    return this._description;
  }

  get iconUrl(): string {
    return this._iconUrl;
  }

  get route(): string {
    return this._route;
  }

  get accentColor(): string {
    return this._accentColor;
  }

  get order(): number {
    return this._order;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  get requiresAuth(): boolean {
    return this._requiresAuth;
  }

  get secondaryAction(): SecondaryAction | null {
    return this._secondaryAction;
  }

  get isUnderMaintenance(): boolean {
    return this._isUnderMaintenance;
  }

  get maintenanceMessage(): string | null {
    return this._maintenanceMessage;
  }

  get estimatedRecoveryTime(): string | null {
    return this._estimatedRecoveryTime;
  }

  activate(): void {
    this._isActive = true;
  }

  deactivate(): void {
    this._isActive = false;
  }

  setMaintenance(
    isUnderMaintenance: boolean,
    message?: string | null,
    estimatedRecoveryTime?: string | null,
  ): void {
    this._isUnderMaintenance = isUnderMaintenance;
    this._maintenanceMessage = message !== undefined ? message : this._maintenanceMessage;
    this._estimatedRecoveryTime =
      estimatedRecoveryTime !== undefined ? estimatedRecoveryTime : this._estimatedRecoveryTime;
  }

  updateDetails(props: Partial<Omit<ModuleProps, 'id' | 'code'>>): void {
    if (props.name !== undefined) this._name = props.name;
    if (props.description !== undefined) this._description = props.description;
    if (props.iconUrl !== undefined) this._iconUrl = props.iconUrl;
    if (props.route !== undefined) this._route = props.route;
    if (props.accentColor !== undefined) this._accentColor = props.accentColor;
    if (props.order !== undefined) this._order = props.order;
    if (props.isActive !== undefined) this._isActive = props.isActive;
    if (props.requiresAuth !== undefined) this._requiresAuth = props.requiresAuth;
    if (props.secondaryAction !== undefined) this._secondaryAction = props.secondaryAction;
    if (props.isUnderMaintenance !== undefined) this._isUnderMaintenance = props.isUnderMaintenance;
    if (props.maintenanceMessage !== undefined) this._maintenanceMessage = props.maintenanceMessage;
    if (props.estimatedRecoveryTime !== undefined)
      this._estimatedRecoveryTime = props.estimatedRecoveryTime;
  }

  toObject(): ModuleProps {
    return {
      id: this._id,
      code: this._code,
      name: this._name,
      description: this._description,
      iconUrl: this._iconUrl,
      route: this._route,
      accentColor: this._accentColor,
      order: this._order,
      isActive: this._isActive,
      requiresAuth: this._requiresAuth,
      secondaryAction: this._secondaryAction,
      isUnderMaintenance: this._isUnderMaintenance,
      maintenanceMessage: this._maintenanceMessage,
      estimatedRecoveryTime: this._estimatedRecoveryTime,
    };
  }
}
