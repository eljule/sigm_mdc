export type ActionVariant = 'outline' | 'ghost' | 'solid';

export interface SecondaryAction {
  label: string;
  route: string;
  variant?: ActionVariant;
}

export interface ModuleProps {
  id: string;
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
}

/**
 * Entidad de dominio pura Module (Arquitectura Hexagonal).
 * Totalmente libre de dependencias de TypeORM o NestJS.
 */
export class Module {
  private readonly _id: string;
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
  }

  get id(): string {
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

  activate(): void {
    this._isActive = true;
  }

  deactivate(): void {
    this._isActive = false;
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
    };
  }
}
