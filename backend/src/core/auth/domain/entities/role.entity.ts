export interface RoleProps {
  id: string;
  name: string;
  code: string;
  description: string;
  subsystemCode: string; // 'GLOBAL' | 'central_dashboard' | 'transport_licenses' | 'it_inventory' | 'helpdesk_support'
  isSystem: boolean; // Si es rol del sistema protegido (ej: Administrador Central)
  permissionCodes: string[];
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Entidad de dominio pura Role.
 */
export class Role {
  private readonly _id: string;
  private _name: string;
  private _code: string;
  private _description: string;
  private _subsystemCode: string;
  private _isSystem: boolean;
  private _permissionCodes: string[];
  private _isActive: boolean;

  constructor(props: RoleProps) {
    this._id = props.id;
    this._name = props.name;
    this._code = props.code;
    this._description = props.description;
    this._subsystemCode = props.subsystemCode;
    this._isSystem = props.isSystem;
    this._permissionCodes = props.permissionCodes ?? [];
    this._isActive = props.isActive;
  }

  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get code(): string {
    return this._code;
  }

  get description(): string {
    return this._description;
  }

  get subsystemCode(): string {
    return this._subsystemCode;
  }

  get isSystem(): boolean {
    return this._isSystem;
  }

  get permissionCodes(): string[] {
    return [...this._permissionCodes];
  }

  get isActive(): boolean {
    return this._isActive;
  }

  updateDetails(name: string, description: string, subsystemCode: string): void {
    this._name = name;
    this._description = description;
    this._subsystemCode = subsystemCode;
  }

  assignPermissions(permissionCodes: string[]): void {
    this._permissionCodes = [...new Set(permissionCodes)];
  }

  hasPermission(permissionCode: string): boolean {
    if (this._code === 'admin_central' || this._name === 'Administrador Central') {
      return true;
    }
    return this._permissionCodes.includes(permissionCode);
  }

  toObject(): RoleProps {
    return {
      id: this._id,
      name: this._name,
      code: this._code,
      description: this._description,
      subsystemCode: this._subsystemCode,
      isSystem: this._isSystem,
      permissionCodes: this._permissionCodes,
      isActive: this._isActive,
    };
  }
}
